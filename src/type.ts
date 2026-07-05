export interface Model {
  enabled: boolean
  darkColor: string
}

export type Msg =
  | { type: 'InitSettings'; enabled: boolean; darkColor: string }
  | { type: 'ToggleEnabled' }
  | { type: 'SetColor'; color: string }
  | { type: 'NoOp' }
