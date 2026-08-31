import { Astal } from "ags/gtk4"
import { createBinding } from "ags"
import { osdVisible } from "../service/osd"
import Wp from "gi://AstalWp"
import { brightnessState, initBrightnessWatcher } from "../service/brightness"
import { leds } from "../service/keyboard-leds"

export function AudioOutputOSD() {
  const wp = Wp.get_default()!
  const speaker = wp.get_default_speaker()!

  const volume = createBinding(speaker, "volume")
  const icon = createBinding(speaker, "volumeIcon")

  return (
    <window
      name="osd-audio-output"
      namespace="osd-audio-output"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={osdVisible("audio-output") as any}
    >
      <box cssClasses={["osd"]} spacing={10}>
        <image
          iconName={icon((v) => v || "audio-volume-high-symbolic")}
          pixelSize={40}
        />
        <slider
          cssClasses={["material-slider"]}
          min={0}
          max={1}
          value={volume}
          hexpand
          sensitive={false}
        />
      </box>
    </window>
  )
}

export function AudioInputOSD() {
  const wp = Wp.get_default()!
  const mic = wp.get_default_microphone()!

  const volume = createBinding(mic, "volume")
  const icon = createBinding(mic, "volumeIcon")

  return (
    <window
      name="osd-audio-input"
      namespace="osd-audio-input"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={osdVisible("audio-input") as any}
    >
      <box cssClasses={["osd"]} spacing={10}>
        <image
          iconName={icon((v) => v || "microphone-symbolic")}
          pixelSize={40}
        />
        <slider
          cssClasses={["material-slider"]}
          min={0}
          max={1}
          value={volume}
          hexpand
          sensitive={false}
        />
      </box>
    </window>
  )
}

export function BrightnessOSD() {
  return (
    <window
      name="osd-brightness"
      namespace="osd-brightness"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={osdVisible("brightness") as any}
    >
      <box cssClasses={["osd"]} spacing={10}>
        <image iconName="display-brightness-symbolic" pixelSize={40} />
        <slider
          cssClasses={["material-slider"]}
          min={0}
          max={100}
          value={brightnessState}
          hexpand
          sensitive={false}
        />
      </box>
    </window>
  )
}

export function CapsLockOSD() {
  return (
    <window
      name="osd-capslock"
      namespace="osd-capslock"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={osdVisible("capslock") as any}
    >
      <box cssClasses={["osd"]} spacing={10}>
        <label label="Caps Lock" cssClasses={["osd-text"]} />
        <label
          cssClasses={leds((state) =>
            state.capsLock ? ["osd-icon", "active"] : ["osd-icon", "inactive"],
          )}
          label={leds((state) => (state.capsLock ? "ON" : "OFF"))}
        />
      </box>
    </window>
  )
}

export function NumLockOSD() {
  return (
    <window
      name="osd-numlock"
      namespace="osd-numlock"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={osdVisible("numlock") as any}
    >
      <box cssClasses={["osd"]} spacing={10}>
        <label label="Num Lock" cssClasses={["osd-text"]} />
        <label
          cssClasses={leds((state) =>
            state.numLock ? ["osd-icon", "active"] : ["osd-icon", "inactive"],
          )}
          label={leds((state) => (state.numLock ? "ON" : "OFF"))}
        />
      </box>
    </window>
  )
}

export function ScrollLockOSD() {
  return (
    <window
      name="osd-scrolllock"
      namespace="osd-scrolllock"
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.IGNORE}
      visible={osdVisible("scrolllock") as any}
    >
      <box cssClasses={["osd"]} spacing={10}>
        <label label="Scroll Lock" cssClasses={["osd-text"]} />
        <label
          cssClasses={leds((state) =>
            state.scrollLock
              ? ["osd-icon", "active"]
              : ["osd-icon", "inactive"],
          )}
          label={leds((state) => (state.scrollLock ? "ON" : "OFF"))}
        />
      </box>
    </window>
  )
}

export default function OSDWindows() {
  return (
    <>
      <AudioOutputOSD />
      <AudioInputOSD />
      <BrightnessOSD />
      <CapsLockOSD />
      <NumLockOSD />
      <ScrollLockOSD />
    </>
  )
}
