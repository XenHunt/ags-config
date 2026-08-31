// service/osd.ts
import { createState } from "ags"
import GLib from "gi://GLib"

// Имя текущего видимого OSD, или null если все скрыты
const [visibleOSD, setVisibleOSD] = createState<string | null>(null)
let hideSourceId: number | null = null

/**
 * Показывает OSD с указанным именем, скрывая все остальные.
 * Автоматически скрывает через 3 секунды.
 */
export function showOSD(name: string) {
  console.log("showOSD called with:", name)
  console.log("Current visibleOSD:", visibleOSD())

  setVisibleOSD(name)

  console.log("After setVisibleOSD:", visibleOSD())

  if (hideSourceId !== null) {
    GLib.source_remove(hideSourceId)
  }

  hideSourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
    console.log("Hiding OSD")
    setVisibleOSD(null)
    hideSourceId = null
    return false
  })
}

/**
 * Возвращает биндинг видимости для конкретного OSD.
 * Использование: <window visible={osdVisible("audio-output")} />
 */
export function osdVisible(name: string) {
  return visibleOSD((v) => v === name)
}
