import Button from "scripts/util/Button";
import {
    CENTER_X,
    CENTER_Y, dataStorage, HEIGHT
} from "scripts/util/globals";
import GameFieldContainer from "./Game/GameFIeldContainer";
import GameStatisticContainer from "./Game/GameStatisticContainer";
import { ScoreController } from "./Logic/ScoreController";
import TilesManager from "./Logic/TilesManager";

export default class Game extends Phaser.Scene {
    private statisticContainer!: GameStatisticContainer;
    private gameFieldContainer!: GameFieldContainer;
    private tilesManager!: TilesManager;
    private scoreController!: ScoreController;
    private keyUp!: Phaser.Input.Keyboard.Key; 
    private keyDown!: Phaser.Input.Keyboard.Key;
    private keyLeft!: Phaser.Input.Keyboard.Key;
    private keyRight!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: "Game" });
    }

    public init() {
        this.statisticContainer = new GameStatisticContainer(this);
        this.gameFieldContainer = new GameFieldContainer(this);
        this.tilesManager = new TilesManager(this);
        const allScoresLabels = this.statisticContainer.create();
        this.scoreController = new ScoreController(
            allScoresLabels.scoreLabel, 
            allScoresLabels.bestScoreLabel
        );

        this.keyUp = this.scene.scene.input.keyboard.addKey("UP");        
        this.keyDown = this.scene.scene.input.keyboard.addKey("DOWN");
        this.keyLeft = this.scene.scene.input.keyboard.addKey("LEFT");
        this.keyRight = this.scene.scene.input.keyboard.addKey("RIGHT");
    }

    public create() {
        this.create_game_titles();
        
        this.gameFieldContainer.create();

        this.tilesManager.generateBaseGrid(this.gameFieldContainer.container);

        new Button(
            this,
            "New Game",
            CENTER_X,
            HEIGHT - 200,
            150,
            70,
            10
        ).click(() => {
            console.log("Game restored.")
        });

        this.keyUp.on("down", async () => await this.tilesManager.moveUp());
        this.keyDown.on("down", async () => await this.tilesManager.moveDown());
        this.keyLeft.on("down", async () => await this.tilesManager.moveLeft());
        this.keyRight.on("down", async () => await this.tilesManager.moveRight());

        this.create_fps();
    }

    private create_game_titles() {
        this.add.image(CENTER_X, CENTER_Y, "ui-background-tile");

        this.add.text(
            100,
            200,
            "2048",
            {
                fontFamily:"Uni_Sans_Heavy",
                color: "#776e65",
                fontSize: "100px"
            }
        );

        this.add.text(
            100,
            330,
            "Join the numbers and get to the 2048 tile!",
            {
                fontFamily:"Uni_Sans_Heavy",
                color: "#938c82",
                fontSize: "30px"
            }
        );
    }

    private create_fps() {
        const fpsText = this.add
            .bitmapText(100, 100, "Uni_Sans_Heavy")
            .setOrigin(0.5);
            
        dataStorage.bitmaps["Uni_Sans_Heavy"].overrideBitmapText(
            fpsText
        );

        this.events.on("render", function (targetScene: any, duration: any) {
            if (!fpsText.visible) return;
            fpsText.setText(
                `FPS: ${Math.max(
                    Math.trunc(targetScene.game.loop.actualFps),
                    30
                )}`
            );
        });
    }
}
