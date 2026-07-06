/*
 * Copyright (C) 2026 Moremi Vannak
 * SPDX-License-Identifier: GPL-3.0-only
 */

import * as t from 'io-ts'

export interface Settings {
  darkEnabled: boolean
  darkColor: string
  lightEnabled: boolean
  lightColor: string
}

export const SettingsCodec = t.type({
  darkEnabled: t.boolean,
  darkColor: t.string,
  lightEnabled: t.boolean,
  lightColor: t.string,
})

export const defaultSettings: Settings = {
  darkEnabled: true,
  darkColor: '#000000',
  lightEnabled: false,
  lightColor: '#ffffff',
}
