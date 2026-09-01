import { createState } from "ags"
import { monitorFile, readFile } from "ags/file"
import { interval } from "ags/time"

const BACKLIGHT_NAME = "nvidia_wmi_ec_backlight"
const BRIGHTNESS_PATH = `/sys/class/backlight/${BACKLIGHT_NAME}/brightness`
const MAX_PATH = `/sys/class/backlight/${BACKLIGHT_NAME}/max_brightness`

function readFileInt(path: string): number {
  try {
    const text = readFile(path).trim()
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

  // Мониторим изменения файла через AGS Utils
  try {
    monitorFile(BRIGHTNESS_PATH, () => {
      updatePercent()
    })
  } catch (e) {
    console.error("Brightness file monitor error:", e)
  }

  // Страховочный poll через AGS interval (срабатывает сразу и затем каждые 1000мс)
  interval(1000, () => {
    updatePercent()
  })
}

export const brightnessState = brightness
