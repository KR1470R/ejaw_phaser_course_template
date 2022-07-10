import Button from "scripts/util/Button";
import {
    CENTER_X,
    CENTER_Y, dataStorage, HEIGHT
} from "scripts/util/globals";
import GameFieldContainer from "./Game/GameFIeldContainer";
import GameStatisticContainer from "./Game/GameStatisticContainer";

export default class Game extends Phaser.Scene {
    private statisticContainer!: GameStatisticContainer;
    private gameFieldContainer!: GameFieldContainer;

    constructor() {
        super({ key: "Game" });
    }

    public init() {
        this.statisticContainer = new GameStatisticContainer(this);
        this.gameFieldContainer = new GameFieldContainer(this);
    }

    public create() {
        this.create_game_titles();
        this.statisticContainer.create();
        this.gameFieldContainer.create();

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
