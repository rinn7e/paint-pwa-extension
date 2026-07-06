/*
 * Copyright (C) 2026 Moremi Vannak
 * SPDX-License-Identifier: GPL-3.0-only
 */

export interface Model {
  globalEnabled: boolean
  fontSize: number
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
      globalEnabled: boolean
      fontSize: number
      hostname: string
      isSystemPage: boolean
      darkEnabled: boolean
      darkColor: string
      lightEnabled: boolean
      lightColor: string
    }
  | { type: 'ToggleGlobalEnabled' }
  | { type: 'ToggleDarkEnabled' }
  | { type: 'SetDarkColor'; color: string }
  | { type: 'ToggleLightEnabled' }
  | { type: 'SetLightColor'; color: string }
  | { type: 'SetFontSize'; fontSize: number }
  | { type: 'SetFontSizeDone' }
  | { type: 'ExportConfig' }
  | { type: 'ImportConfig'; jsonText: string }
  | { type: 'NoOp' }
