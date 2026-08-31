import { createBinding } from "ags"
import Battery from "gi://AstalBattery"

export default function BatteryWidget() {
  const battery = Battery.get_default()

  if (!battery) {
    return <box visible={false} />
  }

  const percentage = createBinding(battery, "percentage")
  const charging = createBinding(battery, "charging")

  // AstalBattery может отдавать процент как 0..1 или как 0..100.
  // На всякий случай нормализуем.
  const normalize = (value: number): number => {
    return value > 1 ? value : value * 100
  }

  const labelText = percentage((p) => {
    const pct = Math.round(normalize(p))
    return `${pct}`.padStart(3, " ")
  })

  const labelClasses = percentage((p) => {
    const pct = normalize(p)
    return pct <= 15
      ? ["battery-label", "critical"]
      : ["battery-label", "normal"]
  })

  const iconClasses = percentage((p) => {
    const pct = normalize(p)
    return pct <= 15 ? ["battery-icon", "critical"] : ["battery-icon", "normal"]
  })

  // Родное имя иконки из AstalBattery / UPower.
  const iconName = createBinding(
    battery,
    "iconName",
  )((name) => {
    if (typeof name === "string" && name.length > 0) {
      return name
    }

    // Fallback, если вдруг имя пустое.
    return "battery-good-symbolic"
  })

  return (
    <box cssClasses={["battery-box"]} spacing={2}>
      <label
        cssClasses={labelClasses}
        label={labelText}
        visible={charging((c) => !c) as any}
        xalign={1}
      />

      <image cssClasses={iconClasses} iconName={iconName} pixelSize={28} />
    </box>
  )
}
