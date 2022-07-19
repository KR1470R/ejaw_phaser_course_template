import {
    Tile, 
    TilePositionMap, 
    TilePosition,
} from "scripts/util/globals";
import { 
    BetweenUnique, 
    removeItemOnce, 
    shuffleArray, 
    getRandomInt 
} from "../../../util/extra";
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
            .setDepth(2)
            .setScale(0.6)
            .setOrigin(0.5);

        this.scene.tweens.addCounter({
            from: sprite.scale * 100, // 60
            to: 70,
            duration: 100,
            ease: Phaser.Math.Easing.Bounce.In,
            onUpdate: (tween: any, target: any) => {
                sprite.setScale(target.value / 100);
            },
            onComplete: () => {
                this.scene.tweens.addCounter({
                    from: sprite.scale * 100, // 80
                    to: 60,
                    duration: 100,
                    ease: Phaser.Math.Easing.Bounce.Out,
                    onUpdate: (tween: any, target: any) => {
                        sprite.setScale(target.value / 100);
                    }
                });
            }
        });

        freeTile.key = key;
        freeTile.gameObject = sprite;
        freeTileColumn[freeTileColumn.indexOf(freeTile)] = freeTile;
        this.tiles_grid.set(posMap.row, freeTileColumn);

        return freeTile;
    }

    public createEmpty(
        pos: TilePosition, 
        posMap: TilePositionMap,
        visible = true
    ): Tile {
        const emptyTile = this.scene.add.image(
                pos.x,
                pos.y,
                "ui-emptytile"
            )
                .setVisible(visible)
                .setDepth(1)
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

    public removeTile(tile: Tile, gridContainer?: Phaser.GameObjects.Container) {
        return new Promise(resolve => {
            const column = this.tiles_grid.get(tile.posMap.row);
    
            if (column && column.indexOf(tile) !== -1) {
                const emptyTile = this.createEmpty(tile.pos, tile.posMap, false);
    
                column[column.indexOf(tile)] = emptyTile;
    
                this.tiles_grid.set(tile.posMap.row, column);
                tile.gameObject.destroy();
                gridContainer!.update();
                resolve(true);
                return;
            } else {
                resolve(0);
                return;
            }
        })
    }
}