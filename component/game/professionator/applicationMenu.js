import styles from "@/styles/game/professionator/applicationMenu.module.css";
import StepTitle from "../stepTitle";
import TaskText from "../taskText";
import TaskBody from "../taskBody";
import { useRef, useState } from "react";
import Timer from "../timer";
import InfoArea from "../infoArea";

var emailSendButton;

var emailSent = false;

export function ApplicationMenu({ player, time, socket, tickingAudio, ringingAudio}) {
    if (time == 0 && emailSendButton) {
        if (emailSendButton.current) {
            emailSendButton.current.click();
        }
    }

    return (
        <div className={styles["application-menu"]}>
            <InfoArea>
                <StepTitle step={1} />
                <TaskText>Create a job application</TaskText>
                <Timer time={time} tickingAudio={tickingAudio} ringingAudio={ringingAudio} />
            </InfoArea>
            <TaskBody>
                <EmailMenu player={player} socket={socket} />
            </TaskBody>
        </div>
    )
}

function EmailMenu({ player, socket }) {
    emailSendButton = useRef(null);

    var emailSendMenu = useRef(null);
    var textArea = useRef(null);

    var username = "player";

    if (player) {
        username = player.username.toLowerCase();
    }

    var [wordCount, setWordCount] = useState(0);

    return (
        <div className={styles["email-menu"]}>
            <div className={styles["email-box-header"]}>
                <h3>Wordplay Mail</h3>
            </div>

            <div className={styles["email-send-menu"]} ref={emailSendMenu}>
                <div className={styles["email-from"]}>
                    <span>From: {username}@wordplay</span>
                </div>
                <div className={styles["email-to"]}>
                    <span>To: ceo@google.com</span>
                </div>
                <textarea ref={textArea} className={styles["email-content"]} placeholder="Make it funny! More words = more points."
                onInput={event => {
                    var split = event.target.value.split(" ");
                    var splitFiltered = [];

                    for (var i=0;i<split.length;i++) {
                        if (split[i].length > 0) {
                            splitFiltered.push(split[i]);
                        }
                    }

                    setWordCount(splitFiltered.length);
                }}
                />
                <div className={styles["email-controls"]}>
                    <span className={styles["email-word-count"]}>Word Count: {wordCount}</span>
                    <button disabled={wordCount < 1} ref={emailSendButton} className={styles["email-send-button"]}
                    onClick={event => {
                        if (textArea.current && emailSendMenu.current && socket && !emailSent) {
                            emailSent = true;
                            socket.emit("submitRoundAnswer", textArea.current.value);
                            emailSendMenu.current.style.display = "none";
                        }
                    }}
                    >Send Email</button>
                </div>
            </div>

            <div className={styles["email-sent-menu"]}>
                <div className={styles["email-sent-menu-text"]}>
                    <h3>Email sent</h3>
                    <span>Good luck</span>
                </div>
            </div>
        </div>
    )
}
