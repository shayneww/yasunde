import { useState, useEffect } from 'react'
import { getCurrentWindow, UserAttentionType } from '@tauri-apps/api/window';

type TimerProps = {
    workTimeMinutes: number,
    breakTimeMinutes: number,
    isDarkMode: boolean;
}

export default function Timer({workTimeMinutes, breakTimeMinutes, isDarkMode} : TimerProps) {

    const [timeLeftSeconds, setTimeLeftSeconds] = useState(workTimeMinutes * 60);
    const [endingTimeMilliseconds, setEndingTimeMilliseconds] = useState(0);
    const [isTimer, setIsTimer] = useState(false);
    const [timerState, setTimerState] = useState("timer");
    const appWindow = getCurrentWindow();
    const completeAudio = new Audio('./audio/complete.wav');

    let buttonPausePath = "/interface/button_pause_light.png";
    let buttonResumePath = "/interface/button_resume_light.png";
    let timerFontColor = "text-white/70";

    if (isDarkMode) {
        buttonPausePath = "/interface/button_pause_dark.png";
        buttonResumePath = "/interface/button_resume_dark.png";
        timerFontColor = "text-black/70";
    }
    
    // Helper function for handleCompletion() below
    const highlightWindow = async () => {
        await appWindow.requestUserAttention(UserAttentionType.Informational);
    }

    /* This function runs whenever the user clicks the timer toggle button:
    - if the timer is currently running, it turns it off (pauses it)
    - if the timer isn't running, it turns it on and calculates the new end time based on how many seconds are currently left
    */
    const toggleTimer = () => {
        if (isTimer) {
            setIsTimer(false);
        } else {
            setEndingTimeMilliseconds(Date.now() + (timeLeftSeconds * 1000));
            setIsTimer(true);
        }
    }

    /* This function runs every time any timer section is completed:
    - it turns off the timer, requests user attention (highlightWindow()) and plays ./audio/complete.wav
    - depending on the current timer state, it switches into either a "break" or "timer" state and resets the time left
    - the timer stays turned off, meaning that the user has to manually click a button on the UI to resume the next phase
    */
    const handleCompletion = () => {
        setIsTimer(false);
        highlightWindow();
        completeAudio.play();
        switch (timerState) {
            case "timer":
                setTimerState("break");
                setTimeLeftSeconds(breakTimeMinutes * 60);
                break;
            case "break":
            default:
                setTimerState("timer");
                setTimeLeftSeconds(workTimeMinutes * 60);
                break;
        }
    }

    /* This function runs whenever the timer's active status or end time changes
    - if timer is not supposed to run or target end time run out, it returns early
    - it initializes a continuous interval that runs every 100 ms to ensure that UI stays synchronized
    - inside each tick, it calculates a difference between the target end time and current time (from ms to rounded seconds)
    - if the calculated time difference drops below zero (the timer is completed), handleCompletion() is called
    - if timer is still working, a fresh value is updated in timeLeftSeconds useState to be formatted later
    */
    useEffect(() => {
        if (!isTimer) return;
        if (endingTimeMilliseconds === 0) return;

        const interval = setInterval(() => {
            const currentTimeMilliseconds = Date.now();
            const timeDifferenceSeconds = Math.round((endingTimeMilliseconds - currentTimeMilliseconds) / 1000);

            if (timeDifferenceSeconds < 0) {
                clearInterval(interval);
                handleCompletion();
            } else setTimeLeftSeconds(timeDifferenceSeconds);
        }, 100);

        return () => clearInterval(interval);
    }, [endingTimeMilliseconds, isTimer]);

    const minutesToShow = Math.floor(timeLeftSeconds / 60);
    const secondsToShow = timeLeftSeconds % 60;
    const formattedTime = `${String(minutesToShow).padStart(2, "0")}:${String(secondsToShow).padStart(2, "0")}`;
    
    return(
        <div className={`flex flex-col items-center justify-center min-h-screen pb-7 select-none ${timerFontColor} font-light text-4xl`}>
            <p className="flex items-center justify-center w-30 h-14 backdrop-blur-sm rounded-2xl bg-black/40">
                {formattedTime}
            </p>

            <div className="flex items-center justify-center w-30 h-20 backdrop-blur-sm rounded-2xl bg-black/40 mt-3">
                <img 
                    onClick={() => toggleTimer()} 
                    src={isTimer ? buttonPausePath : buttonResumePath} 
                    className="w-15 h-15 select-none"
                />
            </div>
        </div>
    );
}