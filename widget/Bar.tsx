import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import { createBinding, For } from "ags"
import { execAsync } from "ags/process"
import Hyprland from "gi://AstalHyprland"
import Mpris from "gi://AstalMpris"
import BatteryWidget from "./Battery"
import TrayWidget from "./Tray"
import ClockWidget from "./Clock"
import IdleWidget from "./Idle"
import KeyboardLayoutWidget from "./KeyboardLayout"
import MemoryWidget from "./Memory"
import CpuGpuWidget from "./CpuGpu"
import VolumeControler from "./Volume"
import BacklightWidget from "./Backlight"

function MediaPlayer({ player }: { player: any }) {
  const title = createBinding(player, "title")
  return (
    <box spacing={10}>
      <image iconName="audio-x-generic-symbolic" />
      <label
        maxWidthChars={20}
        ellipsize={3}
        label={title((t) => t || "Unknown")}
      />
    </box>
  )
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const hyprland = Hyprland.get_default()
  const mpris = Mpris.get_default()
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  // --- Workspaces ---
  // Фильтруем только обычные рабочие столы (id > 0), исключаем special workspace
  const sortedWorkspaces = createBinding(
    hyprland,
    "workspaces",
  )((ws) => [...ws].filter((w) => w.id > 0).sort((a, b) => a.id - b.id))

  const Workspaces = () => (
    <box cssClasses={["workspaces"]} spacing={5}>
      <For each={sortedWorkspaces}>
        {(ws) => (
          <button
            cssClasses={createBinding(
              hyprland,
              "focusedWorkspace",
            )((fw) =>
              fw?.id === ws.id ? ["workspace", "active"] : ["workspace"],
            )}
            onClicked={() =>
              execAsync(
                `hyprctl dispatch 'hl.dsp.focus({ workspace = "${ws.id}" })'`,
              ).catch(console.error)
            }
          >
            <label label={`${ws.id}`} width_chars={2} />
          </button>
        )}
      </For>
    </box>
  )

  // --- Client Title ---
  const ClientTitle = () => (
    <label
      cssClasses={["client-title"]}
      maxWidthChars={40}
      ellipsize={3}
      label={createBinding(
        hyprland,
        "focusedClient",
      )((client) => client?.title || "")}
    />
  )

  // --- Media ---
  const Media = () => {
    const playersBinding = createBinding(mpris, "players")
    return (
      <box spacing={10}>
        <label
          label="No media players"
          visible={playersBinding((players) => players.length === 0) as any}
        />
        <For each={playersBinding}>
          {(player) => <MediaPlayer player={player} />}
        </For>
      </box>
    )
  }

  return (
    <window
      visible
      name="bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssClasses={["bar"]}>
        {/* Left */}
        <box $type="start" spacing={10}>
          <Workspaces />
          <ClientTitle />
        </box>

        {/* Center */}
        <box $type="center" spacing={10}>
          <Media />
        </box>

        {/* Right */}
        <box $type="end" spacing={10}>
          <CpuGpuWidget />
          <MemoryWidget />
          <KeyboardLayoutWidget />
          <VolumeControler />
          <BacklightWidget />
          <IdleWidget />
          <ClockWidget />
          <TrayWidget />
          <BatteryWidget />
        </box>
      </centerbox>
    </window>
  )
}
