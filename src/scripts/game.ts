import "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";
import Boot from "./game/scenes/Boot";
import Game from "./game/scenes/Game";
import { resize } from "./util/extra";
import { FPS, HEIGHT, WIDTH } from "./util/globals";
import * as rexcharactercacheplugin from "./util/rexcharactercacheplugin.min.js";

const config = {
    type: Phaser.WEBGL,
    transparent: true,
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.NONE,
    },
    width: WIDTH,
    height: HEIGHT,
    scene: [Boot, Game],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 },
            fps: FPS,
        },
    },
    plugins: {
        scene: [
            {
                key: "SpinePlugin",
                plugin: window.SpinePlugin,
                mapping: "spine",
            },
        ],
    },
    callbacks: {
        postBoot: function (game: Phaser.Game) {
            const onResize = () => {
                resize(game, {
                    maxWidth: WIDTH,
                    maxHeight: HEIGHT,
                    minWidth: WIDTH * 0.95,
                    minHeight: HEIGHT * 0.95,
                });
            };

            onResize();
            window.addEventListener("resize", onResize);
            window.addEventListener("orientationchange", onResize);
        },
    },
    autoRound: true,
    desynchronized: true,
    inputActivePointers: 1,
    inputGamepad: false,
    inputKeyboard: false,
    powerPreference: "high-performance",
    premultipliedAlpha: true,
    saveDrawingBuffer: true,
};

window.addEventListener("load", () => {
    const game = new Phaser.Game(config);
    game.plugins.install(
        "rexcharactercacheplugin",
        rexcharactercacheplugin as any
    );
});
