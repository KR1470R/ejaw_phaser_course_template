
import { grid_size } from "scripts/util/globals";

type Tile = {
    id: number;
    x: number;
    y: number; 
    key: number; // 0 - empty tile, 4, 8, 16...
}

export default class TilesManager extends Phaser.GameObjects.Group{
    public scene!: Phaser.Scene;
    private tiles_map: Map<number, Tile[]> = new Map();

    constructor(scene: Phaser.Scene, ) {
        super(scene);
        this.scene = scene;
    }

    public generateGrid(gridContainer: Phaser.GameObjects.Container) {
        for (let column = 1; column <= grid_size; column++) {
            const row_tiles: Tile[] = [];
            for (let row = 1; row <= grid_size; row++) {
                const tile = this.createEmptyTile(
                    -380 + (column * 150),
                    -370 + (row * 150)
                );
                row_tiles.push({
                    id: row,
                    x: tile.x,
                    y: tile.y,
                    key: 0
                })
                gridContainer.add(tile);
            }
            this.tiles_map.set(column, row_tiles);
        }
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
}