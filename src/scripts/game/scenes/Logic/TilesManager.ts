
import { grid_size } from "scripts/util/globals";

export default class TilesManager extends Phaser.GameObjects.Group{
    public scene!: Phaser.Scene;

    constructor(scene: Phaser.Scene, ) {
        super(scene);
        this.scene = scene;
    }

    public generateGrid(gridContainer: Phaser.GameObjects.Container) {
        for (let i = 1; i <= grid_size; i++) {
            this.createHorizontalRow(gridContainer, -370 + (i * 150));
        }
    }

    private createHorizontalRow(gridContainer: Phaser.GameObjects.Container, y: number) {
        for (let i = 1; i <= grid_size; i++) {
            gridContainer.add(this.createEmptyTile(
                -380 + (i * 150),
                y
            ));
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