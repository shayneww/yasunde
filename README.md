# yasunde 体

<div align="center">
  <img src="https://i.imgur.com/UJQLDoM.png"><br><br>
  <img src="https://i.imgur.com/vRvfOdY.png"><br><br>
  <img src="https://i.imgur.com/8z1xYF3.png" width=400 height=400><br><br>

  **A minimalistic and customizable Progressive Web App designed for controlling your screen time. Built primarily with React and Tauri.**

  ## About 🔍
  
  yasunde is a simple timer app that was designed for people who need help with controlling their screen time.<br>
  Because computers strain our eyes and long sessions might be harmful to your general posture and body health, it is recommended to have at least a 2-minute "stretch break" every 45 minutes of work in front of the screen.<br>
  That's yasunde's main goal - to have a small timer somewhere on your screen, with a pleasant background image.<br><br>

  The app is also highly customizable. You can change your work time, background image, window size, enable dark mode, and many more with simple instructions listed in the sections below.
</div>

## Key Features ✨
* **Lightweight and high-performance system:** Use of Tauri (Rust) as a main backbone of yasunde that integrates perfectly with React + TypeScript.
* **Timer:** Two timer sections - one for work, one for breaks.
* **Highly customizable:** Customize your version of yasunde with a self-healing and robust `config.json` system (instructions listed in sections below).
  * Ability to customize background image, work time, break time, window size, always on top setting, dark mode, default backgrounds shuffle.
* **Minimalistic UI:** Simple use of the Tailwind CSS library for minimalistic looks.
* **Easy to install:** Can be easily installed on your system.

## How to install (for users) 📥
1. Head over to the **Releases** tab on GitHub.
2. Download and install the latest version for your operating system.
3. Follow your system's installer instructions.

## How to build (for devs) 🛠️

Before you begin, ensure you have [Node.js](https://nodejs.org/) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) (like Rust and standard C++ build tools) installed on your machine.

1. Clone this repository:
   `git clone https://github.com/shayneww/yasunde.git`
2. Navigate into the project directory:
   `cd yasunde`
4. Install the required dependencies:
   `npm install`
5. Run the app in development mode:
   `npx tauri dev`
6. To build the application for production, run:
   `npx tauri build`.
   An installer bundle will appear in `yasunde\src-tauri\target\release`.

## Configuration ⚙️

Upon opening the app for the first time, yasunde folder and config.json file will be generated in your system's default app data folder (that would be `AppData` folder on Windows, `Application Support` on MacOS or `.config` on Linux). <br>You can edit this file in any text editor to change how yasunde behaves. Here is an example of what the configuration looks like:
```json
{
  "backgroundPath": "/backgrounds/defaultbackground_wirestock.jpg",
  "workTimeMinutes": 45,
  "breakTimeMinutes": 2,
  "alwaysOnTop": true,
  "darkMode": false,
  "shuffleDefaultBackgrounds": true,
  "windowSize": {
    "width": 320,
    "height": 210
  }
}
```

### Config Options:
* `backgroundPath` (string): Leave at default or provide a local path to your own image. This can also be easily changed in the app itself by clicking the green dot on the toolbar.
* `workTimeMinutes` (number): Minutes for your work/focus session.
* `breakTimeMinutes` (number): Minutes for your stretch/rest break.
* `alwaysOnTop` (boolean): Set to `true` to keep the timer floating above other windows. Set to `false` if you don't want it to always stay on your screen.
* `darkMode` (boolean): Toggles the dark theme for the UI. Set to true if you want to use a slightly dimmed version. `false` if otherwise. This can also be changed by clicking the moon icon on the toolbar.
* `shuffleBackgrounds` (boolean): Set to `true` to randomly select one of the default backgrounds upon starting the app. Set to `false` otherwise.
* `windowSize` (object): Set your preferred width and height in pixels. Note that very small resolutions may not display the layout correctly, so adjust carefully.

> [!IMPORTANT]  
> Please keep config.json in the correct JSON format. So set true/false for boolean values, use " " for strings, don't change key values etc. If something goes wrong with the format, yasunde will force the default one, which will overwrite your custom settings.

Default backgrounds paths that you can use:<br>
    `"/backgrounds/defaultbackground_wirestock.jpg"`<br>
    `"/backgrounds/fieldsbackground_wirestock.jpg"`<br>
    `"/backgrounds/koibackground_wirestock.jpg"`<br>
    `"/backgrounds/osakabackground_wirestock.jpg"`<br>
    `"/backgrounds/sakurabackground_wirestock.jpg"`

## User Tips 👍
* If you just changed something in your `config.json`, you don't have to turn off and turn on yasunde. Simply hit `CTRL + R` to refresh.
* Yellow dot on the toolbar lets you to hide yasunde for a moment, even if you have always on top setting turned on.
* Green dot on the toolbar allows you to choose your background image by using your OS's dialog. It also immediately turns off the default backgrounds shuffle setting.
* If you want, you can also use this app as a little pomodoro timer. However, features like gathering productivity stats etc. are not planned for yasunde!
