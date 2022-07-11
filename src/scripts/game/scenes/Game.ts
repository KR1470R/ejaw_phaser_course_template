import Button from "scripts/util/Button";
import {
    CENTER_X,
    CENTER_Y, dataStorage, HEIGHT
} from "scripts/util/globals";
import GameFieldContainer from "./Game/GameFIeldContainer";
import GameStatisticContainer from "./Game/GameStatisticContainer";
import TilesManager from "./Logic/TilesManager";

export default class Game extends Phaser.Scene {
    private statisticContainer!: GameStatisticContainer;
    private gameFieldContainer!: GameFieldContainer;
    private tilesManager!: TilesManager;
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
        this.keyUp = this.scene.scene.input.keyboard.addKey("UP");        
        this.keyDown = this.scene.scene.input.keyboard.addKey("DOWN");
        this.keyLeft = this.scene.scene.input.keyboard.addKey("LEFT");
        this.keyRight = this.scene.scene.input.keyboard.addKey("RIGHT");
    }

    public create() {
        this.create_game_titles();
        this.statisticContainer.create();
        this.gameFieldContainer.create();

        this.tilesManager.generateGrid(this.gameFieldContainer.container);

        // // Create atlas image
        // this.add.image(CENTER_X, 200, `game-atlas`, `font-9.png`);

        // // Create aseprite animation
        // this.add
        //     .sprite(CENTER_X, CENTER_Y - 220, "game-poof")
        //     .play({ key: "poof", repeat: -1 });

        // // Create spine animation
        // this.add.spine(CENTER_X, CENTER_Y, "game-coin").play("animation", true);

        // new Button(
        //     this.add.image(CENTER_X, CENTER_Y + 290, "ui-warning")
        // ).click((btn: Button, elm: Phaser.GameObjects.Image) => {
        //     if (elm.getData("tint")) {
        //         elm.clearTint();
        //         elm.setData("tint", 0);
        //     } else {
        //         elm.setTint(0xff00ff);
        //         elm.setData("tint", 1);
        //     }
        // });

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

        this.add.sprite(
            100,
            200,
            "sprite-tile"
        ).setScale(0.6)

        this.keyUp.on("down", () => console.log("UP"));
        this.keyDown.on("down", () => console.log("DOWN"));
        this.keyLeft.on("down", () => console.log("LEFT"));
        this.keyRight.on("down", () => console.log("RIGHT"))

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
