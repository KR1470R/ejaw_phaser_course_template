
import {
    CENTER_X,
    CENTER_Y, grid_size
} from "../../../util/globals";

export default class GameFieldContainer extends Phaser.GameObjects.Container {

    private backgroundContainer!: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene = scene;
        this.setDepth(3);
        this.setVisible(true);

        console.log("Grid size:", grid_size);

        scene.add.existing(this);
    }

    public create() {
        this.createGameFieldBackgroundContainer();
    }

    public createGameFieldBackgroundContainer() {
        const length_side = 650;

        this.backgroundContainer = this.scene.add
            .container(
                CENTER_X,
                CENTER_Y + 50
            );
        
        const backgroundGraphics = this.scene.add.graphics()
            .fillStyle(0xbbada0, 1)
            .fillRoundedRect(
                -length_side / 2, 
                -length_side / 2, 
                length_side, 
                length_side, 
                10
            );
        
        this.backgroundContainer.add(backgroundGraphics);

        this.add(this.backgroundContainer);
    }

}