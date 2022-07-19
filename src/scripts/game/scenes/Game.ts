import Button from "scripts/util/Button";
import {
    CENTER_X,
    CENTER_Y, dataStorage, eventManager, HEIGHT
} from "scripts/util/globals";
import GameFieldContainer from "./Game/GameFIeldContainer";
import GameStatisticContainer from "./Game/GameStatisticContainer";
import WinContainer from "./Game/WinContainer";
import GameOverContainer from "./Game/GameOverContainer";
import { ScoreController } from "./Logic/ScoreController";
import TilesManager from "./Logic/TilesManager";

export default class Game extends Phaser.Scene {
    private statisticContainer!: GameStatisticContainer;
    private gameFieldContainer!: GameFieldContainer;
    private winContainer!: WinContainer;
    private gameOverContainer!: GameOverContainer;
    private tilesManager!: TilesManager;
    private scoreController!: ScoreController;
    private keyUp!: Phaser.Input.Keyboard.Key; 
    private keyDown!: Phaser.Input.Keyboard.Key;
    private keyLeft!: Phaser.Input.Keyboard.Key;
    private keyRight!: Phaser.Input.Keyboard.Key;
    private stop: boolean = false;

    constructor() {
        super({ key: "Game" });
    }

    public init() {
        this.statisticContainer = new GameStatisticContainer(this);
        this.gameFieldContainer = new GameFieldContainer(this);
        this.winContainer = new WinContainer(this);
        this.gameOverContainer = new GameOverContainer(this);
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

        this.tilesManager.init(this.gameFieldContainer.container);

        this.newGame();

        new Button(
            this,
            "New Game",
            CENTER_X,
            HEIGHT - 200,
            150,
            70,
            10
        ).click(() => this.newGame());

        eventManager.on("win", () => {
            if (this.stop) return;
            this.stop = true;
            this.winGame();
        });

        eventManager.on("over", () => {
            if (this.stop) return;
            this.stop = true;
            this.gameOver();
        });

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

    private async newGame() {
        this.scoreController.resetCurrentScore();

        this.tilesManager.clearTilesGrid();

        this.tilesManager.generateBaseGrid();

        await this.winContainer.deleteWinContainer();

        await this.gameOverContainer.deleteGameOverContainer();

        this.bindAllKeys();
        
        this.stop = false;
    }

    private winGame() {
        this.unbindAllKeys();
        this.winContainer.create();
    }

    private gameOver() {
        this.unbindAllKeys();
        this.gameOverContainer.create();
    }

    private bindAllKeys() {
        this.keyUp.on("down", async () => await this.tilesManager.moveUp());
        this.keyDown.on("down", async () => await this.tilesManager.moveDown());
        this.keyLeft.on("down", async () => await this.tilesManager.moveLeft());
        this.keyRight.on("down", async () => await this.tilesManager.moveRight());
    }

    private unbindAllKeys() {
        this.keyUp.removeAllListeners("down");
        this.keyDown.removeAllListeners("down");
        this.keyLeft.removeAllListeners("down");
        this.keyRight.removeAllListeners("down");
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
