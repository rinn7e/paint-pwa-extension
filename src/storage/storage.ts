import * as TE from 'fp-ts/lib/TaskEither'

export interface Settings {
  darkEnabled: boolean
  darkColor: string
  lightEnabled: boolean
  lightColor: string
}

export const defaultSettings: Settings = {
  darkEnabled: true,
  darkColor: '#000000',
  lightEnabled: false,
  lightColor: '#ffffff',
}

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
        if (saved) {
          resolve({
            darkEnabled:
              saved.darkEnabled !== undefined
                ? saved.darkEnabled
                : defaultSettings.darkEnabled,
            darkColor:
              saved.darkColor !== undefined
                ? saved.darkColor
                : defaultSettings.darkColor,
            lightEnabled:
              saved.lightEnabled !== undefined
                ? saved.lightEnabled
                : defaultSettings.lightEnabled,
            lightColor:
              saved.lightColor !== undefined
                ? saved.lightColor
                : defaultSettings.lightColor,
          })
        } else {
          resolve(defaultSettings)
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
