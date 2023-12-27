import styles from "@/styles/game/taskText.module.css";

export default function TaskText({ children }) {
   return (
    <h2 className={styles["task-text"]}>{children}</h2>
   ) 
}
