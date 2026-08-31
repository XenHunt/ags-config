// widget/Idle.tsx
import { createState } from "ags"
import { execAsync } from "ags/process"
import Gio from "gi://Gio"
import GLib from "gi://GLib"

export default function IdleWidget() {
  const PID_FILE = "/tmp/ignis_inhibit.pid"

  const checkActive = (): boolean => {
    return GLib.file_test(PID_FILE, GLib.FileTest.EXISTS)
  }

  const [isActive, setIsActive] = createState(checkActive())

  // Мониторим файл событийно
  const file = Gio.File.new_for_path(PID_FILE)
  try {
    const monitor = file.monitor(Gio.FileMonitorFlags.NONE, null)
    monitor.connect("changed", () => {
      setIsActive(checkActive())
    })
  } catch (e) {
    console.error("FileMonitor error:", e)
  }

  return (
    <button
      cssClasses={isActive((active) =>
        active
          ? ["idle-widget", "idle-active"]
          : ["idle-widget", "idle-inactive"],
      )}
      onClicked={() =>
        execAsync("bash -c '$HOME/.config/ags/scripts/idle.sh'").catch(
          console.error,
        )
      }
    >
      <label cssClasses={["text"]} label="⏸" />
    </button>
  )
}
