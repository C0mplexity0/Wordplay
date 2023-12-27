import Head from "next/head";
import styles from "@/styles/game/professionator/index.module.css";
import { useEffect, useRef, useState } from "react";
import { PregameMenu, PregameMenuPlayerSection } from "../../../../component/game/pregameMenu";

import io from "socket.io-client";
import { ApplicationMenu } from "../../../../component/game/professionator/applicationMenu";
import BeginScreen from "../../../../component/game/beginScreen";
import ViewApplicationsMenu from "../../../../component/game/professionator/viewApplicationsMenu";

var notifications, setNotifications;

var socket;
var useStateSocket, setUseStateSocket;
var connectingSocket = false;

var currentGame = {
    players: []
};
var clientPlayer;

var currentTimerValue, setCurrentTimerValue;
var currentViewingPlayer, setCurrentViewingPlayer;

var pregameMenuUserSection, setPregameMenuUserSection;
var pregameMenuTimer, setPregameMenuTimer;

var currentMenu;
const refs = {
    "pregameMenu": null,
    "beginScreen": null,
    "applicationMenu": null,
    "viewApplicationsMenu": null
};

export default function Professionator() {
    [notifications, setNotifications] = useState([]);

    for (var ref in refs) {
        refs[ref] = useRef(null);
    }

    [useStateSocket, setUseStateSocket] = useState(null);

    [currentTimerValue, setCurrentTimerValue] = useState(0);
    [currentViewingPlayer, setCurrentViewingPlayer] = useState(null);

    [pregameMenuUserSection, setPregameMenuUserSection] = useState(null);
    [pregameMenuTimer, setPregameMenuTimer] = useState(null);

    var tickingAudio = useRef(null);
    var ringingAudio = useRef(null);

    useEffect(() => {
        async function init() {
            if (!socket && !connectingSocket) {
                await initSocket();
            }
        }

        init();
    }, []);

    return (
        <>
            <Head>
                <title>Professionator</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`${styles.main} theme-playful`}>
                <div ref={refs.pregameMenu} className={styles["menu"]}>
                    <PregameMenu gameName="Professionator" timer={currentTimerValue}>
                        {pregameMenuUserSection}
                    </PregameMenu>
                </div>

                <div ref={refs.beginScreen} className={styles["menu"]}>
                    <BeginScreen />
                </div>

                <div ref={refs.applicationMenu} className={styles["menu"]}>
                    <ApplicationMenu tickingAudio={tickingAudio} ringingAudio={ringingAudio} player={clientPlayer} time={currentTimerValue} socket={useStateSocket} />
                </div>
                
                <div ref={refs.viewApplicationsMenu} className={styles["menu"]}>
                    <ViewApplicationsMenu tickingAudio={tickingAudio} ringingAudio={ringingAudio} currentViewingPlayer={currentViewingPlayer} time={currentTimerValue} socket={useStateSocket} />
                </div>


                <div className={styles["notification-box"]}>
                    {notifications.map((notification, i) => <Notification key={i} type={notification.type}>{notification.content}</Notification>)}
                </div>
                <audio ref={tickingAudio} src="/audio/game/ticking.mp3" />
                <audio ref={ringingAudio} src="/audio/game/ringing.mp3" />
            </main>
        </>
    )
}

function Notification({ type, children }) {
    var typeClassName = "";

    if (type) {
        typeClassName = styles["notification-" + type];
    }

    return (
        <div className={`${styles["notification"]} ${typeClassName}`}>
            {children}
        </div>
    )
}

async function initSocket() {
    connectingSocket = true;

    // Ping the server to setup a socket if not already running
    await fetch("/api/socket/games/professionator/io");
 
    socket = io({ path: "/api/socket/games/professionator/connection" });

    setUseStateSocket(socket);

    socket.on("connect", () => {
        console.log("Connected to the server");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from the server");
    });

    socket.on("connect_error", (error) => {
        console.log("Connection error:", error);
    });

    socket.on("reconnect", (attemptNumber) => {
        console.log("Reconnected to the server. Attempt:", attemptNumber);
    });

    socket.on("reconnect_error", (error) => {
        console.log("Reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
        console.log("Failed to reconnect to the server");
    });

    initSocketConnections();

    connectingSocket = false;
}

function showNotification(type, message) {
    var notification = {type: type, content: <span>{message}</span>};

    var notificationsClone = [...notifications];

    notificationsClone.push(notification);

    setNotifications(notificationsClone);

    setTimeout(() => {
        var notificationsClone = [...notifications];

        notificationsClone.splice(0, 1);

        setNotifications(notificationsClone);
    }, 3000);
}

function setClientPlayer(player) {
    clientPlayer = player;
}

function setCurrentMenu(menu) {
    currentMenu = menu;

    for (var ref in refs) {
        if (ref !== menu) {
            refs[ref].current.style.display = "none";
        } else {
            refs[ref].current.style.display = "block";
        }
    }
}

function setPlayers(players) {
    currentGame.players = players;

    setPregameMenuUserSection(<PregameMenuPlayerSection players={currentGame.players} clientPlayer={clientPlayer} socket={socket} />);
}

function setCurrentTimer(newTime) {
    setCurrentTimerValue(newTime);
}

async function initSocketConnections() {
    socket.on("showNotification", showNotification);

    socket.on("setClientPlayer", setClientPlayer);

    socket.on("setCurrentMenu", setCurrentMenu);

    socket.on("setPlayers", setPlayers);

    socket.on("setCurrentTimer", setCurrentTimer);
}
