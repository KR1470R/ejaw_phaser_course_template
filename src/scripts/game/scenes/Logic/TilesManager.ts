
import { grid_size } from "scripts/util/globals";
import { BetweenUnique, shuffleArray, removeItemAll } from "../../../util/extra";

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
    private tiles_map: Map<number, Tile[]> = new Map();
    private gridContainer?: Phaser.GameObjects.Container;

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
            this.tiles_map.set(row, column_tiles);
        }

        for (let i = 1; i <= 2; i++) {
            const newTile = this.createTileRandom();
            if (newTile) {
                gridContainer.add(newTile);
            } else {
                console.log("COULDN'T FIND NEW SPACE TILE!");
            }
        } 

        console.log(this.tiles_map)
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
        const freeTileColumn = (this.tiles_map.get(freePosMap.row) as Tile[]);
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
        this.tiles_map.set(freePosMap.row, freeTileColumn);

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
                let column = this.tiles_map.get(row);
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
        this.tiles_map.forEach((tiles => {
            tiles.forEach(async tile => {
                if (this.isTileNotEmpty(tile)) {
                    await this.moveToSpecificTileStep(tile, "right");
                }
            })
        }))
    }

    public async moveLeft() {
        this.tiles_map.forEach((tiles => {
            tiles.forEach(async tile => {
                if (this.isTileNotEmpty(tile)) {
                    await this.moveToSpecificTileStep(tile, "left");
                }
            })
        }))
    }

    public async moveUp() {
        this.tiles_map.forEach((tiles => {
            tiles.forEach(async tile => {
                if (this.isTileNotEmpty(tile)) {
                    await this.moveToSpecificTileStep(tile, "up");
                }
            })
        }))
    }

    public async moveDown() {
        this.tiles_map.forEach((tiles => {
            tiles.forEach(async tile => {
                if (this.isTileNotEmpty(tile)) {
                    await this.moveToSpecificTileStep(tile, "down");
                }
            })
        }))
    }

    private moveToSpecificTileStep(
        tile: Tile, 
        direction: Direction,
        tileStep = 1
    ) {
        return new Promise(resolve => {
            console.log('MOVE TILE:', tile.posMap);
            for (let step = 1; step <= tileStep; step++) {
                const neighborTile = this.defineNextPosTile(tile, direction);
                if (!neighborTile) {
                    resolve(0);
                    return;
                }

                this.scene.add.tween({
                    targets: tile.gameObject,
                    x: neighborTile.pos.x,
                    y: neighborTile.pos.y,
                    duration: 200,
                    ease: Phaser.Math.Easing.Elastic.InOut,
                    onComplete: () => {
                        this.swapTiles(tile, neighborTile);
                        resolve(1);
                    }
                });
            }
        })
    }

    private defineNextPosTile(tile: Tile, direction: Direction): Tile | undefined {
        const tileNeighbor = this.getNeighbor(tile, direction);
        console.log("tileNeighbor:", tileNeighbor);
        if (!tileNeighbor) return;

        return tileNeighbor;
    }

    private getNeighbor(tile: Tile, direction: Direction) {
        let neighborPos = {
            ...tile.posMap
        };

        switch(direction) {
            case "right":
                neighborPos = {
                    column: neighborPos.column + 1,
                    row: neighborPos.row,
                }
                break;
            case "left":
                neighborPos = {
                    column: neighborPos.column - 1,
                    row: neighborPos.row,
                }
                break;
            case "up":
                neighborPos = {
                    column: neighborPos.column,
                    row: neighborPos.row + 1,
                }
                break;
            case "down":
                neighborPos = {
                    column: neighborPos.column,
                    row: neighborPos.row - 1,
                }
                break;
            default:
                throw new Error("Uknown direction!");
        }
        // console.log("BEFORE", neighborPos)
        if (
            neighborPos.column > grid_size || 
            neighborPos.column < 0
        ) return;
        if (
            neighborPos.row > grid_size || 
            neighborPos.column < 0
        ) return;
        // console.log("before", neighborPos)
        const tileNeighbor = (this.tiles_map.get(neighborPos.row) as Tile[])
            .filter(tile => tile.posMap.column === neighborPos.column)[0];
        // console.log("after", tileNeighbor)
        if (!tileNeighbor || tileNeighbor.key !== -1) return;
        
        // console.log("neighbor:", tileNeighbor);
        return tileNeighbor;
    }

    private swapTiles(tile_old: Tile, tile_new: Tile) {
        const column = (this.tiles_map.get(tile_old.posMap.row) as Tile[]);
        const tile_old_temp = {
            id: tile_old.id,
            pos: tile_old.pos,
            posMap: tile_new.posMap,
            key: tile_old.key,
            gameObject: tile_old.gameObject
        }
        const tile_new_temp = {
            id: tile_new.id,
            pos: tile_new.pos,
            posMap: tile_old.posMap,
            key: tile_new.key,
            gameObject: tile_new.gameObject
        }

        column[column.indexOf(tile_old)] = tile_old_temp;
        column[column.indexOf(tile_new)] = tile_new_temp;

        this.tiles_map.set(tile_old.posMap.row, column);
    }

}