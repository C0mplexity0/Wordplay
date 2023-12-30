import styles from "@/styles/game/professionator/applicationMenuTimeUpScreen.module.css";
import Timer from "../timer";

export default function ApplicationMenuTimeUpScreen({ tickingAudio, ringingAudio, time }) {
    return (
        <div className={styles["application-menu-step-ended-screen"]}>
            <div className={styles["popup-container"]}>
                <Timer tickingAudio={tickingAudio} ringingAudio={ringingAudio} time={time} />
                <h1>Time's Up!</h1>
            </div>
        </div>
    )
}