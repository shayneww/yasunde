import { getCurrentWindow } from "@tauri-apps/api/window";

type TitlebarProps = {
    changeBackground: () => void,
    setDarkMode: () => void,
    isDarkMode: boolean;
}

export default function Titlebar({changeBackground, setDarkMode, isDarkMode} : TitlebarProps) {

    const yasundeFontColor = isDarkMode ? "text-black/70" : "text-white/70";
    const buttonDarkMode = isDarkMode ? "interface/button_light_mode.png" : "interface/button_dark_mode.png";

    return(
        <div
            data-tauri-drag-region="true" 
            className="flex h-8 w-full select-none items-center justify-between bg-black/40 px-4 backdrop-blur-sm "
        >
            <div className={`flex items-center gap-2 pointer-events-none ${yasundeFontColor} font-mono text-sm`}>
                <div className="text-pink-400">~</div> / yasunde (1.0)
            </div>

            <div className="flex items-center gap-3" data-tauri-drag-region="false"> 

                <button onClick={setDarkMode}>
                    <img 
                        src = {`${buttonDarkMode}`}
                        className="h-4 w-4"
                    />
                </button>

                <button 
                    onClick = {changeBackground}
                    className = "h-3 w-3 rounded-full bg-emerald-300 hover:bg-emerald-200"
                ></button>

                <button 
                    onClick={() => getCurrentWindow().minimize()}
                    className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors"
                ></button>

                <button onClick={() => getCurrentWindow().close()}
                    className="h-3 w-3 rounded-full bg-red-400 hover:bg-red-300 transition-colors"
                ></button>
            </div>
        </div>
    );
}