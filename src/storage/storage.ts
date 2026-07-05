import * as TE from 'fp-ts/lib/TaskEither'

export interface Settings {
  enabled: boolean
  darkColor: string
}

export const defaultSettings: Settings = {
  enabled: true,
  darkColor: '#000000',
}

export const loadSettingsPromise = (): Promise<Settings> => {
  return new Promise<Settings>((resolve) => {
    if (
      typeof chrome === 'undefined' ||
      !chrome.storage ||
      !chrome.storage.local
    ) {
      resolve(defaultSettings)
    } else {
      chrome.storage.local.get(['enabled', 'darkColor'], (res) => {
        resolve({
          enabled:
            res.enabled !== undefined
              ? res.enabled
              : defaultSettings.enabled,
          darkColor:
            res.darkColor !== undefined
              ? res.darkColor
              : defaultSettings.darkColor,
        })
      })
    }
  })
}

export const saveSettingsPromise = (settings: Settings): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (
      typeof chrome === 'undefined' ||
      !chrome.storage ||
      !chrome.storage.local
    ) {
      reject(new Error('chrome.storage.local is not available'))
    } else {
      chrome.storage.local.set(settings, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) {
                chrome.tabs
                  .sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
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

export const loadSettings = (): TE.TaskEither<Error, Settings> => {
  return TE.tryCatch(loadSettingsPromise, (reason) => reason as Error)
}

export const saveSettings = (
  settings: Settings,
): TE.TaskEither<Error, void> => {
  return TE.tryCatch(
    () => saveSettingsPromise(settings),
    (reason) => reason as Error,
  )
}
