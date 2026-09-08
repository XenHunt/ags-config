import { createState } from "ags"
import { Gtk } from "ags/gtk4" // ← добавлен импорт
import GLib from "gi://GLib"

export default function ClockWidget() {
  const [mode, setMode] = createState(0)
  const formats = ["%H:%M", "%H:%M:%S", "%H:%M:%S %d %b"]

  const [time, setTime] = createState("")

  const updateTime = () => {
    const now = GLib.DateTime.new_now_local()
    const m = mode()
    const format = formats[m % formats.length]
    const formatted = now.format(format)
    setTime(formatted !== null ? formatted : "")
  }

  const changeMode = () => {
    const m = mode()
    setMode((m + 1) % formats.length)
  }

  const addRightClickGesture = (self: Gtk.Widget, action: () => void) => {
    const gesture = new Gtk.GestureClick({ button: 3 })
    gesture.connect("pressed", () => action())
    self.add_controller(gesture)
  }

  updateTime()
  setInterval(updateTime, 1000)

  return (
    <menubutton
      cssClasses={["clock"]}
      onRealize={(self: Gtk.MenuButton) => {
        addRightClickGesture(self, changeMode)
      }}
    >
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
