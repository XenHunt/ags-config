import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"

export default function MemoryWidget() {
  const memoryInfo = createPoll("", 2000, [
    "bash",
    "-c",
    `free -m | awk '
            NR==2 {
                printf "RAM: %5.1f%%\\n", $3*100/$2
            }
            NR==3 {
                printf "Swap: %5.1f%%", $3*100/$2
            }
        '`,
  ])

  return (
    <box cssClasses={["memory-box"]} orientation={Gtk.Orientation.VERTICAL}>
      <label
        label={memoryInfo((info) => {
          const lines = String(info).split("\n")
          return lines[0] || "RAM: 0.0%"
        })}
      />
      <label
        label={memoryInfo((info) => {
          const lines = String(info).split("\n")
          return lines[1] || "Swap: 0.0%"
        })}
      />
    </box>
  )
}
