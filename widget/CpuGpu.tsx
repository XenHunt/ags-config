import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"

const CPU_TEMP_THRESHOLD = 80
const GPU_TEMP_THRESHOLD = 80

interface CpuGpuData {
  cpuPercent: string
  cpuTemp: number
  gpuPercent: string
  gpuTemp: number
  gpuFound: boolean
}

export default function CpuGpuWidget() {
  const cpuData = createPoll({ cpuPercent: "0.0", cpuTemp: 0 } as any, 2000, [
    "bash",
    "-c",
    `top -bn1 | grep 'Cpu(s)' | awk '{print $2}' && sensors | grep 'Package id 0' | awk '{print $4}' | sed 's/+//g; s/°C//'`,
  ])

  const gpuData = createPoll(
    { gpuPercent: "0.0", gpuTemp: 0, gpuFound: false } as any,
    2000,
    [
      "bash",
      "-c",
      `nvidia-smi --query-gpu=utilization.gpu,temperature.gpu --format=csv,noheader,nounits 2>/dev/null || echo "not found"`,
    ],
  )

  const cpuInfo = cpuData((v: any) => {
    const lines = String(v).trim().split("\n")
    const percent = lines[0] || "0.0"
    const temp = parseFloat(lines[1]) || 0
    const tempClass = temp >= CPU_TEMP_THRESHOLD ? "critical" : "normal"
    return {
      text: `CPU: ${percent.padStart(5)}% | Temp: ${temp.toFixed(1).padStart(5)}°C`,
      class: tempClass,
    }
  })

  const gpuInfo = gpuData((v: any) => {
    const line = String(v).trim()
    if (line === "not found" || !line) {
      return { text: "GPU: Not found", class: "normal" }
    }
    const parts = line.split(",")
    if (parts.length < 2) {
      return { text: "GPU: Error", class: "normal" }
    }
    const util = parseFloat(parts[0]) || 0
    const temp = parseFloat(parts[1]) || 0
    const tempClass = temp >= GPU_TEMP_THRESHOLD ? "critical" : "normal"
    return {
      text: `GPU: ${util.toFixed(1).padStart(5)}% | Temp: ${temp.toFixed(1).padStart(5)}°C`,
      class: tempClass,
    }
  })

  return (
    <box cssClasses={["cpu-gpu-box"]} orientation={Gtk.Orientation.VERTICAL}>
      <label
        label={cpuInfo((info: any) => info.text)}
        cssClasses={cpuInfo((info: any) => ["monospace", info.class])}
      />
      <label
        label={gpuInfo((info: any) => info.text)}
        cssClasses={gpuInfo((info: any) => ["monospace", info.class])}
      />
    </box>
  )
}
