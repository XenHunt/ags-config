import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process"

export default function PowerMenu() {
  return (
    <menubutton cssClasses={["power-menu"]}>
      <image iconName="system-shutdown-symbolic" pixelSize={20} />
      <popover>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
          <button
            cssClasses={["menu-item"]}
            onClicked={() => execAsync("swaylock").catch(console.error)}
          >
            <label label="Lock" />
          </button>

          <Gtk.Separator />

          <button
            cssClasses={["menu-item"]}
            onClicked={() =>
              execAsync("systemctl suspend").catch(console.error)
            }
          >
            <label label="Suspend" />
          </button>

          <button
            cssClasses={["menu-item"]}
            onClicked={() =>
              execAsync("systemctl hibernate").catch(console.error)
            }
          >
            <label label="Hibernate" />
          </button>

          <Gtk.Separator />

          <button
            cssClasses={["menu-item"]}
            onClicked={() => execAsync("systemctl reboot").catch(console.error)}
          >
            <label label="Reboot" />
          </button>

          <button
            cssClasses={["menu-item"]}
            onClicked={() =>
              execAsync("systemctl poweroff").catch(console.error)
            }
          >
            <label label="Shutdown" />
          </button>

          <Gtk.Separator />

          <button
            cssClasses={["menu-item"]}
            onClicked={() =>
              execAsync("hyprctl dispatch 'hl.dsp.exit()'").catch(console.error)
            }
          >
            <label label="Logout" />
          </button>
        </box>
      </popover>
    </menubutton>
  )
}
