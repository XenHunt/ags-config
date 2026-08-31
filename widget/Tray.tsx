import { createBinding, For } from "ags"
import { Gtk } from "ags/gtk4"
import Tray from "gi://AstalTray"

export default function TrayWidget() {
  const tray = Tray.get_default()
  if (!tray) return <box visible={false} />

  const items = createBinding(tray, "items")

  const initTrayButton = (btn: Gtk.MenuButton, item: any) => {
    // Привязываем menuModel напрямую
    btn.menu_model = item.menu_model

    // КРИТИЧЕСКИ ВАЖНО: вставляем action group для DBusMenu
    // Без этого клики по пунктам меню не будут работать!
    btn.insert_action_group("dbusmenu", item.action_group)

    // Подписываемся на изменение action_group (если оно произойдёт)
    item.connect("notify::action-group", () => {
      btn.insert_action_group("dbusmenu", item.action_group)
    })
  }

  return (
    <box cssClasses={["tray"]} spacing={5}>
      <For each={items}>
        {(item: any) => (
          <menubutton
            cssClasses={["tray-item"]}
            tooltipMarkup={createBinding(item, "tooltipMarkup")}
            $={(self) => initTrayButton(self, item)}
          >
            <image
              iconName={createBinding(
                item,
                "iconName",
              )((name) => (name && name.length > 0 ? name : null))}
              gicon={createBinding(item, "gicon")}
              pixelSize={18}
            />
          </menubutton>
        )}
      </For>
    </box>
  )
}
