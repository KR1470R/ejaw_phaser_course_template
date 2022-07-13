import {
    Tile, TilePositionMap, TilePosition
} from "scripts/util/globals";
import { BetweenUnique, removeItemAll, shuffleArray } from "../../../util/extra";
export default class TileConstructor {
    
    private scene!: Phaser.Scene;
    private tiles_grid!: Map<number, Tile[]>;

    constructor(scene: Phaser.Scene, tiles_grid: Map<number, Tile[]>) {
        this.scene = scene;
        this.tiles_grid = tiles_grid;
    }

    public create(posMap: TilePositionMap | undefined): Tile | undefined {
        if (!posMap) return;

        const freeTileColumn = (this.tiles_grid.get(posMap.row) as Tile[]);
        const freeTile = freeTileColumn
            .filter(tile => tile.posMap.column === posMap.column)[0];
        const key = BetweenUnique(0, 1);
        const sprite = this.scene.add.sprite(
            freeTile.pos.x,
            freeTile.pos.y,
            "sprite-tile",
            key
        )
            .setScale(0.6)
            .setOrigin(0.5);

        freeTile.key = key;
        freeTile.gameObject = sprite;
        freeTileColumn[freeTileColumn.indexOf(freeTile)] = freeTile;
        this.tiles_grid.set(posMap.row, freeTileColumn);

        return freeTile;
    }

    public createEmpty(pos: TilePosition, posMap: TilePositionMap): Tile {
        const emptyTile = this.scene.add.image(
                pos.x,
                pos.y,
                "ui-emptytile"
            )
                .setScale(0.6)
                .setOrigin(0.5);

        return {
            id: posMap.row,
            pos: {
                x: pos.x,
                y: pos.y
            },
            posMap: {
                column: posMap.column,
                row: posMap.row
            },
            key: -1,
            gameObject: emptyTile
        }
    }

    public isTileNotEmpty(tile: Tile) {
        if (tile.key >= 0) return true;
        else return false;
    }
}