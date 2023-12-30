import ProfessionatorStep1 from "./steps/step1";

export default class Professionator {
    constructor (logger, io) {
        this.logger = logger;

        this.io = io;
        this.sockets = [];

        this.players = [];
        this.currentGame;

        this.gameSteps = [ProfessionatorStep1];

        this.io.on("connection", (socket) => {
            const clientId = socket.id;
            this.logger.debug(`A client connected. ID: ${clientId}`);

            this.sockets.push(socket);

            this.setupNewPlayer(socket);

            if (!this.currentGame) {
                this.setupGame();
            }

            socket.on("disconnect", () => {
                this.sockets.splice(this.sockets.indexOf(socket), 1);

                for (var i=0;i<this.players.length;i++) {
                    if (this.players[i].id == socket.id) {
                        this.logger.info("Player " + this.players[i].username + " (" + this.players[i].id + ") disconneted");

                        if (this.currentGame) {
                            if (this.currentGame.players.includes(this.players[i].id)) {
                                this.currentGame.players.splice(this.currentGame.players.indexOf(this.players[i].id), 1);
                            }

                            if (this.currentGame.started && this.currentGame.players.length < 3) {
                                this.io.emit("showNotification", "bad", "Insufficient players (a player disconnected) (minimum 3)");
                                this.logger.info("Insufficient players (a player disconnected). Ending game...")
    
                                this.setupGame();
                            }
                        }

                        this.players.splice(i, 1);
                    }
                }
    
                this.sendPlayerListToClients();
    
                this.logger.debug(`A client disconnected. ID: ${clientId}`);
            });
        });
    }

    /* PLAYERS */

    setupNewPlayer(socket) {
        var player = this.getNewPlayerFromSocket(socket);
        this.players.push(player);
    
        if (this.currentGame) {
            socket.emit("setCurrentMenu", this.currentGame.currentMenu);
    
            if (!this.currentGame.started) {
                this.currentGame.players.push(player.id);
            }
        }
    
        this.logger.info("Player " + player.username + " (" + player.id + ") connected");
    
        this.sendPlayerListToClients();
    
        socket.on("setUsername", (newUsername) => {
            if (newUsername.length < 1 || newUsername.length > 10) {
                return;
            }
    
            for (var i=0;i<this.players.length;i++) {
                if (this.players[i].id === socket.id) {
                    this.logger.debug("Player " + player.username + " (" + player.id + ") changed their name to " + newUsername);
    
                    this.players[i].username = newUsername;
    
                    this.sendPlayerListToClients();
                    break;
                }
            }
        });
    
        socket.on("setProfileImage", (newProfileImage) => {
            var base64data = "data:image/png;base64," + newProfileImage.toString("base64");
    
            for (var i=0;i<this.players.length;i++) {
                if (this.players[i].id === socket.id) {
                    this.logger.debug("Player " + player.username + " (" + player.id + ") changed their profile image");
    
                    this.players[i].profileImage = base64data;
    
                    this.sendPlayerListToClients();
                    break;
                }
            }
        });
    
        socket.on("submitRoundAnswer", (answer) => {
            if (this.currentGame) {
                if (this.currentGame.started && this.currentGame.currentStepClass != null) {
                    this.currentGame.currentStepClass.registerAnswer(player, answer);
                }
            }
        });
    }

    getNewPlayerFromSocket(socket) {
        return {username: this.getNewUniqueUsername(), profileImage: "/img/profileImageDefault.png", id: socket.id, points: 0};
    }

    getNewUniqueUsername() {
        var num = 0;
    
        while (this.getPlayerByUsername("player" + num)) {
            num += 1;
        }
    
        return "player" + num;
    }

    getPlayerByUsername(username) {
        for (var i=0;i<this.players.length;i++) {
            if (this.players[i].username === username) {
                return this.players[i];
            }
        }
    
        return null;
    }

