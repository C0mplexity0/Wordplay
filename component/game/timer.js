import styles from "@/styles/game/timer.module.css";
import { useRef } from "react";

var ringingAudioPlayed = true;

export default function Timer({ time, tickingAudio, ringingAudio }) {
    var dangerTimerClass = "";
    var ringingTimerClass = "";

    if (time <= 15) {
        dangerTimerClass = styles["danger-timer"];

        var tickingAudioTag = tickingAudio.current;
        var ringingAudioTag = ringingAudio.current;

        if (time <= 0) {
            if (tickingAudioTag) {
                if (!tickingAudioTag.paused) {
                    tickingAudioTag.pause();
                    tickingAudioTag.currentTime = 0;
                }
            }

            if (ringingAudioTag) {
                if (!ringingAudioPlayed) {
                    ringingAudioPlayed = true;
                    ringingAudioTag.play().catch((e) => {}); // Catches so NextJS doesn't complain if it can't be auto played
                }
            }

            ringingTimerClass = styles["ringing-timer"];
        } else {
            ringingAudioPlayed = false;

            if (tickingAudioTag) {
                if (tickingAudioTag.paused) {
                    try {
                        tickingAudioTag.play().catch((e) => {}); // Catches so NextJS doesn't complain if it can't be auto played
                    } catch(err) {
                        console.log("Ticking audio couldn't be played.");
                    }
                }
            }
        }
    } else {
        ringingAudioPlayed = false;
    }

    return (
        <div className={`${styles["timer"]} ${dangerTimerClass} ${ringingTimerClass}`}>
            <span className={styles["timer-text"]}>{time}s</span>
        </div>
    )
}
