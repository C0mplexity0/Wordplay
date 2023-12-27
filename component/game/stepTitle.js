import styles from "@/styles/game/stepTitle.module.css";

export default function StepTitle({ step }) {
    return (
        <div className={styles["step-title-container"]}>
            <h1 className={`${styles["step-title"]} ${styles["animated-step-title"]}`}>Step {step}</h1>
        </div>
    )
}
