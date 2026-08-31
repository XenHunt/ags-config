import { execAsync } from "ags/process"
import Gio from "gi://Gio"
import GLib from "gi://GLib"
import { Gtk, Gdk } from "ags/gtk4"

const CONFIG_DIR = GLib.get_user_config_dir() + "/ags"
const SCSS_FILE = `${CONFIG_DIR}/style.scss`
const CSS_FILE = `/tmp/ags-style-${GLib.get_user_name()}.css`

// Ссылка на текущий CSS provider для его удаления перед применением нового
let currentProvider: Gtk.CssProvider | null = null

/**
 * Компилирует SCSS в CSS и применяет к GTK
 */
async function compileAndApplyScss() {
  try {
    // Компилируем SCSS в CSS
    await execAsync(`sassc ${SCSS_FILE} ${CSS_FILE}`)
    console.log("SCSS compiled successfully")

    // Применяем CSS через GTK4
    const display = Gdk.Display.get_default()
    if (!display) {
      console.error("No display available")
      return
    }

    // Удаляем старый provider если есть
    if (currentProvider) {
      Gtk.StyleContext.remove_provider_for_display(display, currentProvider)
      currentProvider = null
    }

    // Создаём новый provider и загружаем CSS
    const provider = new Gtk.CssProvider()
    provider.load_from_path(CSS_FILE)

    // Применяем с приоритетом APPLICATION (выше темы, но ниже USER)
    Gtk.StyleContext.add_provider_for_display(
      display,
      provider,
      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
    )

    currentProvider = provider
    console.log("CSS applied successfully")
  } catch (error) {
    console.error("Failed to compile/apply SCSS:", error)
  }
}

/**
 * Запускает мониторинг SCSS файлов
 */
export function startScssWatcher() {
  // Первоначальная компиляция
  compileAndApplyScss()

  // Мониторим основной SCSS файл
  const scssFile = Gio.File.new_for_path(SCSS_FILE)
  const monitor = scssFile.monitor(Gio.FileMonitorFlags.NONE, null)

  monitor.connect(
    "changed",
    (_monitor: any, _file: any, _other: any, eventType: any) => {
      // Реагируем только на изменения содержимого
      if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
        console.log("SCSS file changed, recompiling...")
        compileAndApplyScss()
      }
    },
  )

  console.log("SCSS watcher started")
}

/**
 * Возвращает путь к скомпилированному CSS (для использования в app.start)
 */
export function getCompiledCssPath(): string {
  return CSS_FILE
}
