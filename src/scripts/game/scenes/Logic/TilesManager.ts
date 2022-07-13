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

        for (let i = 1; i <= 6; i++) {
            const newTile = this.tileConstructor.create(this.getFreeRandomSpaceMap())?.gameObject;
            if (newTile) {
                gridContainer.add(newTile);
            } else {
                console.log("COULDN'T FIND NEW SPACE TILE!");
            }
        } 
    }

    private getFreeRandomSpaceMap(): TilePositionMap | undefined {
        let rows: number[] = [];
        for (let i = 1; i <= grid_size; i++) {
            rows.push(i);
        }

        shuffleArray(rows);

        const iterateEachRow = () => {
            if (!rows.length) return 
            for (const row of rows) {
                let column = this.tiles_grid.get(row);
                if (column) {
                    shuffleArray(column);

                    const isFreeTile = (column as Tile[]).filter(tile => tile.key === -1)[0];
                    if (isFreeTile) {
                        return isFreeTile.posMap;
                    } else {
                        rows = removeItemAll(rows, row);
                        return iterateEachRow();
                    }
                } else return;
            }
        }

        return iterateEachRow();
    }

    public async moveRight() {
        await this.moveToSpecificTileStep("right");
    }

    public async moveLeft() {
        await this.moveToSpecificTileStep("left");
    }

    public async moveUp() {
        await this.moveToSpecificTileStep("up");
    }

    public async moveDown() {
        await this.moveToSpecificTileStep("down");
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

    private moveToSpecificTileStep(
        direction: Direction,
        tileStep = 1
    ) {
        if (this.inMove) return;
        return new Promise(resolve => {
            const tiles = this.getAllBusyTiles();
            
            if (!tiles.length) {
                resolve(0);
                return;
            }

            for (let step = 1; step <= tileStep; step++) {
                for (const tile of tiles) {
                    const neighborTile = this.defineNextPosTile(tile, direction);
                    if (!neighborTile) {
                        resolve(0);
                        continue;
                    }
    
                    const scene = this.scene;
                    if (tile.posMap.row === neighborTile.posMap.row) {
                        this.scene.tweens.addCounter({
                            from: tile.pos.x,
                            to: neighborTile.pos.x,
                            duration: 200,
                            ease: Phaser.Math.Easing.Expo.InOut,
                            onUpdate: (tween: any, target: any) => {
                                this.inMove = true;
                                scene.add.tween({
                                    targets: tile.gameObject,
                                    x: target.value,
                                    duration: 1,
                                    ease: Phaser.Math.Easing.Linear
                                })
                            },
                            onComplete: () => {
                                this.inMove = false;
                                this.swapTiles(tile, neighborTile, direction);
                                resolve(1);
                            }
                        });   
                    } else {
                        this.scene.tweens.addCounter({
                            from: tile.pos.y,
                            to: neighborTile.pos.y,
                            duration: 200,
                            ease: Phaser.Math.Easing.Expo.InOut,
                            onUpdate: (tween: any, target: any) => {
                                this.inMove = true;
                                scene.add.tween({
                                    targets: tile.gameObject,
                                    y: target.value,
                                    duration: 1,
                                    ease: Phaser.Math.Easing.Linear
                                })
                            },
                            onComplete: () => {
                                this.inMove = false;
                                this.swapTiles(tile, neighborTile, direction);
                                resolve(1);
                            }
                        });  
                    }
                }
            }
        })
    }

    private defineNextPosTile(tile: Tile, direction: Direction): Tile | undefined {
        const tileNeighbor = this.getNeighbor(tile, direction);

        if (!tileNeighbor) return;

        return tileNeighbor;
    }

    private defineNeighborPos(tilePosMap: TilePositionMap, direction: Direction): TilePositionMap {
        let neighborPos: TilePositionMap;

        switch(direction) {
            case "right":
                neighborPos = {
                    column: tilePosMap.column + 1,
                    row: tilePosMap.row,
                }
                return neighborPos;
            case "left":
                neighborPos = {
                    column: tilePosMap.column - 1,
                    row: tilePosMap.row,
                }
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
                }
                return neighborPos;
            default:
                throw new Error("Uknown direction!");
        }
    }

    private getNeighbor(tile: Tile, direction: Direction) {
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

        if (!tileNeighbor || tileNeighbor.key !== -1) return;
        
        return tileNeighbor;
    }

    private swapTiles(tile_old: Tile, tile_new: Tile, direction: Direction) {
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
                throw new Error("Uknown orientation!");
        }
    }

    private defineOrientation(direction: Direction) {
        if (direction === "right" || direction === "left") return "horizontal";
        else return "vertical";
    }

}