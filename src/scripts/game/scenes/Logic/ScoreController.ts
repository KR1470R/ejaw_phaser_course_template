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

        const saved_score = localStorage.getItem("best_score")
        this.setBestScore(saved_score ? saved_score : 0);

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
        localStorage.setItem("best_score", String(score));
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