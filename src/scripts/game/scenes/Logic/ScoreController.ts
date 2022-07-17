export class ScoreController {
    
    private currentScoreLabel!: Phaser.GameObjects.Text;
    private bestScoreLabel!: Phaser.GameObjects.Text;

    constructor(
        currentScoreLabel: Phaser.GameObjects.Text,
        bestScoreLabel: Phaser.GameObjects.Text
    ) {
        this.currentScoreLabel = currentScoreLabel;
        this.bestScoreLabel = bestScoreLabel;
    }

    public setCurrentScore(score: number) {
        
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
}