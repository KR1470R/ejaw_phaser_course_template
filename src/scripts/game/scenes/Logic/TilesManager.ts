
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
}

export default class TilesManager extends Phaser.GameObjects.Group{
    public scene!: Phaser.Scene;
    private tiles_map: Map<number, Tile[]> = new Map();

    constructor(scene: Phaser.Scene, ) {
        super(scene);
        this.scene = scene;
    }

    public generateBaseGrid(gridContainer: Phaser.GameObjects.Container) {
        for (let row = 1; row <= grid_size; row++) {
            const column_tiles: Tile[] = [];
            for (let column = 1; column <= grid_size; column++) {
                const tile = this.createEmptyTile(
                    -380 + (row * 150),
                    -370 + (column * 150)
                );
                column_tiles.push({
                    id: row,
                    pos: {
                        x: tile.x,
                        y: tile.y
                    },
                    posMap: {
                        row,
                        column
                    },
                    key: 0
                })
                gridContainer.add(tile);
            }
            this.tiles_map.set(row, column_tiles);
        }

        console.log(this.getFreeSpaceMap());
    }

    public generateFirstTiles(gridContainer: Phaser.GameObjects.Container) {
        
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

    private createTileRandom(x: number, y: number, id: number) {
        const randRow = BetweenUnique(1, 4);
        const randColumn = BetweenUnique(1, 4);

        return this.scene.add.sprite(
            x,
            y,
            "sprite-tile",
            id
        )
            .setScale(0.6)
            .setOrigin(0.5);
    }

    private getFreeSpaceMap() {
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
                res = (column as Tile[]).filter(tile => tile.key === 0)[0].posMap;
            }
        }
        return res;
    }
}