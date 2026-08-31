import { Gtk } from "ags/gtk4"
import { createState } from "ags"
import { execAsync } from "ags/process"
import { showOSD } from "../service/osd"
import { brightnessState, initBrightnessWatcher } from "../service/brightness"

export default function BacklightWidget() {
  // Инициализируем вотчер один раз
  initBrightnessWatcher()

  const [isHyprshadeActive, setIsHyprshadeActive] = createState(false)

  const updateHyprshade = () => {
    execAsync("hyprshade ls")
      .then((out) => setIsHyprshadeActive(String(out).includes("*")))
      .catch(() => setIsHyprshadeActive(false))
  }

  updateHyprshade()

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

  return (
    <button
      cssClasses={["backlight-container"]}
      onRealize={(self: Gtk.Button) =>
        addScrollController(
          self,
          () => {
            execAsync("brightnessctl set 1%+")
              .then(() => showOSD("brightness"))
              .catch(console.error)
          },
          () => {
            execAsync("brightnessctl set 1%-")
              .then(() => showOSD("brightness"))
              .catch(console.error)
          },
        )
      }
      onClicked={() =>
        execAsync("hyprshade toggle")
          .then(() => updateHyprshade())
          .catch(console.error)
      }
    >
      <box spacing={5}>
        <image
          cssClasses={isHyprshadeActive((active) =>
            active ? ["backlight-icon", "active"] : ["backlight-icon"],
          )}
          iconName="display-brightness-symbolic"
          pixelSize={18}
        />
        <label
          cssClasses={["backlight-label"]}
          label={brightnessState((v) => `${v}%`)}
        />
      </box>
    </button>
  )
}
