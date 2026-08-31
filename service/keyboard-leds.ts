// service/keyboard-leds.ts
import { createState } from "ags"

export interface KeyboardLedsState {
  capsLock: boolean
  numLock: boolean
  scrollLock: boolean
}

const [ledsState, setLedsState] = createState<KeyboardLedsState>({
  capsLock: false,
  numLock: false,
  scrollLock: false,
})

export function setLedState(ledName: string, state: boolean) {
  const current = ledsState()
  const newState = { ...current }

  if (ledName === "capslock") {
    newState.capsLock = state
  } else if (ledName === "numlock") {
    newState.numLock = state
  } else if (ledName === "scrolllock") {
    newState.scrollLock = state
  }

  setLedsState(newState)
}

export const leds = ledsState
