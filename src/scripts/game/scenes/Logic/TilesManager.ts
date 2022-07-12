
import { grid_size } from "scripts/util/globals";
import { BetweenUnique, shuffleArray } from "../../../util/extra";

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

        gridContainer.add(this.createTileRandom());
        gridContainer.add(this.createTileRandom());

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
        const freeTileColumn = (this.tiles_map.get(freePosMap.row) as Tile[]);
        const columnID = freePosMap.column - 1;
        const freeTile = freeTileColumn[columnID];
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
        freeTileColumn[columnID] = freeTile;
        this.tiles_map.set(freePosMap.row, freeTileColumn);

        return sprite;
    }

    private getFreeRandomSpaceMap() {
        let rows: number[] = [];
        for (let i = 1; i <= grid_size; i++) {
            rows.push(i);
        }

        shuffleArray(rows);
        
        let res;
        for (let row = 0; row <= rows.length; row++) {
            let column = this.tiles_map.get(rows[row]);
            if (column) {
                shuffleArray(column);
                res = (column as Tile[]).filter(tile => tile.key === -1)[0].posMap;
            }
        }
        console.log("freespace", res)
        return res;
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
                    await this.moveToSpecificTileStep(tile, "up");
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
            for (let step = 0; step <= tileStep; step++) {
                const neighborTile = this.defineNextPosTile(tile, direction);
                if (!neighborTile) return resolve(0);
                this.swapTiles(tile, neighborTile);
                console.log(this.tiles_map);
    
                this.scene.add.tween({
                    targets: tile.gameObject,
                    x: neighborTile.pos.x,
                    y: neighborTile.pos.y,
                    duration: 200,
                    onComplete: () => {
                        console.log("'ve moved");
                        resolve(1);
                    }
                });
            }
        })
    }

    private defineNextPosTile(tile: Tile, direction: Direction): Tile | null {
        const tileNeighbor = this.getNeighbor(tile, direction);

        if (!tileNeighbor) return null;

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
        ) return null;
        if (
            neighborPos.row > grid_size || 
            neighborPos.column < 0
        ) return null;
        // console.log("before", neighborPos)
        const tileNeighbor = (this.tiles_map.get(neighborPos.row) as Tile[])
            .filter(tile => tile.posMap.column === neighborPos.column)[0];
        // console.log("after", tileNeighbor)
        if (tileNeighbor.key !== -1) return null;
        
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
        // console.log("swapTiles before:", column);

        column[column.indexOf(tile_old)] = tile_old_temp;
        column[column.indexOf(tile_new)] = tile_new_temp;

        // console.log("swapTiles after:", column);
        this.tiles_map.set(tile_old.posMap.row, column);
    }

}