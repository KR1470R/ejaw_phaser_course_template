
import {
    base_text_style,
    best_score,
    score, WIDTH
} from "../../../util/globals";

export default class GameStatisticContainer extends Phaser.GameObjects.Container {
    private currentScoreContainer!: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene = scene;
        this.setDepth(3);
        this.setVisible(true);

        scene.add.existing(this);
    }

    public create() {
        return {
            scoreLabel: this.createCurrentScoreContainer(),
            bestScoreLabel: this.createBestScoreContainer(),
        };
    }

    public createCurrentScoreContainer() {
        this.currentScoreContainer = this.scene.add.container(
            WIDTH - 300,
            250
        );

        const backgroundContainer = this.scene.add.graphics()
            .fillStyle(0xbbada0, 1)
            .fillRoundedRect(
                -50,
                -50,
                100,
                100,
                10
            );

        const titleContainer = this.scene.add.text(
            0,
            -10,
            "SCORE",
            {
                ...base_text_style,
                fontSize: "25px",
                color: "white"
            }
        ).setOrigin(0.5);

        const scoreText = this.scene.add.text(
            0,
            titleContainer.y + 30,
            score.toString(),
            {
                ...base_text_style,
                fontSize: "30px",
                color: "white"
            }
        ).setOrigin(0.5);

        this.currentScoreContainer.add([
            backgroundContainer,
            titleContainer,
            scoreText
        ]);

        this.add(this.currentScoreContainer);

        return scoreText;
    }

    public createBestScoreContainer() {
        this.currentScoreContainer = this.scene.add.container(
            WIDTH - 150,
            250
        );

        const backgroundContainer = this.scene.add.graphics()
            .fillStyle(0xbbada0, 1)
            .fillRoundedRect(
                -50,
                -50,
                100,
                100,
                10
            );

        const titleContainer = this.scene.add.text(
            0,
            -10,
            "BEST",
            {
                ...base_text_style,
                fontSize: "25px",
                color: "white"
            }
        ).setOrigin(0.5);

        const bestScoreText = this.scene.add.text(
            0,
            titleContainer.y + 30,
            best_score.toString(),
            {
                ...base_text_style,
                fontSize: "30px",
                color: "white"
            }
        ).setOrigin(0.5);

        this.currentScoreContainer.add([
            backgroundContainer,
            titleContainer,
            bestScoreText
        ]);

        this.add(this.currentScoreContainer);

        return bestScoreText;
    }
}