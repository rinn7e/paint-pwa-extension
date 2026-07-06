/*
 * Copyright (C) 2026 Moremi Vannak
 * SPDX-License-Identifier: GPL-3.0-only
 */

let globalEnabled = true
let darkEnabled = false
let darkColor = '#000000'
let lightEnabled = false
let lightColor = '#ffffff'

// Keep track of the original theme color that was specified in the HTML or dynamically set when not overriden
let initialThemeColor: string | null = null
let didCheckInitialColor = false

// Keep track of whether we created the meta tag ourselves
let createdMetaElement: HTMLMetaElement | null = null

// MutationObserver instance
let headObserver: MutationObserver | null = null

// Helper: Query for the theme-color meta element
const getThemeColorMeta = (): HTMLMetaElement | null => {
  return document.querySelector('meta[name="theme-color"]')
}

// Media query to detect system light/dark mode preference
const prefersDarkModeMedia = window.matchMedia('(prefers-color-scheme: dark)')

// Function to check and capture initial developer-set theme color
const captureInitialThemeColor = () => {
  if (didCheckInitialColor) return
  const meta = getThemeColorMeta()
  if (meta) {
    initialThemeColor = meta.getAttribute('content')
    didCheckInitialColor = true
  }
}

// Function to apply/enforce the theme color based on active mode and enabled state
const applyThemeColor = () => {
  const isDarkMode = prefersDarkModeMedia.matches
  const shouldEnforce =
    globalEnabled && (isDarkMode ? darkEnabled : lightEnabled)
  const targetColor = isDarkMode ? darkColor : lightColor

  if (shouldEnforce) {
    captureInitialThemeColor()

    let meta = getThemeColorMeta()
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = targetColor
      document.head.appendChild(meta)
      createdMetaElement = meta
    } else {
      if (meta.getAttribute('content') !== targetColor) {
        meta.setAttribute('content', targetColor)
      }
    }
  } else {
    let meta = getThemeColorMeta()
    if (meta) {
      if (createdMetaElement === meta) {
        meta.remove()
        createdMetaElement = null
      } else if (
        initialThemeColor !== null &&
        meta.getAttribute('content') !== initialThemeColor
      ) {
        meta.setAttribute('content', initialThemeColor)
      }
    }
    if (!meta) {
      didCheckInitialColor = false
      initialThemeColor = null
    }
  }
}

// Handler for mutations in head or theme-color element
const handleMutations = (mutations: MutationRecord[]) => {
  const isDarkMode = prefersDarkModeMedia.matches
  const shouldEnforce =
    globalEnabled && (isDarkMode ? darkEnabled : lightEnabled)
  const targetColor = isDarkMode ? darkColor : lightColor

  if (!shouldEnforce) {
    const meta = getThemeColorMeta()
    if (meta && meta !== createdMetaElement) {
      initialThemeColor = meta.getAttribute('content')
      didCheckInitialColor = true
    }
    return
  }

  let needsEnforce = false

  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node instanceof HTMLMetaElement && node.name === 'theme-color') {
          if (node.getAttribute('content') !== targetColor) {
            initialThemeColor = node.getAttribute('content')
            didCheckInitialColor = true
            needsEnforce = true
          }
        }
      }
      for (const node of Array.from(mutation.removedNodes)) {
        if (node instanceof HTMLMetaElement && node.name === 'theme-color') {
          if (node !== createdMetaElement) {
            needsEnforce = true
          }
        }
      }
    } else if (mutation.type === 'attributes') {
      if (
        mutation.target instanceof HTMLMetaElement &&
        mutation.target.name === 'theme-color'
      ) {
        const newValue = mutation.target.getAttribute('content')
        if (newValue !== targetColor) {
          initialThemeColor = newValue
          didCheckInitialColor = true
          needsEnforce = true
        }
      }
    }
  }

  if (needsEnforce) {
    stopObserving()
    applyThemeColor()
    startObserving()
  }
}

const startObserving = () => {
  if (headObserver) return

  headObserver = new MutationObserver(handleMutations)
  const target = document.head || document.documentElement
  headObserver.observe(target, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['content', 'name'],
  })
}

const stopObserving = () => {
  if (headObserver) {
    headObserver.disconnect()
    headObserver = null
  }
}

// Load configuration for the current hostname from storage and initialize
const init = () => {
  const hostname = window.location.hostname
  if (
    typeof chrome !== 'undefined' &&
    chrome.storage &&
    chrome.storage.local
  ) {
    chrome.storage.local.get(['global_settings', hostname], (res) => {
      // 1. Get global settings
      const globalSaved = res['global_settings']
      globalEnabled =
        globalSaved && globalSaved.enabled !== undefined
          ? globalSaved.enabled
          : true

      // 2. Get hostname settings
      const saved = res[hostname]
      if (saved) {
        darkEnabled =
          saved.darkEnabled !== undefined ? saved.darkEnabled : false
        darkColor =
          saved.darkColor !== undefined ? saved.darkColor : '#000000'
        lightEnabled =
          saved.lightEnabled !== undefined ? saved.lightEnabled : false
        lightColor =
          saved.lightColor !== undefined ? saved.lightColor : '#ffffff'
      } else {
        // Default to disabled overrides if domain is unconfigured
        darkEnabled = false
        lightEnabled = false
      }

      captureInitialThemeColor()
      applyThemeColor()
      startObserving()
    })
  } else {
    captureInitialThemeColor()
    applyThemeColor()
    startObserving()
  }
}

// Listen to messages from popup settings panel
if (
  typeof chrome !== 'undefined' &&
  chrome.runtime &&
  chrome.runtime.onMessage
) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'GLOBAL_SETTINGS_UPDATED') {
      globalEnabled = message.enabled

      stopObserving()
      applyThemeColor()
      startObserving()
    } else if (
      message.type === 'SETTINGS_UPDATED' &&
      message.hostname === window.location.hostname
    ) {
      darkEnabled = message.settings.darkEnabled
      darkColor = message.settings.darkColor
      lightEnabled = message.settings.lightEnabled
      lightColor = message.settings.lightColor

      stopObserving()
      applyThemeColor()
      startObserving()
    }
  })
}

// Listen to OS color scheme changes
prefersDarkModeMedia.addEventListener('change', () => {
  stopObserving()
  applyThemeColor()
  startObserving()
})

// Run as early as possible
if (document.head) {
  init()
} else {
  const documentObserver = new MutationObserver(() => {
    if (document.head) {
      documentObserver.disconnect()
      init()
    }
  })
  documentObserver.observe(document.documentElement, { childList: true })
}
