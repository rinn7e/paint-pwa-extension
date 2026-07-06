/*
 * Copyright (C) 2026 Moremi Vannak
 * SPDX-License-Identifier: GPL-3.0-only
 */

import * as t from 'io-ts'
import { DEFAULT_FONT_SIZE } from '../env'

export type GlobalSetting = {
  enabled: boolean
  fontSize: number
}

export const GlobalSettingCodec = t.type({
  enabled: t.boolean,
  fontSize: t.number,
})

export const defaultGlobalSetting: GlobalSetting = {
  enabled: true,
  fontSize: DEFAULT_FONT_SIZE,
}
