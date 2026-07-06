/*
 * Copyright (C) 2026 Moremi Vannak
 * SPDX-License-Identifier: GPL-3.0-only
 */

import React from 'react'
import { type Dispatcher } from 'tea-cup-fp'

import { BUILD_DATE, SHOW_BUILD_DATE } from './common/env'
import { formatDateTime } from './common/date-util'
import { type Model, type Msg } from './type'

export interface AppProps {
  model: Model
  dispatch: Dispatcher<Msg>
}

// 1. Header View function
const headerView = (
  globalEnabled: boolean,
  dispatch: Dispatcher<Msg>,
): React.ReactNode => {
  const subtitle =
    'Configure any PWA default theme color base on OS color scheme.'
  const spacer = '\u00A0'.repeat(8)
  const marqueeText = `${subtitle}${spacer}${subtitle}${spacer}`

  const buildTimeStr =
    SHOW_BUILD_DATE && BUILD_DATE
      ? `build: ${formatDateTime(new Date(BUILD_DATE))}`
      : ''

  return (
    <div className='flex flex-col pb-1.5 border-b border-gray-200 dark:border-gray-800/40'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col'>
          <h1 className='text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 whitespace-nowrap'>
            Paint PWA
          </h1>
          {buildTimeStr && (
            <span className='text-[0.625rem] text-gray-400 dark:text-gray-500 font-normal leading-none mt-0.5'>
              {buildTimeStr}
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-[0.625rem] text-gray-500 dark:text-gray-400 font-semibold'>
            {globalEnabled ? 'Global ON' : 'Global OFF'}
          </span>
          <button
            type='button'
            onClick={() => dispatch({ type: 'ToggleGlobalEnabled' })}
            className={`relative shrink-0 cursor-pointer border rounded-full transition-colors duration-200 ease-in-out focus:outline-none h-[20px] w-[36px] ${
              globalEnabled
                ? 'bg-green-600 border-transparent'
                : 'bg-gray-300 dark:bg-gray-700 border-transparent'
            }`}
          >
            <span
              className={`pointer-events-none absolute top-[1px] left-[1px] bg-white shadow-sm rounded-full transition-transform duration-200 ease-in-out h-[16px] w-[16px] ${
                globalEnabled ? 'translate-x-[16px]' : 'translate-x-[0px]'
              }`}
            />
          </button>
        </div>
      </div>
      <div className='marquee-container'>
        <div className='marquee-content text-[0.625rem] text-gray-400 dark:text-gray-500 mt-1 leading-normal whitespace-nowrap'>
          {marqueeText}
        </div>
      </div>
    </div>
  )
}

// 2. Domain Subheader View function
const domainSubheaderView = (
  hostname: string,
  isSystemPage: boolean,
): React.ReactNode => {
  const displayHost = isSystemPage ? 'System Page' : hostname
  return (
    <div className='flex justify-between items-center py-1.5 bg-gray-100/50 dark:bg-gray-900/30 px-2 rounded mt-1 border border-gray-200/50 dark:border-gray-800/40'>
      <span className='text-[0.625rem] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap'>
        Configuring Domain
      </span>
      <span
        title={hostname}
        className={`text-[0.625rem] font-mono rounded truncate max-w-[10.625rem] ${
          isSystemPage
            ? 'text-red-600 dark:text-red-400'
            : 'text-blue-600 dark:text-blue-400'
        }`}
      >
        {displayHost}
      </span>
    </div>
  )
}

// 3. System Page Fallback View function
const systemPageFallbackView = (): React.ReactNode => {
  return (
    <div className='flex flex-col items-center justify-center flex-1 py-4 text-center gap-1.5'>
      <svg
        className='w-7 h-7 text-gray-400 dark:text-gray-600'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1.5}
          d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        />
      </svg>
      <span className='text-[0.625rem] text-gray-500 dark:text-gray-400 px-3 leading-relaxed'>
        Please navigate to a valid web page (e.g. web.telegram.org) to configure
        title bar theme overrides.
      </span>
    </div>
  )
}

// 4. Theme Section View component configuration
interface ThemeSectionConfig {
  title: string
  enabled: boolean
  color: string
  presets: { name: string; hex: string }[]
  onToggle: () => Msg
  onSetColor: (color: string) => Msg
}

// Theme Section View function
const themeSectionView = (
  config: ThemeSectionConfig,
  dispatch: Dispatcher<Msg>,
): React.ReactNode => {
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between'>
        <span className='text-[0.625rem] font-semibold text-gray-750 dark:text-gray-300 whitespace-nowrap'>
          {config.title}
        </span>
        <button
          type='button'
          onClick={() => dispatch(config.onToggle())}
          className={`relative shrink-0 cursor-pointer border rounded-full transition-colors duration-200 ease-in-out focus:outline-none h-[20px] w-[36px] ${
            config.enabled
              ? 'bg-blue-600 border-transparent'
              : 'bg-gray-300 dark:bg-gray-700 border-transparent'
          }`}
        >
          <span
            className={`pointer-events-none absolute top-[1px] left-[1px] bg-white shadow-sm rounded-full transition-transform duration-200 ease-in-out h-[16px] w-[16px] ${
              config.enabled ? 'translate-x-[16px]' : 'translate-x-[0px]'
            }`}
          />
        </button>
      </div>

      <div
        className={`space-y-1.5 transition-opacity duration-200 ${
          config.enabled ? 'opacity-100' : 'opacity-30 pointer-events-none'
        }`}
      >
        <div className='flex items-center justify-between'>
          <span className='text-[0.625rem] text-gray-500 dark:text-gray-455'>
            Color
          </span>
          <div className='flex items-center gap-1.5'>
            <span className='text-[0.625rem] font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'>
              {config.color.toUpperCase()}
            </span>
            <div className='relative w-5 h-5 rounded border border-gray-300 dark:border-gray-700 overflow-hidden cursor-pointer'>
              <input
                type='color'
                value={config.color}
                onChange={(e) => dispatch(config.onSetColor(e.target.value))}
                className='absolute inset-0 w-full h-full cursor-pointer scale-150'
              />
            </div>
          </div>
        </div>

        <div className='flex gap-1.5'>
          {config.presets.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => dispatch(config.onSetColor(preset.hex))}
              className={`flex-1 flex items-center justify-center gap-1 text-[0.625rem] py-0.5 px-1 rounded border transition-all cursor-pointer ${
                config.color.toLowerCase() === preset.hex.toLowerCase()
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-300 font-medium'
                  : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <span
                className='w-3 h-3 rounded-sm border border-black/10 dark:border-white/10 shrink-0'
                style={{ backgroundColor: preset.hex }}
              />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// 5. Footer View function
const footerView = (
  fontSize: number,
  dispatch: Dispatcher<Msg>,
): React.ReactNode => {
  return (
    <div className='flex flex-col gap-2 border-t border-gray-200 dark:border-gray-800/60 pt-2 text-[0.625rem] text-gray-400 dark:text-gray-500'>
      <div className='flex justify-between items-center'>
        <span className='whitespace-nowrap'>Version 1.0.0</span>

        {/* Font Size Controller */}
        <div className='flex items-center gap-1 font-semibold select-none whitespace-nowrap'>
          <span>Font Size:</span>
          <button
            type='button'
            onClick={() =>
              dispatch({ type: 'SetFontSize', fontSize: fontSize - 1 })
            }
            disabled={fontSize <= 12}
            className='hover:text-blue-500 transition-colors px-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs'
            title='Decrease Font Size'
          >
            -
          </button>
          <span className='font-mono w-[1.875rem] text-center'>{fontSize}px</span>
          <button
            type='button'
            onClick={() =>
              dispatch({ type: 'SetFontSize', fontSize: fontSize + 1 })
            }
            disabled={fontSize >= 32}
            className='hover:text-blue-500 transition-colors px-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs'
            title='Increase Font Size'
          >
            +
          </button>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <a
          href='https://github.com/rinn7e/dark-pwa-extension'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-blue-500 transition-colors font-medium'
        >
          Source Code - Github
        </a>
        <div className='flex items-center gap-2.5'>
          <button
            type='button'
            onClick={() => dispatch({ type: 'ExportConfig' })}
            className='hover:text-blue-500 cursor-pointer font-semibold transition-colors'
          >
            Export Config
          </button>
          <div className='bg-gray-200 dark:bg-gray-800 h-2.5 w-[1px]' />
          <label
            onClick={(e) => {
              const isPopup =
                typeof chrome !== 'undefined' &&
                chrome.extension &&
                chrome.extension.getViews &&
                chrome.extension.getViews({ type: 'popup' }).includes(window)
              if (isPopup && chrome.tabs && chrome.tabs.create) {
                e.preventDefault()
                chrome.tabs.create({
                  url: chrome.runtime.getURL('index.html?mode=tab'),
                })
              }
            }}
            className='hover:text-blue-500 cursor-pointer font-semibold transition-colors'
          >
            Import Config
            <input
              type='file'
              accept='.json'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const text = event.target?.result as string
                    dispatch({ type: 'ImportConfig', jsonText: text })
                  }
                  reader.readAsText(file)
                }
                e.target.value = ''
              }}
              className='hidden'
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export const App = ({ model, dispatch }: AppProps) => {
  const lightPresets = [
    { name: 'Pure', hex: '#ffffff' },
    { name: 'Slate', hex: '#f3f4f6' },
    { name: 'Gray', hex: '#e5e7eb' },
  ]

  const darkPresets = [
    { name: 'Pitch', hex: '#000000' },
    { name: 'Midnight', hex: '#0f172a' },
    { name: 'Charcoal', hex: '#1e293b' },
  ]

  return (
    <div className='flex h-full flex-col justify-between p-4 select-none bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f9fafb] transition-colors duration-200'>
      {headerView(model.globalEnabled, dispatch)}
      {domainSubheaderView(model.hostname, model.isSystemPage)}

      {model.isSystemPage ? (
        systemPageFallbackView()
      ) : (
        <div
          className={`flex flex-col gap-3 py-2.5 transition-opacity duration-200 ${
            model.globalEnabled
              ? 'opacity-100'
              : 'opacity-30 pointer-events-none'
          }`}
        >
          {themeSectionView(
            {
              title: 'Overwrite Light Theme',
              enabled: model.lightEnabled,
              color: model.lightColor,
              presets: lightPresets,
              onToggle: () => ({ type: 'ToggleLightEnabled' }),
              onSetColor: (color: string) => ({ type: 'SetLightColor', color }),
            },
            dispatch,
          )}

          {themeSectionView(
            {
              title: 'Overwrite Dark Theme',
              enabled: model.darkEnabled,
              color: model.darkColor,
              presets: darkPresets,
              onToggle: () => ({ type: 'ToggleDarkEnabled' }),
              onSetColor: (color: string) => ({ type: 'SetDarkColor', color }),
            },
            dispatch,
          )}
        </div>
      )}

      {footerView(model.fontSize, dispatch)}
    </div>
  )
}
