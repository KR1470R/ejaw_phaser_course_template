import Sound from "scripts/game/Sound";

export const FPS = 10;

export const WIDTH = 854;
export const HEIGHT = 1390;

export const CENTER_X = WIDTH / 2;
export const CENTER_Y = HEIGHT / 2;

export const eventManager = new Phaser.Events.EventEmitter();
export const soundManager = new Sound();

export const dataStorage = {
    bitmaps: {},
};

export let score = 0;
export let best_score = 0;

export const base_text_style = {
    fontFamily:"Uni_Sans_Heavy",
    color: "black",
};

export const grid_size = 4;

export const tileKeys: object = {
    0: 2,
    1: 4,
    2: 8,
    3: 16,
    4: 32,
    5: 64,
    6: 128,
    7: 256,
    8: 512,
    9: 1024,
    10: 2048,
    11: 4096
}

export type TilePosition = {
    x: number;
    y: number;
}

export type TilePositionMap = {
    row: number;
    column: number;
}

export type Tile = {
    id: number;
    pos: TilePosition;
    posMap: TilePositionMap;
    key: number; // 0 - empty tile, 4, 8, 16...
    gameObject: Phaser.GameObjects.GameObject,
}

export type Direction = "right" | "left" | "up" | "down";