import styles from "@/styles/game/beginScreen.module.css";

export default function BeginScreen() {
    return (
        <div className={styles["begin-screen"]}>
            <BeginText />
        </div>
    )
}

function BeginText() {
    return (
        <h1 className={styles["begin-text"]}>Begin!</h1>
    )
}
