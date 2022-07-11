import {
    CENTER_X,
    CENTER_Y,
    dataStorage,
    soundManager
} from "../../util/globals";
import * as configs from "./Boot/config";

export default class Boot extends Phaser.Scene {
    constructor() {
        super({
            key: "Boot",
            pack: {
                files: [
                    {
                        type: "image",
                        key: "loading-background",
                        url: "assets/image/loading/background.png",
                    },
                    {
                        type: "image",
                        key: "loading-fill",
                        url: "assets/image/loading/loading-fill.png",
                    },
                    {
                        type: "image",
                        key: "loading-fill-bk",
                        url: "assets/image/loading/loading-fill-bk.png",
                    },
                    {
                        type: "image",
                        key: "loading-frame",
                        url: "assets/image/loading/loading-frame.png",
                    },
                ],
            },
        });
    }

    public preload() {
        this.createBackground();
        this.createLoaderBar();

        const load = [] as string[][];
        for (let type in configs) {
            for (let key in configs[type]) {
                for (let frame in configs[type][key]) {
                    load.push([type, key, configs[type][key][frame]]);
                }
            }
        }

        load.forEach((data) => {
            const [type, key, frame] = data;
            const folder = `assets/${type}/${key}`;
            const path = `${folder}/${frame}`;

            console.log(path)

            if (type === "image") {
                this.load[type](`${key}-${frame}`, `${path}.png`);
            }

            if (type === "audio") {
                this.load[type](`${key}-${frame}`, [path]);
            }

            if (type === "spritesheet") {
                console.log(path)
                this.load[type](
                    "sprite-tile", 
                    `${path}.png`, 
                    { 
                        frameWidth: 200, 
                        frameHeight: 200, 
                        // endFrame: 23 
                    }
                );
            }

        });
    }

    public create() {
        this.initFonts();
        soundManager.init(this.sound);

        this.time.delayedCall(50, () => {
            this.scene.start("Game");
        });
    }

    private initFonts() {
        const cachePlugin = this.plugins.get("rexcharactercacheplugin") as any;

        dataStorage.bitmaps["Uni_Sans_Heavy"] = cachePlugin.add(this, {
            key: "Uni_Sans_Heavy",

            cellWidth: 32,
            cellHeight: 32,
            maxCharacterCount: 4096,

            textObject: this.make.text({
                add: false,
                style: {
                    fontFamily: "Uni_Sans_Heavy",
                    fontSize: "24px",
                    stroke: "0xffffff",
                    color: "#c3ff31",
                    strokeThickness: 4,
                    testString: "回",
                },
            }),
        });
    }

    private createBackground() {
        this.add.sprite(CENTER_X, CENTER_Y, "loading-background");
    }

    private createLoaderBar() {
        const [x, y] = [CENTER_X, CENTER_Y];

        this.add.sprite(x, y, "loading-fill-bk");
        const filler = this.add.sprite(x, y, "loading-fill");
        const frame = this.add.sprite(x, y, "loading-frame");

        const [width, height] = [frame.width, frame.height];
        const mask = this.add
            .rectangle(x - width / 2, y, 0, height, 0xffffff, 1)
            .setOrigin(0, 0.5)
            .setVisible(false);

        filler.mask = new Phaser.Display.Masks.BitmapMask(this, mask);

        this.load.on(
            "progress",
            (value: number) => {
                this.tweens.add({
                    targets: [mask],
                    width: value * frame.width,
                    duration: 200,
                });
            },
            this
        );
    }
}
