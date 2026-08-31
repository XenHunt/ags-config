#!/usr/bin/env python3
import os
import sys
import subprocess
from pathlib import Path

try:
    import libevdev
except ImportError:
    print("Error: libevdev not installed. Install with: sudo pacman -S python-libevdev")
    sys.exit(1)

DEV_PATH = "/dev/input"
EV_LED = libevdev.EV_LED
LED_NUML = libevdev.EV_LED.LED_NUML
LED_CAPSL = libevdev.EV_LED.LED_CAPSL
LED_SCROLLL = libevdev.EV_LED.LED_SCROLLL


def send_to_ags(led_name: str, state: bool):
    """Отправляет команду в AGS через CLI"""
    state_str = "on" if state else "off"
    cmd = ["ags", "request", "-i", "my-bar", "leds", f"{led_name}", f"{state_str}"]
    try:
        subprocess.run(cmd, check=False, capture_output=True)
    except Exception as e:
        print(f"Failed to send to AGS: {e}")


def device_supports_leds(device):
    """Проверяет, поддерживает ли устройство LED"""
    if not device.has(EV_LED):
        return False
    for led in [LED_NUML, LED_CAPSL, LED_SCROLLL]:
        if device.has(led):
            return True
    return False


def get_initial_state(device):
    """Получает начальное состояние LED"""
    state = {"capslock": False, "numlock": False, "scrolllock": False}
    try:
        for led_code in [LED_CAPSL, LED_NUML, LED_SCROLLL]:
            if device.has(led_code):
                value = device.value[led_code]
                enabled = value != 0
                if led_code == LED_CAPSL:
                    state["capslock"] = enabled
                elif led_code == LED_NUML:
                    state["numlock"] = enabled
                elif led_code == LED_SCROLLL:
                    state["scrolllock"] = enabled
    except:
        pass
    return state


def listen_to_events(device_path: str):
    """Слушает события от устройства"""
    try:
        with open(device_path, "rb") as fd:
            device = libevdev.Device(fd)

            # Отправляем начальное состояние
            initial = get_initial_state(device)
            for led_name, state in initial.items():
                send_to_ags(led_name, state)

            # Слушаем изменения
            while True:
                try:
                    for event in device.events():
                        if event.type == EV_LED:
                            enabled = event.value != 0
                            if event.code == LED_CAPSL:
                                send_to_ags("capslock", enabled)
                            elif event.code == LED_NUML:
                                send_to_ags("numlock", enabled)
                            elif event.code == LED_SCROLLL:
                                send_to_ags("scrolllock", enabled)
                except Exception as e:
                    print(f"Error reading events: {e}")
                    break
    except Exception as e:
        print(f"Error opening device {device_path}: {e}")


def main():
    """Главная функция"""
    # Проверяем права доступа
    if not os.access(DEV_PATH, os.R_OK):
        print("Error: Cannot read /dev/input. Add user to input group:")
        print("  sudo usermod -a -G input $USER")
        print("  # Затем перезайдите в систему")
        sys.exit(1)

    # Находим все устройства с LED
    devices = []
    for filename in os.listdir(DEV_PATH):
        if not filename.startswith("event"):
            continue

        device_path = os.path.join(DEV_PATH, filename)
        try:
            with open(device_path, "rb") as fd:
                device = libevdev.Device(fd)
                if device_supports_leds(device):
                    devices.append(device_path)
        except Exception as e:
            pass

    if not devices:
        print("No devices with LED support found")
        sys.exit(1)

    print(f"Found {len(devices)} device(s) with LED support")

    # Запускаем мониторинг для каждого устройства
    import threading

    threads = []
    for device_path in devices:
        thread = threading.Thread(target=listen_to_events, args=(device_path,))
        thread.daemon = True
        thread.start()
        threads.append(thread)

    # Ждём завершения
    try:
        for thread in threads:
            thread.join()
    except KeyboardInterrupt:
        print("\nStopping keyboard LED monitor")


if __name__ == "__main__":
    main()