    sendPlayerListToClients() {
        if (this.currentGame) {
            var clientPlayerList = [];
    
            for (var i=0;i<this.players.length;i++) {
                if (this.currentGame.players.includes(this.players[i].id)) {
                    clientPlayerList.push(this.players[i]);
                }
    
                var socket = this.getPlayerSocket(this.players[i]);

                if (socket) {
                  socket.emit("setClientPlayer", this.players[i]);  
                }
            }
    
            this.io.emit("setPlayers", clientPlayerList);
        }
    }

    getPlayerSocket(player) {
        for (var i=0;i<this.sockets.length;i++) {
            if (this.sockets[i].id === player.id) {
                return this.sockets[i];
            }
        }
    
        return null;
    }

    /* UI */

    setCurrentMenu(menu) {
        this.currentGame.currentMenu = menu;
    
        this.io.emit("setCurrentMenu", this.currentGame.currentMenu);
    }

    /* TIMER */

    setupTimer(currentGameId, startTime) {
        this.currentGame.stepCountdownTimer = startTime;
        const professionator = this;
        this.currentGame.stepCountdownInterval = setInterval(() => {
            professionator.stepStepCountdownTimer(currentGameId);
        }, 1000);

        this.io.emit("setCurrentTimer", this.currentGame.stepCountdownTimer);
    }

    stepStartCountdownTimer() {
        this.currentGame.startCountdownTimer -= 1;
    
        this.io.emit("setCurrentTimer", this.currentGame.startCountdownTimer);
    
        if (this.currentGame.startCountdownTimer < 1) {
            this.startGame();
        }
    }

    stepStepCountdownTimer(currentGameId) {
        if (this.currentGame.id == currentGameId) {
            this.currentGame.stepCountdownTimer -= 1;
    
            this.io.emit("setCurrentTimer", this.currentGame.stepCountdownTimer);
    
            this.currentGame.currentStepClass.timerStepped(this.currentGame.stepCountdownTimer);
    
            if (this.currentGame.stepCountdownTimer < 1) {
                this.endCurrentStep();
            }
        }
    }

    /* GAME */

    setupGame() {
        var id = 0;

        if (this.currentGame) {
            id = this.currentGame.id+1;

            if (this.currentGame.startCountdownInterval) {
                clearInterval(this.currentGame.startCountdownInterval);
            }
        }

        const professionator = this;

        this.currentGame = {
            id: id,
            started: false,
            currentMenu: "",
            players: [],
            startCountdownTimer: 15,
            startCountdownInterval: setInterval(() => {professionator.stepStartCountdownTimer()}, 1000),
            stepCountdownTimer: 0,
            stepCountdownInterval: null,
            stepClasses: [],
            currentStep: -1,
            currentStepClass: null
        }

        for (var i=0;i<this.players.length;i++) {
            this.currentGame.players.push(this.players[i].id);
        }

        this.sendPlayerListToClients();

        this.setCurrentMenu("pregameMenu");
    }

    startGame() {
        clearInterval(this.currentGame.startCountdownInterval);
    
        if (this.currentGame.players.length < 3) {
            this.logger.info("Insufficient players. Restarting countdown...");
    
            this.io.emit("showNotification", "bad", "Insufficient players (minimum: 3)");
    
            this.setupGame();
            return;
        }
    
        this.currentGame.started = true;
        this.setCurrentMenu("beginScreen");

        for (var i=0;i<this.gameSteps.length;i++) {
            this.currentGame.stepClasses.push(new this.gameSteps[i](this));
        }
    
        var currentId = this.currentGame.id;
    
        setTimeout(() => {
            if (currentId == this.currentGame.id) {
                this.startStep(0);
            }
        }, 2000);
    }

    /* STEPS */

    startStep(stepId) {
        this.currentGame.currentStep = stepId;
        this.currentGame.currentStepClass = this.currentGame.stepClasses[stepId];
        this.currentGame.currentStepClass.startStep();
    }

    endCurrentStep() {
        this.endStep(this.currentGame.currentStep);
    }

    endStep(stepId) {
        this.currentGame.stepClasses[stepId].endStep();
    }

    startNextStep() {
        this.startStep(this.currentGame.currentStep+1);
    }
}
