import { base_text_style } from "./globals";

export default class Button {
    public scene: Phaser.Scene;
    public text: string;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public round: number;
    public element: Phaser.GameObjects.Rectangle;
    public buttonContainer: Phaser.GameObjects.Container;

    private events: Map<string, Function>;
    private enabled: boolean;
    private delay: number;
    private timeout: boolean;

    constructor(
        scene: Phaser.Scene, 
        text: string, 
        x: number, 
        y: number, 
        width: number, 
        height: number,
        round: number
    ) {
        this.scene = scene;
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.round = round;
        this.element = this.createElement();

        this.enabled = true;
        this.delay = 200;
        this.timeout = false;
        this.events = new Map();

        this.events.set("click", function () {});
        this.events.set("over", function () {});
        this.events.set("out", function () {});

        this.element.setInteractive();
        this.element.on("pointerdown", this.on_click_template.bind(this));
        this.element.on("pointerover", this.on_over_template.bind(this));
        this.element.on("pointerout", this.on_out_template.bind(this));
    }

    public setDelay(value: number) {
        this.delay = value;
        return this;
    }

    public enable() {
        this.enabled = true;
        return this;
    }

    public disable() {
        this.enabled = false;
        return this;
    }

    public click(callback: Function) {
        this.events.set("click", callback);
        return this;
    }

    public over(callback: Function) {
        this.events.set("over", callback);
        return this;
    }

    public out(callback: Function) {
        this.events.set("out", callback);
        return this;
    }

    private on_click_template() {
        if (!this.enabled) return;
        if (this.timeout) return;

        this.buttonContainer!.setScale(0.9);
        this.buttonContainer.setAlpha(0.6);
        this.scene.time.delayedCall(100, () => {
            this.buttonContainer!.setScale(1);
            this.buttonContainer.setAlpha(1);
        });

        document.body.style.cursor = "auto";

        this.timeout = true;
        this.scene.time.delayedCall(this.delay, () => {
            this.timeout = false;
        });

        this.events.get("click")!(this, this.element);
    }

    private on_over_template() {
        if (!this.enabled) return;
        if (this.timeout) return;

        document.body.style.cursor = "pointer";

        this.events.get("over")!(this, this.element);
    }

    private on_out_template() {
        document.body.style.cursor = "auto";

        if (!this.enabled) return;
        if (this.timeout) return;

        this.events.get("out")!(this, this.element);
    }

    private createElement(): Phaser.GameObjects.Rectangle {

        const button_container = this.scene.add.container(
            this.x,
            this.y
        );

        const button_text = this.scene.add.text(
            25,
            -15,
            this.text,
            {
                ...base_text_style,
                fontSize: "20px",
                color: "white"
            }
        ).setOrigin(0.5);

        const button_graphics = this.scene.add.graphics()
            .fillStyle(0x8f7a66, 1)
            .fillRoundedRect(
                -50, 
                -50, 
                button_text.width + 50, 
                button_text.height + 50, 
                this.round
            );

        button_container.add([
            button_graphics,
            button_text
        ]);

        this.buttonContainer = button_container;

        this.scene.add.existing(button_container);

        const inputContainer = this.scene.add
            .rectangle(
                this.x + 20, 
                this.y - 15, 
                this.width + 5, 
                this.height + 10, 
                0x000000, 
                0
            )
            .setOrigin(0.5)

        return inputContainer;
    }
}
