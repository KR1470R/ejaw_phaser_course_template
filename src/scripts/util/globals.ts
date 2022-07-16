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

export type TilePosition = {
    x: number;
    y: number;
};

export type TilePositionMap = {
    row: number;
    column: number;
};

export type Tile = {
    id: number;
    pos: TilePosition;
    posMap: TilePositionMap;
    key: number; // -1 - empty tile, 1 - 2, 2 - 4, 3 - 16...
    gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
};

export type Direction = "right" | "left" | "up" | "down";

export type Orientation = "horizontal" | "vertical";

export type AnimationCoordinats = {
    from: number;
    to: number;
    callbackTrajectory: (value: number) => { x: number, y: number };
};

export const defineOrientation = (direction: Direction): Orientation => {
    if (direction === "right" || direction === "left") return "horizontal";
    else return "vertical";
};
