import app from "ags/gtk4/app"
import Bar from "./widget/Bar"
import OSDWindows from "./widget/OSD"
import { showOSD } from "./service/osd"
import { initBrightnessWatcher } from "./service/brightness"
import { setLedState } from "./service/keyboard-leds"
import { execAsync, exec } from "ags/process"
import { monitorFile } from "ags/file"
import GLib from "gi://GLib"

app.start({
  icons: `${SRC}/icons`, // SRC will point to the root
  instanceName: "my-bar",
  css: "./style.css", // Указываем скомпилированный CSS
  requestHandler(argv: string[], response: (res: string) => void) {
    const [cmd, arg1, arg2] = argv
    console.log(argv)
    if (cmd === "showOSD" && arg1) {
      showOSD(arg1)
      response(`shown: ${arg1}`)
    } else if (cmd === "leds" && arg1 && arg2) {
      // Команда вида: led capslock on
      const ledName = arg1
      const state = arg2 === "on"
      setLedState(ledName, state)
      showOSD(ledName)
      response(`led ${ledName}: ${state}`)
    } else {
      response(`unknown command: ${argv.join(" ")}`)
    }
  },
  main() {
    initBrightnessWatcher()

    execAsync([
      "python3",
      `${GLib.get_user_config_dir()}/ags/scripts/keyboard-leds-monitor.py`,
    ]).catch((err) => console.error("Failed to start keyboard monitor:", err))

    for (const gdkmonitor of app.get_monitors()) {
      Bar(gdkmonitor)
    }
    // Создаём все OSD окна
    OSDWindows()
    // Обновление стилей
    monitorFile(
      // directory that contains the scss files
      `${SRC}/style.scss`,

      function () {
        // main scss file
        const scss = `${SRC}/style.scss`

        // target css file
        const css = `/tmp/my-style.css`

        // compile, reset, apply
        exec(`sassc ${scss} ${css}`)
        app.reset_css()
        app.apply_css(css)
      },
    )
  },
})
