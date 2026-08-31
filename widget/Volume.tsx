import { Gtk } from "ags/gtk4"
import { createBinding } from "ags"
import { execAsync } from "ags/process"
import Wp from "gi://AstalWp"
import { showOSD } from "../service/osd"

export default function VolumeControler() {
  const wp = Wp.get_default()!
  const speaker = wp.get_default_speaker()!
  const mic = wp.get_default_microphone()!

  const outputVolume = createBinding(speaker, "volume")
  const outputIcon = createBinding(speaker, "volumeIcon")
  const inputVolume = createBinding(mic, "volume")
  const inputMute = createBinding(mic, "mute")

  const addScrollController = (
    self: Gtk.Widget,
    onUp: () => void,
    onDown: () => void,
  ) => {
    const scroll = new Gtk.EventControllerScroll({
      flags: Gtk.EventControllerScrollFlags.VERTICAL,
    })
    scroll.connect("scroll", (_ctrl: any, _dx: number, dy: number) => {
      if (dy < 0) onUp()
      else if (dy > 0) onDown()
      return true
    })
    self.add_controller(scroll)
  }

  const addRightClickGesture = (self: Gtk.Widget, action: () => void) => {
    const gesture = new Gtk.GestureClick({ button: 3 })
    gesture.connect("pressed", () => action())
    self.add_controller(gesture)
  }

  return (
    <box cssClasses={["volume-container"]} spacing={5}>
      <button
        cssClasses={["output-container"]}
        onRealize={(self: Gtk.Button) => {
          addScrollController(
            self,
            () => {
              speaker.set_volume(Math.min(speaker.volume + 0.01, 1))
              showOSD("audio-output")
            },
            () => {
              speaker.set_volume(Math.max(speaker.volume - 0.01, 0))
              showOSD("audio-output")
            },
          )
          addRightClickGesture(self, () =>
            execAsync("pavucontrol").catch(console.error),
          )
        }}
        onClicked={() => {
          speaker.set_mute(!speaker.mute)
          showOSD("audio-output")
        }}
      >
        <box spacing={5}>
          <image
            iconName={outputIcon((v) => v || "audio-volume-high-symbolic")}
            pixelSize={18}
          />
          <label label={outputVolume((v) => `${Math.round(v * 100)}%`)} />
        </box>
      </button>

      <button
        cssClasses={["input-container"]}
        onRealize={(self: Gtk.Button) => {
          addScrollController(
            self,
            () => {
              mic.set_volume(Math.min(mic.volume + 0.01, 1))
              showOSD("audio-input")
            },
            () => {
              mic.set_volume(Math.max(mic.volume - 0.01, 0))
              showOSD("audio-input")
            },
          )
          addRightClickGesture(self, () =>
            execAsync("pavucontrol").catch(console.error),
          )
        }}
        onClicked={() => {
          mic.set_mute(!mic.mute)
          showOSD("audio-input")
        }}
      >
        <box spacing={5}>
          <image
            iconName={inputMute((m) =>
              m ? "microphone-slash-symbolic" : "microphone-symbolic",
            )}
            pixelSize={15}
          />
          <label label={inputVolume((v) => `${Math.round(v * 100)}%`)} />
        </box>
      </button>
    </box>
  )
}
