import { createState } from "ags"
import { createPoll } from "ags/time"
import { Gtk } from "ags/gtk4" // ← добавлен импорт
import GLib from "gi://GLib"

export default function ClockWidget() {
  const [mode, setMode] = createState(0)
  const formats = ["%H:%M", "%H:%M:%S", "%H:%M:%S %d %b"]

  const [time, setTime] = createState("")
  const calendar = createPoll("", 60000, ["bash", "-c", "cal -3"])

  const updateTime = () => {
    const now = GLib.DateTime.new_now_local()
    const m = mode()
    const format = formats[m % formats.length]
    const formatted = now.format(format)
    setTime(formatted !== null ? formatted : "")
  }

  updateTime()
  setInterval(updateTime, 1000)

  return (
    <menubutton cssClasses={["clock"]}>
      <label label={time} />
      <popover css_classes={["calendar"]}>
        <Gtk.Calendar
          onRealize={(self) => {
            self.has_tooltip = false
          }}
        />
      </popover>
    </menubutton>
  )
}
