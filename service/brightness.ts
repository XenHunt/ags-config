// service/brightness.ts
import { createState } from "ags"
import Gio from "gi://Gio"
import GLib from "gi://GLib"

const BACKLIGHT_NAME = "nvidia_wmi_ec_backlight"
const BRIGHTNESS_PATH = `/sys/class/backlight/${BACKLIGHT_NAME}/brightness`
const MAX_PATH = `/sys/class/backlight/${BACKLIGHT_NAME}/max_brightness`

function readFileInt(path: string): number {
  try {
    const [ok, bytes] = GLib.file_get_contents(path)
    if (!ok || !bytes) return 0
    const text = new TextDecoder().decode(bytes).trim()
    return Number.parseInt(text) || 0
  } catch {
    return 0
  }
}

let maxBrightness = readFileInt(MAX_PATH)
const [brightness, setBrightness] = createState(0)

function updatePercent() {
  if (maxBrightness <= 0) {
    maxBrightness = readFileInt(MAX_PATH)
  }
  if (maxBrightness <= 0) {
    setBrightness(0)
    return
  }
  const current = readFileInt(BRIGHTNESS_PATH)
  setBrightness(Math.round((current / maxBrightness) * 100))
}

let initialized = false

export function initBrightnessWatcher() {
  if (initialized) return
  initialized = true
  updatePercent()

  try {
    const file = Gio.File.new_for_path(BRIGHTNESS_PATH)
    const monitor = file.monitor(Gio.FileMonitorFlags.NONE, null)
    monitor.connect("changed", () => updatePercent())
  } catch (e) {
    console.error("Brightness file monitor error:", e)
  }

  // Страховочный poll
  GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
    updatePercent()
    return true
  })
}

// Экспортируем getter для использования в других виджетах
export const brightnessState = brightness
