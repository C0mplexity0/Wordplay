import { Server } from "socket.io";
import cors from 'cors';
import log4js from "log4js";

var logger = log4js.getLogger();
logger.level = "info";

// Create a new instance of the CORS middleware
const corsMiddleware = cors();

var io;
var sockets = [];

var players = [];
var currentGame;

const startGameStepFuncs = [startApplicationStep, startViewApplicationsStep];
const gameStepTimerSteppedFuncs = [() => {}, viewApplicationsStepTimerStepped];
const answerGameStepFuncs = [answerApplicationStep];
const endGameStepFuncs = [endApplicationStep];

// Setting up the server
export default function SocketHandler(req, res) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    io = new Server(res.socket.server, {
        path: "/api/socket/games/professionator/connection",
        addTrailingSlash: false,
        maxHttpBufferSize: 1e7
    });

    io.on("connection", (socket) => {
        const clientId = socket.id;
        logger.debug(`A client connected. ID: ${clientId}`);

        sockets.push(socket);

        setupNewPlayer(socket);

        if (!currentGame) {
            setupGame();
        }

        socket.on("disconnect", () => {
            sockets.splice(sockets.indexOf(socket), 1);

            if (currentGame) {
                for (var i=0;i<players.length;i++) {
                    if (players[i].id == socket.id) {
                        logger.info("Player " + players[i].username + " (" + players[i].id + ") disconneted");

                        if (currentGame.players.includes(players[i].id)) {
                            currentGame.players.splice(currentGame.players.indexOf(players[i].id), 1);
                        }

                        players.splice(i, 1);

                        if (currentGame.started && currentGame.players.length < 3) {
                            io.emit("showNotification", "bad", "Insufficient players (a player disconnected) (minimum 3)");
                            logger.info("Insufficient players (a player disconnected). Ending game...")

                            setupGame();
                        }
                    }
                }
            }

            sendPlayerListToClients();

            logger.debug(`A client disconnected. ID: ${clientId}`);
        });
    });

    corsMiddleware(req, res, () => {
        res.socket.server.io = io;
        res.end();
    });
}

function getNewPlayerFromSocket(socket) {
    return {username: getNewUniqueUsername(), profileImage: "/img/profileImageDefault.png", id: socket.id, points: 0};
}

function stepStartCountdownTimer() {
    currentGame.startCountdownTimer -= 1;

    io.emit("setCurrentTimer", currentGame.startCountdownTimer);

    if (currentGame.startCountdownTimer < 1) {
        startGame();
    }
}

function setupGame() {
    var id = 0;

    if (currentGame) {
        id = currentGame.id+1;
        clearInterval(currentGame.startCountdownInterval);
    }

    currentGame = {
        id: id,
        started: false,
        currentMenu: "",
        players: [],
        startCountdownTimer: 15,
        startCountdownInterval: setInterval(stepStartCountdownTimer, 1000),
        stepCountdownTimer: 0,
        stepCountdownInterval: null,
        currentStep: -1
    }

    for (var i=0;i<players.length;i++) {
        currentGame.players.push(players[i].id);
    }

    sendPlayerListToClients();

    setCurrentMenu("pregameMenu");
}

function getPlayerByUsername(username) {
    for (var i=0;i<players.length;i++) {
        if (players[i].username === username) {
            return players[i];
        }
    }

    return null;
}

function getPlayerSocket(player) {
    for (var i=0;i<sockets.length;i++) {
        if (sockets[i].id === player.id) {
            return sockets[i];
        }
    }

    return null;
}

function getNewUniqueUsername() {
    var num = 0;

    while (getPlayerByUsername("player" + num)) {
        num += 1;
    }

    return "player" + num;
}

function sendPlayerListToClients() {
    if (currentGame) {
        var clientPlayerList = [];

        for (var i=0;i<players.length;i++) {
            getPlayerSocket(players[i]).emit("setClientPlayer", players[i]);

            if (currentGame.players.includes(players[i].id)) {
                clientPlayerList.push(players[i]);
            }
        }

        io.emit("setPlayers", clientPlayerList);
    }
}

