import { eventManager } from "scripts/util/globals";

export class ScoreController {
    
    private currentScoreLabel!: Phaser.GameObjects.Text;
    private bestScoreLabel!: Phaser.GameObjects.Text;

    constructor(
        currentScoreLabel: Phaser.GameObjects.Text,
        bestScoreLabel: Phaser.GameObjects.Text
    ) {
        this.currentScoreLabel = currentScoreLabel;
        this.bestScoreLabel = bestScoreLabel;

        eventManager.on("add-current-score", (score: number | string) => {
            const new_score = this.getCurrentScore() + Number(score);
            this.setCurrentScore(new_score);
            if (new_score > this.getBestScore())
                this.setBestScore(new_score);
        });
    }

    public setCurrentScore(score: number | string) {
        this.currentScoreLabel.text = score.toString();
    }

    public setBestScore(score: number | string) {
        this.bestScoreLabel.text = score.toString();
    }

    public getCurrentScore() {
        return parseInt(this.currentScoreLabel.text);
    }

    public getBestScore() {
        return parseInt(this.bestScoreLabel.text);
    }

    public resetCurrentScore() {
        this.setCurrentScore(0);
    }

    public resetBestScore() {
        this.setBestScore(0);
    }
}