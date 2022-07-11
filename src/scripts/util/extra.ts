export class Swear {
    public state = "pending" as "pending" | "done" | "canceled" | "rejected";
    public promise: Promise<any>;

    private _cancel: boolean;
    private _resolve!: Function;
    private _reject!: Function;

    constructor() {
        this._cancel = false;

        this.promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    cancel = () => {
        this._cancel = true;
        this.state = "canceled";
    };

    resolve = (data?: any) => {
        if (this._cancel) return;
        this.state = "done";
        this._resolve(data);
    };

    reject = (data?: any) => {
        if (this._cancel) return;
        this.state = "rejected";
        this._reject(data);
    };
}

export class List extends Array {
    constructor(i: number, callback = Function("i", "return i;")) {
        super();
        return Array.from({ length: i }, (e, i) => callback(i));
    }
}

export const resize = (
    game: Phaser.Game,
    config: {
        maxWidth: number;
        maxHeight: number;
        minWidth: number;
        minHeight: number;
        callback?: Function;
    }
) => {
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;

    const { maxWidth, maxHeight, minWidth, minHeight, callback } = config;

    const maxRatio = maxWidth / minHeight;
    const currentMaxWidth = innerHeight * maxRatio;
    const currentMinWidth = currentMaxWidth * (minWidth / maxWidth);

    const currentWidth =
        innerWidth < currentMinWidth ? innerWidth : currentMinWidth;
    const currentHeight =
        currentWidth < currentMinWidth
            ? currentWidth / (minWidth / minHeight)
            : innerHeight;

    const zoom = currentHeight / minHeight;

    game.scale.setZoom(zoom);

    const width = maxWidth;
    const height = Math.max(
        minHeight + (currentMinWidth - currentWidth),
        maxHeight
    );

    game.scale.setGameSize(width, height);

    (() => {
        const h = +game.canvas.style.height.replace("px", "");
        const offsetY = innerHeight > h ? 1 : innerHeight / h;

        callback && callback({ offsetY, zoom, currentWidth, currentMinWidth });
    })();
};

export const BetweenUnique = (min: number, max: number, not?: number) => {
    let res = Phaser.Math.Between(min, max);
    if (res === not) return BetweenUnique(min, max, not);
    else return res;
}

export function shuffleArray(array: any) {
    if (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
