import { createState } from "ags"
import { execAsync } from "ags/process"
import Hyprland from "gi://AstalHyprland"

function shrinkLanguage(value: string): string {
  if (!value) return "🌐"
  if (value.includes("Russian")) return "RU 🇷🇺"
  if (value.split(" ")[0] === "English") return "EN 🇺🇸"
  return "🌐"
}

// Асинхронный запрос текущей раскладки при старте
async function fetchInitialLayout(): Promise<string> {
  try {
    const out = await execAsync("hyprctl devices -j")
    const data = JSON.parse(out)
    const keyboards = data.keyboards || []
    const kb = keyboards.find((k: any) => k.main) || keyboards[0]
    return kb?.active_keymap || ""
  } catch {
    return ""
  }
}

export default function KeyboardLayoutWidget() {
  const hyprland = Hyprland.get_default()!

  const [layout, setLayout] = createState("🌐")

  // Первичный запрос при старте — решает проблему пустого значения
  fetchInitialLayout().then((value) => {
    if (value) setLayout(value)
  })

  // Подписка на события для мгновенных обновлений при смене раскладки
  hyprland.connect("event", (_self: any, event: string, args: string) => {
    if (event === "activelayout") {
      // args формат: "keyboard_name,layout_name"
      const commaIndex = args.indexOf(",")
      if (commaIndex !== -1) {
        const layoutName = args.substring(commaIndex + 1)
        setLayout(layoutName)
      }
    }
  })

  return (
    <button
      cssClasses={["layout"]}
      onClicked={() =>
        execAsync("hyprctl switchxkblayout all next").catch(console.error)
      }
    >
      <label label={layout((v) => shrinkLanguage(v))} />
    </button>
  )
}
