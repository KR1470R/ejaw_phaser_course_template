
import {
    CENTER_X,
    CENTER_Y
} from "../../../util/globals";

export default class WinContainer extends Phaser.GameObjects.Container {

    private backgroundGraphics?: Phaser.GameObjects.Graphics;
    private titleWin?: Phaser.GameObjects.Text;


    constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene = scene;
        this.setDepth(5);
        this.setVisible(true);

        scene.add.existing(this);
    }

    public create() {
        this.createWinContainer();
    }

    public createWinContainer() {
        const length_side = 650;
        
        this.backgroundGraphics = this.scene.add.graphics()
            .setAlpha(0)
            .fillStyle(0xf7e540)
            .fillRoundedRect(
                102,
                420,
                length_side, 
                length_side, 
                10
            )
                .setDepth(6);

        this.titleWin = this.scene.add
            .text(
                CENTER_X - 150, 
                CENTER_Y, 
                "You Win!",
                {
                    fontFamily:"Uni_Sans_Heavy",
                    color: "black",
                    fontSize: "70px"
                }
            )
                .setDepth(7)
                .setAlpha(0);

        this.scene.tweens.addCounter({
            from: 10,
            to: 70,
            duration: 100,
            ease: Phaser.Math.Easing.Linear,
            onUpdate: (tween: any, target: any) => {
                this.backgroundGraphics?.setAlpha(target.value / 100);
            },
        });

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            ease: Phaser.Math.Easing.Linear,
            onUpdate: (tween: any, target: any) => {
                this.titleWin?.setAlpha(target.value / 100);
            },
        });
    }

    public deleteWinContainer() {
        return new Promise(resolve => {
            if (
                !this.backgroundGraphics ||
                !this.titleWin
            ) {
                resolve(0);
                return;
            }

            let backgroundDissappeared = false;
            let titleDissappeared = false;
    
            this.scene.tweens.addCounter({
                from: 80,
                to: 0,
                duration: 100,
                ease: Phaser.Math.Easing.Linear,
                onUpdate: (tween: any, target: any) => {
                    this.backgroundGraphics?.setAlpha(target.value / 100);
                },
                onComplete: () => {
                    backgroundDissappeared = true;
                    this.backgroundGraphics?.removeFromDisplayList();
                    if (titleDissappeared) resolve(1);
                }
            });
    
            this.scene.tweens.addCounter({
                from: 100,
                to: 0,
                duration: 100,
                ease: Phaser.Math.Easing.Linear,
                onUpdate: (tween: any, target: any) => {
                    this.titleWin?.setAlpha(target.value / 100);
                },
                onComplete: () => {
                    titleDissappeared = true;
                    this.titleWin?.removeFromDisplayList();
                    if (backgroundDissappeared) resolve(1);
                }
            });
        });
    }
}