function setupNewPlayer(socket) {
    var player = getNewPlayerFromSocket(socket);
    players.push(player);

    if (currentGame) {
        socket.emit("setCurrentMenu", currentGame.currentMenu);

        if (!currentGame.started) {
            currentGame.players.push(player.id);
        }
    }

    logger.info("Player " + player.username + " (" + player.id + ") connected");

    sendPlayerListToClients();

    socket.on("setUsername", (newUsername) => {
        if (newUsername.length < 1 || newUsername.length > 10) {
            return;
        }

        for (var i=0;i<players.length;i++) {
            if (players[i].id === socket.id) {
                logger.debug("Player " + player.username + " (" + player.id + ") changed their name to " + newUsername);

                players[i].username = newUsername;

                sendPlayerListToClients();
                break;
            }
        }
    });

    socket.on("setProfileImage", (newProfileImage) => {
        var base64data = "data:image/png;base64," + newProfileImage.toString("base64");

        for (var i=0;i<players.length;i++) {
            if (players[i].id === socket.id) {
                logger.debug("Player " + player.username + " (" + player.id + ") changed their profile image");

                players[i].profileImage = base64data;

                sendPlayerListToClients();
                break;
            }
        }
    });



    socket.on("submitRoundAnswer", (answer) => {
        if (currentGame) {
            if (currentGame.started && answerGameStepFuncs[currentGame.currentStep]) {
                answerGameStepFuncs[currentGame.currentStep](player, answer);
            }
        }
    });
}

function setCurrentMenu(menu) {
    currentGame.currentMenu = menu;

    io.emit("setCurrentMenu", currentGame.currentMenu);
}




function startGame() {
    clearInterval(currentGame.startCountdownInterval);

    if (currentGame.players.length < 3) {
        logger.info("Insufficient players. Restarting countdown...");

        io.emit("showNotification", "bad", "Insufficient players (minimum: 3)");

        setupGame();
        return;
    }

    currentGame.started = true;
    setCurrentMenu("beginScreen");

    var currentId = currentGame.id;

    setTimeout(() => {
        if (currentId == currentGame.id) {
            startGameStepFuncs[0]();
        }
    }, 2000);
}

function endCurrentStep() {
    clearInterval(currentGame.stepCountdownInterval);
    endGameStepFuncs[currentGame.currentStep]();
}

function stepStepCountdownTimer(currentGameId) {
    if (currentGame.id == currentGameId) {
        currentGame.stepCountdownTimer -= 1;

        io.emit("setCurrentTimer", currentGame.stepCountdownTimer);

        gameStepTimerSteppedFuncs[currentGame.currentStep]();

        if (currentGame.stepCountdownTimer < 1) {
            endCurrentStep();
        }
    }
}



var applications = {};

function startApplicationStep() {
    currentGame.currentStep = 0;

    setCurrentMenu("applicationMenu");

    var currentGameId = currentGame.id;

    currentGame.stepCountdownTimer = 60;
    currentGame.stepCountdownInterval = setInterval(() => {
        stepStepCountdownTimer(currentGameId);
    }, 1000);

    io.emit("setCurrentTimer", currentGame.stepCountdownTimer);
}

function answerApplicationStep(player, answer) {
    applications[player.id] = answer;
}

function endApplicationStep() {
    startGameStepFuncs[currentGame.currentStep+1]();
}


function startViewApplicationsStep() {
    currentGame.currentStep = 1;

    setCurrentMenu("viewApplicationsMenu");

    var currentGameId = currentGame.id;

    currentGame.stepCountdownTimer = 1120;
    currentGame.stepCountdownInterval = setInterval(() => {
        stepStepCountdownTimer(currentGameId);
    }, 1000);

    io.emit("setCurrentTimer", currentGame.stepCountdownTimer);
}

function viewApplicationsStepTimerStepped() {
    
}
