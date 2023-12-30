export default class ProfessionatorStep1 {
    constructor (professionator) {
        this.professionator = professionator;

        this.applications = {};
    }

    startStep() {
        this.professionator.currentGame.currentStep = 0;

        this.professionator.setCurrentMenu("applicationMenu");

        this.professionator.setupTimer(this.professionator.currentGame.id, 60);
    }

    registerAnswer(player, answer) {
        if (typeof answer === "string") {
            this.applications[player.id] = answer;

            var allAnswered = true;

            const players = this.professionator.currentGame.players;
            console.log(players);

            for (var i=0;i<players.length;i++) {
                if (!this.applications[players[i]]) {
                    allAnswered = false;
                    break;
                }
            }

            if (allAnswered) {
                this.endStep(true)
            }
        } else {
            this.professionator.logger.warn("Player " + player.username + " (" + player.id + ") tried to submit a step 1 answer which wasn't a string");
        }
    }

    timerStepped(newTime) {

    }

    endStep(allAnswered) {
        clearInterval(this.professionator.currentGame.stepCountdownInterval);
        
        if (!allAnswered) {
            this.professionator.setCurrentMenu("applicationStepTimeUpScreen");
            
            const professionator = this.professionator;
            var currentGameId = professionator.currentGame.id;

            setTimeout(() => {
                if (professionator.currentGame.id == currentGameId) {
                    professionator.startNextStep();
                }
            }, 2000);
        } else {
            this.professionator.startNextStep();
        }
    }
}