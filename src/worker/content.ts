let enabled = true
let darkColor = '#000000'

// Keep track of the original theme color that was specified in the HTML or dynamically set in light/disabled mode
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
  const shouldEnforce = enabled && isDarkMode

  if (shouldEnforce) {
    // Capturing original developer-set color if not done already
    captureInitialThemeColor()

    // Enforce dark color
    let meta = getThemeColorMeta()
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = darkColor
      document.head.appendChild(meta)
      createdMetaElement = meta
    } else {
      if (meta.getAttribute('content') !== darkColor) {
        meta.setAttribute('content', darkColor)
      }
    }
  } else {
    // Light mode or extension disabled: Restore original or do nothing
    let meta = getThemeColorMeta()
    if (meta) {
      if (createdMetaElement === meta) {
        // If we created it, remove it to leave the page in its original state
        meta.remove()
        createdMetaElement = null
      } else if (
        initialThemeColor !== null &&
        meta.getAttribute('content') !== initialThemeColor
      ) {
        // Restore the developer's original color if it was modified
        meta.setAttribute('content', initialThemeColor)
      }
    }
    // Reset checking if no tag is present, so we can recheck if the site inserts one later
    if (!meta) {
      didCheckInitialColor = false
      initialThemeColor = null
    }
  }
}

// Handler for mutations in head or theme-color element
const handleMutations = (mutations: MutationRecord[]) => {
  const isDarkMode = prefersDarkModeMedia.matches
  const shouldEnforce = enabled && isDarkMode

  if (!shouldEnforce) {
    // If not enforcing, track developer's dynamic modifications
    const meta = getThemeColorMeta()
    if (meta && meta !== createdMetaElement) {
      initialThemeColor = meta.getAttribute('content')
      didCheckInitialColor = true
    }
    return
  }

  // Enforcing: override everything to darkColor
  let needsEnforce = false

  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node instanceof HTMLMetaElement && node.name === 'theme-color') {
          if (node.getAttribute('content') !== darkColor) {
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
        if (newValue !== darkColor) {
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

// Load configurations from storage and initialize
const init = () => {
  if (
    typeof chrome !== 'undefined' &&
    chrome.storage &&
    chrome.storage.local
  ) {
    chrome.storage.local.get(['enabled', 'darkColor'], (res) => {
      if (res.enabled !== undefined) enabled = res.enabled
      if (res.darkColor !== undefined) darkColor = res.darkColor

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
    if (message.type === 'SETTINGS_UPDATED') {
      enabled = message.settings.enabled
      darkColor = message.settings.darkColor

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
