import styles from "@/styles/game/taskBody.module.css";

export default function TaskBody({ children }) {
    return (
        <div className={styles["task-body"]}>
            {children}
        </div>
    )
}