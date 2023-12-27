import styles from "@/styles/game/pregameMenu.module.css";

export function PregameMenu({ children, gameName, timer }) {
    return (
        <div className={styles["pregame-menu"]}>
            <h1 className={styles["pregame-title"]}>{gameName}</h1>
            <div className={styles["pregame-top-bar"]}>
                <span className={styles["pregame-timer"]}>Starting in {timer}s</span>
            </div>
            <div className={styles["pregame-menu-content"]}>
                {children}
            </div>
        </div>
    )
}

export function PregameMenuPlayerSection({ players, clientPlayer, socket }) {
    return (
        <div className={styles["pregame-menu-player-section"]}>
            {players.map(player => {
                if (player.id === clientPlayer.id) {
                    return <ClientPlayer key={player.id} player={player} socket={socket} />
                }
                return <Player key={player.id} player={player} />;
            })}
        </div>
    )
}

function Player({ player }) {
    return (
        <div className={styles["player"]}>
            <div className={styles["player-profile-image"]} style={{backgroundImage: "url(" + player.profileImage + ")"}}>
            </div>
            <span className={styles["player-name"]}>{player.username}</span>
        </div>
    )
}

function ClientPlayer({ player, socket }) {
    return (
        <div className={styles["player"]}>
            <div className={styles["player-profile-image"]} style={{backgroundImage: "url(" + player.profileImage + ")"}}>
            </div>
            <input type="file" className={styles["player-profile-image-uploader"]} id="playerProfileImageUploader" onInput={() => {
                var files = event.target.files;
                
                if (files[0]) {
                    socket.emit("setProfileImage", files[0]);
                }
            }} />
            <button className={`${styles["player-profile-image-uploader-button"]} material-symbols-outlined`} onClick={() => {document.getElementById("playerProfileImageUploader").click();}}>photo_camera</button>

            <input maxLength={10} type="text" className={styles["player-name-input"]} defaultValue={player.username}
            onKeyUp={event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    event.target.blur();
                }
            }}
            onBlur={event => {
                var value = event.target.value;

                if (value.length < 1) {
                    event.target.value = player.username;
                } else {
                    socket.emit("setUsername", value);
                }
            }}
            />
        </div>
    )
}
