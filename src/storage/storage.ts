/*
 * Copyright (C) 2026 Moremi Vannak
 * SPDX-License-Identifier: GPL-3.0-only
 */

import * as TE from 'fp-ts/lib/TaskEither'

import { DEFAULT_FONT_SIZE } from '../common/env'
import {
  type GlobalSetting,
  GlobalSettingCodec,
  defaultGlobalSetting,
} from '../common/type/global-setting'
import {
  type Settings,
  SettingsCodec,
  defaultSettings,
} from '../common/type/settings'

export const getHostname = (urlStr: string): string => {
  if (
    !urlStr ||
    urlStr.startsWith('chrome://') ||
    urlStr.startsWith('chrome-extension://') ||
    urlStr.startsWith('safari-web-extension://') ||
    urlStr.startsWith('about:')
  ) {
    return 'system-page'
  }
  try {
    const url = new URL(urlStr)
    return url.hostname
  } catch {
    return 'system-page'
  }
}

export const loadGlobalSettingsPromise = (): Promise<{
  enabled: boolean
  fontSize: number
}> => {
  return new Promise<{ enabled: boolean; fontSize: number }>((resolve) => {
    if (
      typeof chrome === 'undefined' ||
      !chrome.storage ||
      !chrome.storage.local
    ) {
      resolve({ enabled: true, fontSize: DEFAULT_FONT_SIZE })
    } else {
      chrome.storage.local.get(['global_settings'], (res) => {
        const saved = res['global_settings']
        if (!saved) {
          resolve({ enabled: true, fontSize: DEFAULT_FONT_SIZE })
        } else {
          const decoded = GlobalSettingCodec.decode(saved)
          if (decoded._tag === 'Right') {
            resolve({
              enabled: decoded.right.enabled !== undefined ? decoded.right.enabled : true,
              fontSize:
                decoded.right.fontSize !== undefined
                  ? decoded.right.fontSize
                  : DEFAULT_FONT_SIZE,
            })
          } else {
            resolve({ enabled: true, fontSize: DEFAULT_FONT_SIZE })
          }
        }
      })
    }
  })
}

export const saveGlobalSettingsPromise = (
  enabled: boolean,
  fontSize: number,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (
      typeof chrome === 'undefined' ||
      !chrome.storage ||
      !chrome.storage.local
    ) {
      reject(new Error('chrome.storage.local is not available'))
    } else {
      chrome.storage.local.set(
        { global_settings: { enabled, fontSize } },
        () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            chrome.tabs.query({}, (tabs) => {
              tabs.forEach((tab) => {
                if (tab.id) {
                  chrome.tabs
                    .sendMessage(tab.id, {
                      type: 'GLOBAL_SETTINGS_UPDATED',
                      enabled,
                    })
                    .catch(() => {
                      // Suppress error
                    })
                }
              })
            })
            resolve()
          }
        },
      )
    }
  })
}

export const loadSettingsPromise = (hostname: string): Promise<Settings> => {
  return new Promise<Settings>((resolve) => {
    if (
      typeof chrome === 'undefined' ||
      !chrome.storage ||
      !chrome.storage.local ||
      hostname === 'system-page'
    ) {
      resolve(defaultSettings)
    } else {
      chrome.storage.local.get([hostname], (res) => {
        const saved = res[hostname]
        if (!saved) {
          resolve(defaultSettings)
        } else {
          const decoded = SettingsCodec.decode(saved)
          if (decoded._tag === 'Right') {
            resolve({
              darkEnabled:
                decoded.right.darkEnabled !== undefined
                  ? decoded.right.darkEnabled
                  : defaultSettings.darkEnabled,
              darkColor:
                decoded.right.darkColor !== undefined
                  ? decoded.right.darkColor
                  : defaultSettings.darkColor,
              lightEnabled:
                decoded.right.lightEnabled !== undefined
                  ? decoded.right.lightEnabled
                  : defaultSettings.lightEnabled,
              lightColor:
                decoded.right.lightColor !== undefined
                  ? decoded.right.lightColor
                  : defaultSettings.lightColor,
            })
          } else {
            resolve(defaultSettings)
          }
        }
      })
    }
  })
}

export const saveSettingsPromise = (
  hostname: string,
  settings: Settings,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (
      typeof chrome === 'undefined' ||
      !chrome.storage ||
      !chrome.storage.local ||
      hostname === 'system-page'
    ) {
      reject(
        new Error('chrome.storage.local is not available or invalid page'),
      )
    } else {
      chrome.storage.local.set({ [hostname]: settings }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) {
                chrome.tabs
                  .sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
                    hostname,
                    settings,
                  })
                  .catch(() => {
                    // Suppress error
                  })
              }
            })
          })
          resolve()
        }
      })
    }
  })
}

export const queryActiveTabPromise = (): Promise<{
  hostname: string
  url: string
}> => {
  return new Promise((resolve) => {
    const defaultUrl = 'https://web.telegram.org/'
    if (
      typeof chrome === 'undefined' ||
      !chrome.tabs ||
      !chrome.tabs.query
    ) {
      resolve({ hostname: getHostname(defaultUrl), url: defaultUrl })
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0]
        const url = (activeTab && activeTab.url) || defaultUrl
        resolve({ hostname: getHostname(url), url })
      })
    }
  })
}

export const loadSettings = (
  hostname: string,
): TE.TaskEither<Error, Settings> => {
  return TE.tryCatch(
    () => loadSettingsPromise(hostname),
    (reason) => reason as Error,
  )
}

export const saveSettings = (
  hostname: string,
  settings: Settings,
): TE.TaskEither<Error, void> => {
  return TE.tryCatch(
    () => saveSettingsPromise(hostname, settings),
    (reason) => reason as Error,
  )
}
