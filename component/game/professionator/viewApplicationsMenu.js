import styles from "@/styles/game/viewApplicationsMenu.module.css";
import InfoArea from "../infoArea";
import StepTitle from "../stepTitle";
import TaskText from "../taskText";
import Timer from "../timer";
import TaskBody from "../taskBody";

export default function ViewApplicationsMenu({ currentViewingPlayer, time, tickingAudio, ringingAudio }) {
    return (
        <div className={styles["view-applications-menu"]}>
            <InfoArea>
                <StepTitle step={2}/>
                <TaskText>Let's go through the applications</TaskText>
                <Timer time={time} tickingAudio={tickingAudio} ringingAudio={ringingAudio} />
            </InfoArea>
            <TaskBody>
                <EmailMenu player={currentViewingPlayer} />
            </TaskBody>
        </div>
    )
}

function EmailMenu({ player, emailContent }) {
    var username = "player";

    if (player) {
        username = player.username.toLowerCase();
    }

    return (
        <div className={styles["email-menu"]}>
            <div className={styles["email-box-header"]}>
                <h3>Wordplay Mail</h3>
            </div>

            <div className={styles["email-from"]}>
                    <span>From: {username}@wordplay</span>
                </div>
                <div className={styles["email-to"]}>
                    <span>To: ceo@google.com</span>
                </div>
                <div className={styles["email-content"]}></div>
        </div>
    )
}
