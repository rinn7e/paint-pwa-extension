export interface Model {
  hostname: string
  isSystemPage: boolean
  darkEnabled: boolean
  darkColor: string
  lightEnabled: boolean
  lightColor: string
}

export type Msg =
  | {
      type: 'InitSettings'
      hostname: string
      isSystemPage: boolean
      darkEnabled: boolean
      darkColor: string
      lightEnabled: boolean
      lightColor: string
    }
  | { type: 'ToggleDarkEnabled' }
  | { type: 'SetDarkColor'; color: string }
  | { type: 'ToggleLightEnabled' }
  | { type: 'SetLightColor'; color: string }
  | { type: 'NoOp' }
