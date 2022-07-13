
import { grid_size } from "scripts/util/globals";
import { BetweenUnique, removeItemAll, shuffleArray } from "../../../util/extra";

type TilePosition = {
    x: number;
    y: number;
}

type TilePositionMap = {
    row: number;
    column: number;
}

type Tile = {
    id: number;
    pos: TilePosition;
    posMap: TilePositionMap;
    key: number; // 0 - empty tile, 4, 8, 16...
    gameObject: Phaser.GameObjects.GameObject,
}

type Direction = "right" | "left" | "up" | "down";

export default class TilesManager extends Phaser.GameObjects.Group{
    public scene!: Phaser.Scene;
    private tiles_grid: Map<number, Tile[]> = new Map();
    private gridContainer?: Phaser.GameObjects.Container;
    public inMove: boolean = false;

    constructor(scene: Phaser.Scene, ) {
        super(scene);
        this.scene = scene;
    }

    public generateBaseGrid(gridContainer: Phaser.GameObjects.Container) {
        this.gridContainer = gridContainer;
        for (let row = 1; row <= grid_size; row++) {
            const column_tiles: Tile[] = [];
            for (let column = 1; column <= grid_size; column++) {
                const tile = this.createEmptyTile(
                    -380 + (column * 150),
                    -370 + (row * 150)
                );
                column_tiles.push({
                    id: row,
                    pos: {
                        x: tile.x,
                        y: tile.y
                    },
                    posMap: {
                        column,
                        row
                    },
                    key: -1,
                    gameObject: tile
                })
                this.gridContainer.add(tile);
            }
            console.log(`row ${row}:`, column_tiles)
            this.tiles_grid.set(row, column_tiles);
        }

        for (let i = 1; i <= 1; i++) {
            const newTile = this.createTileRandom();
            if (newTile) {
                gridContainer.add(newTile);
            } else {
                console.log("COULDN'T FIND NEW SPACE TILE!");
            }
        } 

        console.log(this.tiles_grid)
    }

    private createEmptyTile(x: number, y: number) {
        return this.scene.add.image(
                x,
                y,
                "ui-emptytile"
            )
            .setScale(0.6)
            .setOrigin(0.5);
    }

    private createTileRandom() {
        const freePosMap = this.getFreeRandomSpaceMap();
        if (!freePosMap) return;
        const freeTileColumn = (this.tiles_grid.get(freePosMap.row) as Tile[]);
        const freeTile = freeTileColumn
            .filter(tile => tile.posMap.column === freePosMap.column)[0];
        const key = BetweenUnique(0, 1);
        const sprite = this.scene.add.sprite(
            freeTile.pos.x,
            freeTile.pos.y,
            "sprite-tile",
            key
        )
            .setScale(0.6)
            .setOrigin(0.5);

        // console.log(columnID);
        // console.log(freeTileColumn);
        // console.log(freePosMap);
        // console.log(freeTile);

        freeTile.key = key;
        freeTile.gameObject = sprite;
        freeTileColumn[freeTileColumn.indexOf(freeTile)] = freeTile;
        this.tiles_grid.set(freePosMap.row, freeTileColumn);

        return sprite;
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
                        console.log("free space:", isFreeTile.posMap);
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

    private isTileNotEmpty(tile: Tile) {
        if (tile.key >= 0) return true;
        else return false;
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

    private getBusyTile(): Tile | undefined {
        let busyTile: Tile | undefined;
        this.tiles_grid.forEach((tiles => {
            for (const tile of tiles) {
                if (this.isTileNotEmpty(tile)) 
                    busyTile = tile;
            }
        }));

        return busyTile;
    }

    private moveToSpecificTileStep(
        direction: Direction,
        tileStep = 1
    ) {
        if (this.inMove) return;
        return new Promise(resolve => {
            const tile = this.getBusyTile();
            
            if (!tile) {
                resolve(0);
                return;
            }

            for (let step = 1; step <= tileStep; step++) {
                const neighborTile = this.defineNextPosTile(tile, direction);
                if (!neighborTile) {
                    resolve(0);
                    return;
                }
                console.log("CURRENT TILE:", tile);
                console.log("CURRENT NEIGHBOR:", neighborTile);

                const scene = this.scene;
                if (tile.posMap.row === neighborTile.posMap.row) {
                    this.scene.tweens.addCounter({
                        from: tile.pos.x,
                        to: neighborTile.pos.x,
                        duration: 200,
                        ease: Phaser.Math.Easing.Expo.InOut,
                        onUpdate: (tween: any, target: any) => {
                            console.log(target.value)
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
                            console.log("MOVED FROM", tile.posMap, "TO", neighborTile.posMap);
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
                            console.log("MOVED FROM", tile.posMap, "TO", neighborTile.posMap);
                            resolve(1);
                        }
                    });  
                }
            }
        })
    }

    private defineNextPosTile(tile: Tile, direction: Direction): Tile | undefined {
        const tileNeighbor = this.getNeighbor(tile, direction);
        console.log("tileNeighbor:", tileNeighbor);
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

        console.log("BEFORE", neighborPos, direction);

        if (
            neighborPos.column > grid_size || 
            neighborPos.column <= 0
        ) return;
        if (
            neighborPos.row > grid_size || 
            neighborPos.row <= 0
        ) return;
        // console.log("before", neighborPos)
        const tileNeighbor = (this.tiles_grid.get(neighborPos.row) as Tile[])
            .filter(tile => {
                if (tile.posMap.column === neighborPos.column){
                    console.log("THIS COLUMN", tile.posMap.column, "ON ROW:", neighborPos.row)
                    return true;
                } else return false
            })[0];
        console.log("after", tileNeighbor)
        if (!tileNeighbor || tileNeighbor.key !== -1) return;
        
        // console.log("neighbor:", tileNeighbor);
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

        console.log("CURRENT MAP AFTER SWAP:", this.tiles_grid)
    }

    private defineOrientation(direction: Direction) {
        if (direction === "right" || direction === "left") return "horizontal";
        else return "vertical";
    }

}