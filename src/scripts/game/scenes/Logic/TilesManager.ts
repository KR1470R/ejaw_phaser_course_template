import {
    Direction, grid_size,
    Tile, TilePositionMap
} from "scripts/util/globals";
import { removeItemAll, shuffleArray } from "../../../util/extra";
import TileConstructor from "./TileConstructor";

export default class TilesManager extends Phaser.GameObjects.Group {
    public scene!: Phaser.Scene;
    private tiles_grid: Map<number, Tile[]> = new Map();
    private gridContainer?: Phaser.GameObjects.Container;
    private tileConstructor!: TileConstructor;
    public inMove: boolean = false;

    constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene = scene;
        this.tileConstructor = new TileConstructor(this.scene, this.tiles_grid);
    }

    public generateBaseGrid(gridContainer: Phaser.GameObjects.Container) {
        this.gridContainer = gridContainer;
        for (let row = 1; row <= grid_size; row++) {
            const column_tiles: Tile[] = [];
            for (let column = 1; column <= grid_size; column++) {
                const tile = this.tileConstructor.createEmpty(
                    {
                        x: -380 + (column * 150),
                        y: -370 + (row * 150)
                    },
                    {
                        row,
                        column
                    }
                );

                column_tiles.push(tile)
                this.gridContainer.add(tile.gameObject);
            }

            this.tiles_grid.set(row, column_tiles);
        }

        for (let i = 1; i <= 4; i++) {
            const newTile = this.tileConstructor.create(this.getFreeRandomSpaceMap())?.gameObject;
            if (newTile) {
                gridContainer.add(newTile);
            } else {
                console.log("COULDN'T FIND NEW SPACE TILE!");
            }
        } 
    }

    public async moveRight() {
        await this.moveTillTheEnd("right");
    }

    public async moveLeft() {
        await this.moveTillTheEnd("left");
    }

    public async moveUp() {
        await this.moveTillTheEnd("up");
    }

    public async moveDown() {
        await this.moveTillTheEnd("down");
    }

    private moveTillTheEnd(
        direction: Direction
    ) {
        if (this.inMove) return;
        return new Promise(resolve => {
            const tiles = this.getAllBusyTiles();
            if (!tiles.length) {
                resolve(0);
                return;
            }

            for (const tile of tiles) {
                const freeNeighbors: Tile[] = this.getAllFreeNeighbors(tile, direction);
                if (!freeNeighbors.length) continue;

                const freeNeighbor = freeNeighbors[freeNeighbors.length - 1];
                const scene = this.scene;
                let result_coord: {
                    from: number;
                    to: number;
                    callbackTrajectory: (value: number) => { x: number, y: number };
                };
                if (tile.posMap.row === freeNeighbor.posMap.row) {
                    result_coord = {
                        from: tile.pos.x,
                        to: freeNeighbor.pos.x,
                        callbackTrajectory: (value: number) => Object.assign({ x: value, y: 0 })
                    }
                } else {
                    result_coord = {
                        from: tile.pos.y,
                        to: freeNeighbor.pos.y,
                        callbackTrajectory: (value: number) => Object.assign({ y: value, x: 0 })
                    }
                }
                this.swapTiles(tile, freeNeighbor, direction)
                    .then(() => {
                        this.scene.tweens.addCounter({
                            from: result_coord.from,
                            to: result_coord.to,
                            duration: 100,
                            ease: Phaser.Math.Easing.Expo.InOut,
                            onUpdate: (tween: any, target: any) => {
                                this.inMove = true;
                                const axis = result_coord.callbackTrajectory(target.value);
                                if (axis.x ) (tile.gameObject as Phaser.GameObjects.Sprite).x = axis.x;
                                else (tile.gameObject as Phaser.GameObjects.Sprite).y = axis.y;
                            },
                            onComplete: async () => {
                                this.inMove = false;
                                this.moveTillTheEnd(direction);
                            }
                        });
                    })
                    .catch(err => new Error(err));
            }
            
        })
    }

    private getFreeRandomSpaceMap(): TilePositionMap | undefined {
        let rows: number[] = [];
        for (let i = 1; i <= grid_size; i++) {
            rows.push(i);
        }

        shuffleArray(rows);

        const iterateEachRow = () => {
            if (!rows.length) return;
            for (const row of rows) {
                let column = this.tiles_grid.get(row);
                if (column) {
                    shuffleArray(column);

                    const isFreeTile = (column as Tile[]).filter(tile => tile.key === -1)[0];
                    if (isFreeTile) return isFreeTile.posMap;
                    else {
                        rows = removeItemAll(rows, row);
                        return iterateEachRow();
                    }
                } else return;
            }
        }

        return iterateEachRow();
    }

    private getAllBusyTiles(): Tile[] | [] {
        const busyTiles: Tile[] | [] = [];

        this.tiles_grid.forEach((tiles => {
            for (const tile of tiles) {
                if (this.tileConstructor.isTileNotEmpty(tile)) 
                    busyTiles.push(tile as never);
            }
        }));

        return busyTiles;
    }

    private defineNeighborPos(tilePosMap: TilePositionMap, direction: Direction): TilePositionMap {
        let neighborPos: TilePositionMap;

        switch(direction) {
            case "right":
                neighborPos = {
                    column: tilePosMap.column + 1,
                    row: tilePosMap.row,
                };
                return neighborPos;
            case "left":
                neighborPos = {
                    column: tilePosMap.column - 1,
                    row: tilePosMap.row,
                };
                return neighborPos;
            case "up":
                neighborPos = {
                    column: tilePosMap.column,
                    row: tilePosMap.row - 1,
                }
                return neighborPos;
            case "down":
                neighborPos = {
                    column: tilePosMap.column,
                    row: tilePosMap.row + 1,
                };
                return neighborPos;
            default:
                throw new Error("Uknown direction!");
        }
    }

    private getNeighbor(tile: Tile, direction: Direction, typeTile: "free" | "busy") {
        let neighborPos = this.defineNeighborPos(tile.posMap, direction);

        if (
            neighborPos.column > grid_size || 
            neighborPos.column <= 0
        ) return;
        if (
            neighborPos.row > grid_size || 
            neighborPos.row <= 0
        ) return;

        const tileNeighbor = (this.tiles_grid.get(neighborPos.row) as Tile[])
            .filter(tile => {
                if (tile.posMap.column === neighborPos.column) return true;
                else return false;
            })[0];
        
        if (!tileNeighbor) return;

        if (
            typeTile === "free" && 
            tileNeighbor.key !== -1
        ) return;

        if (
            typeTile === "busy" &&
            tileNeighbor.key === -1
        ) return;
        
        return tileNeighbor;
    }

    private swapTiles(tile_old: Tile, tile_new: Tile, direction: Direction) {
        return new Promise((resolve, reject) => {
            const orientation = this.defineOrientation(direction);

            const tile_old_temp = {
                id: tile_old.id,
                pos: tile_new.pos,
                posMap: tile_new.posMap,
                key: tile_old.key,
                gameObject: tile_old.gameObject
            }
            const tile_new_temp = {
                id: tile_new.id,
                pos: tile_old.pos,
                posMap: tile_old.posMap,
                key: tile_new.key,
                gameObject: tile_new.gameObject
            }
    
            switch (orientation) {
                case "horizontal":
                    const column = (this.tiles_grid.get(tile_old.posMap.row) as Tile[]);
    
                    column[column.indexOf(tile_old)] = tile_old_temp;
                    column[column.indexOf(tile_new)] = tile_new_temp;
            
                    this.tiles_grid.set(tile_old.posMap.row, column);
                    break;
                case "vertical":
                    const column_old = (this.tiles_grid.get(tile_old.posMap.row) as Tile[]);
                    const column_new = (this.tiles_grid.get(tile_new.posMap.row) as Tile[]);
    
                    column_old[column_old.indexOf(tile_old)] = tile_new_temp;
                    column_new[column_new.indexOf(tile_new)] = tile_old_temp;
    
                    this.tiles_grid.set(tile_old.posMap.row, column_old);
                    this.tiles_grid.set(tile_new.posMap.row, column_new);
                    break;
                default:
                    reject(new Error("Uknown orientation!"));
            }
            this.scene.time.delayedCall(10, () => resolve(1));
        })
    }

    private defineOrientation(direction: Direction) {
        if (direction === "right" || direction === "left") return "horizontal";
        else return "vertical";
    }

    private getAllFreeNeighbors(tile: Tile, direction: Direction) {
        const getAllFreeNeighbors: Tile[] = [];
        let last_neighbor: Tile | undefined;

        const get_neighbor = (): Tile[]  => {
            const temp = this.getNeighbor(
                last_neighbor ? last_neighbor : tile, 
                direction,
                "free"
            );
            if (temp) {
                last_neighbor = temp;
                getAllFreeNeighbors.push(temp);
                return get_neighbor();
            } else return getAllFreeNeighbors;
        }
        return get_neighbor();
    }
}
