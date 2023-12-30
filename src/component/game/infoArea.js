import styles from "@/styles/game/infoArea.module.css";

export default function InfoArea({ children }) {
    return (
        <div className={styles["info-area-container"]}>
            <div className={styles["info-area"]}>
                {children}
            </div>
        </div>
    )
}