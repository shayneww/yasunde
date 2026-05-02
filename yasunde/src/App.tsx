import Titlebar from "./Titlebar";
import Timer from "./Timer";
import { useEffect, useState } from "react";
import { open } from '@tauri-apps/plugin-dialog';
import { exists, BaseDirectory, mkdir, writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { convertFileSrc } from '@tauri-apps/api/core';
import { FALLBACK_IMAGE } from '../utilities/placeholders';

type AppConfig = {
  backgroundPath: string,
  workTimeMinutes: number,
  breakTimeMinutes: number,
  alwaysOnTop: boolean,
  darkMode: boolean,
  shuffleDefaultBackgrounds: boolean,
  windowSize : { width: number, height: number }
}

const DEFAULT_CONFIG : AppConfig = {
  backgroundPath: "/backgrounds/defaultbackground_wirestock.jpg",
  workTimeMinutes: 45,
  breakTimeMinutes: 2,
  alwaysOnTop: true,
  darkMode: false,
  shuffleDefaultBackgrounds: true,
  windowSize : { width: 320, height: 210 }
}

export default function App() {
  const [currentBackground, setCurrentBackground] = useState(DEFAULT_CONFIG.backgroundPath);
  const [workTimeMinutes, setWorkTimeMinutes] = useState(DEFAULT_CONFIG.workTimeMinutes);
  const [breakTimeMinutes, setBreakTimeMinutes] = useState(DEFAULT_CONFIG.breakTimeMinutes);
  const [isDarkMode, setIsDarkMode] = useState(DEFAULT_CONFIG.darkMode);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);

  const defaultBackgrounds : string[] = [
    "/backgrounds/defaultbackground_wirestock.jpg",
    "/backgrounds/fieldsbackground_wirestock.jpg",
    "/backgrounds/koibackground_wirestock.jpg",
    "/backgrounds/osakabackground_wirestock.jpg",
    "/backgrounds/sakurabackground_wirestock.jpg"
  ];

  // Helper function for setDarkMode(), changeBackground() and initializeApp() below
  const writeConfigFile = async (configData: AppConfig) => {
    await writeTextFile("config.json", JSON.stringify(configData, null, 2), { baseDir: BaseDirectory.AppConfig });
  };

  /* This function runs every time the dark mode button is clicked:
  - it stores the opposite value of current isDarkMode useState
  - it updates the isDarkMode useState to match user preference
  - it creates a new config by merging the loaded one with recently selected mode
  - the new config is written to AppConfig's directory
  */
  const setDarkMode = async () => {
    let newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const newConfig = { ...config, darkMode: newMode };
    setConfig(newConfig);
    writeConfigFile(newConfig);
  }

  /* This function runs every time the green toolbar button is clicked:
  - it opens the OS file dialog, limiting the user to picking one image file
  - if user selects properly, it reads the image path on user's drive
  - it uses Tauri's convertFileSrc to an URL that can be loaded by the webview
  - it updates the useState to change the background and saves the path string to config.json
  */
  const changeBackground = async () => {
    const selectedImage = await open({
      multiple: false,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }]
    });

    if (selectedImage) {
      setCurrentBackground(convertFileSrc(selectedImage));
      const newConfig = { ...config, backgroundPath: selectedImage, shuffleDefaultBackgrounds: false };
      setConfig(newConfig);
      writeConfigFile(newConfig);
      setIsBackgroundLoaded(true);
    }
  };

  /* This function runs once each time the app is started:
  - it checks if "yasunde" (app's config folder) exists in AppData (or Application Support on MacOS, .config on Linux)
  - if the "yasunde" folder doesn't exist, it creates one
  - it also checks if config.json exists - if it doesn't, it initializes it with default values (DEFAULT_CONFIG)
  - if config.json does exist, it reads its content and parses it
  - if config.json is missing some elements or has bad JSON formatting, it overwrites it with the default values
  - if the configured background image is missing or the path is incorrect, it injects a base64 placeholder, 
    updates the config to the default background, and flags the background as not loaded
  - it applies the final configuration to the actual app window (window size, dark mode, always on top, shuffle default backgrounds)
  - finally, it updates the isConfigLoaded useState in order to render the Timer component only when the read is finished.
  */
  useEffect(() => {
     const initializeApp = async () => {
        try {
          const configFolderExists = await exists("", {baseDir: BaseDirectory.AppConfig});
          if (!configFolderExists) await mkdir("", {baseDir: BaseDirectory.AppConfig});

          let loadedConfig : AppConfig = DEFAULT_CONFIG;
          const configFileExists = await exists("config.json", {baseDir: BaseDirectory.AppConfig});
          
          if (!configFileExists) {
            await writeConfigFile(DEFAULT_CONFIG);
          } else {
            const configContent = await readTextFile("config.json", { baseDir: BaseDirectory.AppConfig });
            try {
              const parsedData = JSON.parse(configContent);
              const isMissingElements = 
                Object.keys(DEFAULT_CONFIG).some(key => !(key in parsedData)) ||
                parsedData.windowSize?.width === undefined ||
                parsedData.windowSize?.height === undefined;

              if (isMissingElements) {
                console.error("Config seems to be missing some JSON elements. Using the default one..");
                await writeConfigFile(DEFAULT_CONFIG);
                loadedConfig = DEFAULT_CONFIG;
              } else {
                loadedConfig = parsedData;
              } 
            } catch (error) {
              console.error("Failed to load config. Using the default one..", error);
              await writeConfigFile(DEFAULT_CONFIG);
            }
          }

          let backgroundImageExists = false;
          if (loadedConfig.backgroundPath.startsWith("/")) {
              /* 
              If user has a leading "/" in their background image's path, we assume it has to be one of
              the bundled default backgrounds that come installed with the app
              */
             backgroundImageExists = defaultBackgrounds.includes(loadedConfig.backgroundPath);
          } else {
            backgroundImageExists = await exists(loadedConfig.backgroundPath);
          }
          
        if (!backgroundImageExists) {
          console.error("Failed to load background image. Using a placeholder..");
          loadedConfig = { ...loadedConfig, backgroundPath: "/backgrounds/defaultbackground_wirestock.jpg" };
          await writeConfigFile(loadedConfig);
          setCurrentBackground(FALLBACK_IMAGE);
          setIsBackgroundLoaded(false);
        } else {
          /* 
          Bundled web assets (defaultBackgrounds array) can be loaded natively with React
          external OS files ("C:\...") have to be routed through Tauri's convertFileSrc function
          */
          const shuffleDefaultBackgrounds = loadedConfig.shuffleDefaultBackgrounds ?? true;

          if (loadedConfig.backgroundPath.startsWith("/")) {
            if (shuffleDefaultBackgrounds) {
              const randomIndex = Math.floor(Math.random() * defaultBackgrounds.length);
              setCurrentBackground(defaultBackgrounds[randomIndex]);
            } else {
              setCurrentBackground(loadedConfig.backgroundPath); 
            }
          } else {
            setCurrentBackground(convertFileSrc(loadedConfig.backgroundPath));
          }
          setIsBackgroundLoaded(true);
        }

        setConfig(loadedConfig);
        setWorkTimeMinutes(loadedConfig.workTimeMinutes);
        setBreakTimeMinutes(loadedConfig.breakTimeMinutes);

        const isDarkMode = loadedConfig.darkMode ?? false;
        setIsDarkMode(isDarkMode);

        const appWindow = getCurrentWindow();
        appWindow.setSize(new LogicalSize(loadedConfig.windowSize.width, loadedConfig.windowSize.height));

        const alwaysOnTop = loadedConfig.alwaysOnTop ?? true;
        appWindow.setAlwaysOnTop(alwaysOnTop);

      } catch (error) {
        console.error("Failed to load config (critical): ", error);
      } finally {
        setIsConfigLoaded(true);
      }
  }
  initializeApp();
  }, []);

  return(
    <div
      className = {isDarkMode? `h-screen w-screen bg-cover bg-center brightness-75` : `h-screen w-screen bg-cover bg-center` }
      style = {{ backgroundImage: `url(${currentBackground})` }}
    >
      <Titlebar changeBackground = {changeBackground} setDarkMode = {setDarkMode} isDarkMode = {isDarkMode}/>
      {isConfigLoaded && isBackgroundLoaded && (
        <Timer workTimeMinutes = {workTimeMinutes} breakTimeMinutes = {breakTimeMinutes} isDarkMode = {isDarkMode}/>
      )}
    </div>
  );
}