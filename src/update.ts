/*
 * Copyright (C) 2026 Moremi Vannak
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { Cmd, Task } from 'tea-cup-fp'
import * as t from 'io-ts'

import { DEFAULT_FONT_SIZE } from './common/env'
import {
  type GlobalSetting,
  GlobalSettingCodec,
  defaultGlobalSetting,
} from './common/type/global-setting'
import {
  type Settings,
  SettingsCodec,
  defaultSettings,
} from './common/type/settings'
import {
  loadGlobalSettingsPromise,
  loadSettingsPromise,
  queryActiveTabPromise,
  saveGlobalSettingsPromise,
  saveSettingsPromise,
} from './storage/storage'
import { type Model, type Msg } from './type'

const queryActiveTabAndSettings = async (): Promise<{
  globalEnabled: boolean
  fontSize: number
  hostname: string
  isSystemPage: boolean
  settings: Settings
}> => {
  const global = await loadGlobalSettingsPromise()
  const { hostname } = await queryActiveTabPromise()
  const isSystemPage = hostname === 'system-page'
  const settings = await loadSettingsPromise(hostname)
  return {
    globalEnabled: global.enabled,
    fontSize: global.fontSize,
    hostname,
    isSystemPage,
    settings,
  }
}

export const init = (): [Model | null, Cmd<Msg>] => {
  const cmd = Task.attempt(
    Task.fromPromise(queryActiveTabAndSettings),
    (result): Msg => {
      if (result.tag === 'Ok') {
        return {
          type: 'InitSettings',
          globalEnabled: result.value.globalEnabled,
          fontSize: result.value.fontSize,
          hostname: result.value.hostname,
          isSystemPage: result.value.isSystemPage,
          darkEnabled: result.value.settings.darkEnabled,
          darkColor: result.value.settings.darkColor,
          lightEnabled: result.value.settings.lightEnabled,
          lightColor: result.value.settings.lightColor,
        }
      } else {
        return {
          type: 'InitSettings',
          globalEnabled: true,
          fontSize: DEFAULT_FONT_SIZE,
          hostname: 'system-page',
          isSystemPage: true,
          darkEnabled: defaultSettings.darkEnabled,
          darkColor: defaultSettings.darkColor,
          lightEnabled: defaultSettings.lightEnabled,
          lightColor: defaultSettings.lightColor,
        }
      }
    },
  )
  return [null, cmd]
}

export const updateRootFontSizeCmd = (fontSize: number): Cmd<Msg> => {
  return Task.attempt(
    Task.fromPromise(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.fontSize = `${fontSize}px`
      }
      return Promise.resolve()
    }),
    (): Msg => ({ type: 'SetFontSizeDone' }),
  )
}

// Sub-updaters for easier testing & composability
export const handleInitSettings = (
  msg: Extract<Msg, { type: 'InitSettings' }>,
): Model => {
  return {
    globalEnabled: msg.globalEnabled,
    fontSize: msg.fontSize,
    hostname: msg.hostname,
    isSystemPage: msg.isSystemPage,
    darkEnabled: msg.darkEnabled,
    darkColor: msg.darkColor,
    lightEnabled: msg.lightEnabled,
    lightColor: msg.lightColor,
  }
}

export const handleToggleGlobalEnabled = (model: Model): [Model, Cmd<Msg>] => {
  const nextGlobalEnabled = !model.globalEnabled
  const nextModel = { ...model, globalEnabled: nextGlobalEnabled }
  const cmd = Task.attempt(
    Task.fromPromise(() =>
      saveGlobalSettingsPromise(nextGlobalEnabled, model.fontSize),
    ),
    (): Msg => ({ type: 'NoOp' }),
  )
  return [nextModel, cmd]
}

export const handleSetFontSize = (
  model: Model,
  fontSize: number,
): [Model, Cmd<Msg>] => {
  const clamped = Math.min(32, Math.max(12, fontSize))
  const nextModel = { ...model, fontSize: clamped }
  const cmd = Task.attempt(
    Task.fromPromise(() =>
      saveGlobalSettingsPromise(model.globalEnabled, clamped),
    ),
    (): Msg => ({ type: 'NoOp' }),
  )
  return [
    nextModel,
    Cmd.batch([cmd, updateRootFontSizeCmd(clamped)]),
  ]
}

export const handleToggleDarkEnabled = (model: Model): [Model, Cmd<Msg>] => {
  if (model.isSystemPage) return [model, Cmd.none()]
  const nextModel = { ...model, darkEnabled: !model.darkEnabled }
  const cmd = Task.attempt(
    Task.fromPromise(() => saveSettingsPromise(model.hostname, nextModel)),
    (): Msg => ({ type: 'NoOp' }),
  )
  return [nextModel, cmd]
}

export const handleSetDarkColor = (
  model: Model,
  color: string,
): [Model, Cmd<Msg>] => {
  if (model.isSystemPage) return [model, Cmd.none()]
  const nextModel = { ...model, darkColor: color }
  const cmd = Task.attempt(
    Task.fromPromise(() => saveSettingsPromise(model.hostname, nextModel)),
    (): Msg => ({ type: 'NoOp' }),
  )
  return [nextModel, cmd]
}

export const handleToggleLightEnabled = (model: Model): [Model, Cmd<Msg>] => {
  if (model.isSystemPage) return [model, Cmd.none()]
  const nextModel = { ...model, lightEnabled: !model.lightEnabled }
  const cmd = Task.attempt(
    Task.fromPromise(() => saveSettingsPromise(model.hostname, nextModel)),
    (): Msg => ({ type: 'NoOp' }),
  )
  return [nextModel, cmd]
}

export const handleSetLightColor = (
  model: Model,
  color: string,
): [Model, Cmd<Msg>] => {
  if (model.isSystemPage) return [model, Cmd.none()]
  const nextModel = { ...model, lightColor: color }
  const cmd = Task.attempt(
    Task.fromPromise(() => saveSettingsPromise(model.hostname, nextModel)),
    (): Msg => ({ type: 'NoOp' }),
  )
  return [nextModel, cmd]
}

export const update = (
  msg: Msg,
  model: Model | null,
): [Model | null, Cmd<Msg>] => {
  if (msg.type === 'InitSettings') {
    return [handleInitSettings(msg), updateRootFontSizeCmd(msg.fontSize)]
  }

  if (!model) {
    return [null, Cmd.none()]
  }

  switch (msg.type) {
    case 'ToggleGlobalEnabled':
      return handleToggleGlobalEnabled(model)
    case 'SetFontSize':
      return handleSetFontSize(model, msg.fontSize)
    case 'ToggleDarkEnabled':
      return handleToggleDarkEnabled(model)
    case 'SetDarkColor':
      return handleSetDarkColor(model, msg.color)
    case 'ToggleLightEnabled':
      return handleToggleLightEnabled(model)
    case 'SetLightColor':
      return handleSetLightColor(model, msg.color)
    case 'ExportConfig':
      return [model, triggerExportCmd()]
    case 'ImportConfig':
      return [model, triggerImportCmd(msg.jsonText)]
    case 'SetFontSizeDone':
    case 'NoOp':
    default:
      return [model, Cmd.none()]
  }
}

export const validateBackupData = (data: unknown): boolean => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false
  }
  const keys = Object.keys(data)
  if (keys.length === 0) {
    return false
  }
  let isValid = true
  for (const key of keys) {
    const val = (data as Record<string, unknown>)[key]
    if (key === 'global_settings') {
      const decoded = GlobalSettingCodec.decode(val)
      if (decoded._tag === 'Left') {
        isValid = false
      }
    } else {
      const decoded = SettingsCodec.decode(val)
      if (decoded._tag === 'Left') {
        isValid = false
      }
    }
  }
  return isValid
}

export const triggerExportCmd = (): Cmd<Msg> => {
  return Task.attempt(
    Task.fromPromise(() => {
      return new Promise<void>((resolve) => {
        if (
          typeof chrome === 'undefined' ||
          !chrome.storage ||
          !chrome.storage.local
        ) {
          console.warn('[Paint PWA] storage.local not available for export')
          resolve()
        } else {
          chrome.storage.local.get(null, (allData) => {
            try {
              const jsonStr = JSON.stringify(allData, null, 2)
              const blob = new Blob([jsonStr], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'paint-pwa-backup.json'
              a.click()
              URL.revokeObjectURL(url)
            } catch (e) {
              console.error('[Paint PWA] Export error:', e)
            }
            resolve()
          })
        }
      })
    }),
    (): Msg => ({ type: 'NoOp' }),
  )
}

export const triggerImportCmd = (jsonText: string): Cmd<Msg> => {
  return Task.attempt(
    Task.fromPromise(async () => {
      if (
        typeof chrome === 'undefined' ||
        !chrome.storage ||
        !chrome.storage.local
      ) {
        alert('Storage API is not available.')
      } else {
        try {
          const parsed = JSON.parse(jsonText)
          if (!validateBackupData(parsed)) {
            alert('Invalid backup file format.')
          } else {
            await new Promise<void>((resolve, reject) => {
              chrome.storage.local.clear(() => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message))
                } else {
                  resolve()
                }
              })
            })

            await new Promise<void>((resolve, reject) => {
              chrome.storage.local.set(parsed, () => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message))
                } else {
                  resolve()
                }
              })
            })

            alert('Configuration imported successfully!')
            window.location.reload()
          }
        } catch (e) {
          console.error('[Paint PWA] Import failed:', e)
          alert('Failed to parse backup file.')
        }
      }
    }),
    (): Msg => ({ type: 'NoOp' }),
  )
}
