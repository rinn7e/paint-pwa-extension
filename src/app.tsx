import React from 'react'
import { type Dispatcher } from 'tea-cup-fp'

import { type Model, type Msg } from './type'

export interface AppProps {
  model: Model
  dispatch: Dispatcher<Msg>
}

export const App = ({ model, dispatch }: AppProps) => {
  const lightPresets = [
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Slate Light', hex: '#f3f4f6' },
    { name: 'Gray Light', hex: '#e5e7eb' },
  ]

  const darkPresets = [
    { name: 'Pitch Black', hex: '#000000' },
    { name: 'Telegram Dark', hex: '#181818' },
    { name: 'Material Dark', hex: '#121212' },
  ]

  // Truncate domain helper to display long hostnames beautifully
  const displayHost = model.isSystemPage
    ? 'System Page'
    : model.hostname

  return (
    <div className='flex h-full flex-col justify-between p-4 select-none bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f9fafb] transition-colors duration-200'>
      {/* Header */}
      <div className='flex items-center justify-between pb-1.5 border-b border-gray-200 dark:border-gray-800/40'>
        <h1 className='text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400'>
          PWA Title Force
        </h1>
        <span
          title={model.hostname}
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded truncate max-w-[140px] ${
            model.isSystemPage
              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700/60'
          }`}
        >
          {displayHost}
        </span>
      </div>

      {model.isSystemPage ? (
        // Read-only system page state
        <div className='flex flex-col items-center justify-center flex-1 py-4 text-center gap-1.5'>
          <svg
            className='w-8 h-8 text-gray-400 dark:text-gray-600'
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
          <span className='text-[10px] text-gray-500 dark:text-gray-400 px-3 leading-relaxed'>
            Please navigate to a valid web page (e.g. web.telegram.org) to
            configure title bar theme overrides.
          </span>
        </div>
      ) : (
        // Standard interactive domain config
        <div className='flex flex-col gap-3.5 py-2.5'>
          {/* LIGHT THEME OVERWRITE */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-gray-750 dark:text-gray-300'>
                Overwrite Light Theme
              </span>
              <button
                onClick={() => dispatch({ type: 'ToggleLightEnabled' })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  model.lightEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    model.lightEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div
              className={`space-y-1.5 transition-opacity duration-200 ${
                model.lightEnabled
                  ? 'opacity-100'
                  : 'opacity-30 pointer-events-none'
              }`}
            >
              <div className='flex items-center justify-between'>
                <span className='text-[10px] text-gray-500 dark:text-gray-450'>
                  Light Color
                </span>
                <div className='flex items-center gap-1.5'>
                  <span className='text-[10px] font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'>
                    {model.lightColor.toUpperCase()}
                  </span>
                  <div className='relative w-5 h-5 rounded border border-gray-300 dark:border-gray-700 overflow-hidden cursor-pointer'>
                    <input
                      type='color'
                      value={model.lightColor}
                      onChange={(e) =>
                        dispatch({
                          type: 'SetLightColor',
                          color: e.target.value,
                        })
                      }
                      className='absolute inset-0 w-full h-full cursor-pointer scale-150'
                    />
                  </div>
                </div>
              </div>

              <div className='flex gap-1.5'>
                {lightPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() =>
                      dispatch({ type: 'SetLightColor', color: preset.hex })
                    }
                    className={`flex-1 text-[9px] py-0.5 px-1 rounded border transition-all cursor-pointer ${
                      model.lightColor.toLowerCase() ===
                      preset.hex.toLowerCase()
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-300 font-medium'
                        : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DARK THEME OVERWRITE */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold text-gray-750 dark:text-gray-300'>
                Overwrite Dark Theme
              </span>
              <button
                onClick={() => dispatch({ type: 'ToggleDarkEnabled' })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  model.darkEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    model.darkEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div
              className={`space-y-1.5 transition-opacity duration-200 ${
                model.darkEnabled
                  ? 'opacity-100'
                  : 'opacity-30 pointer-events-none'
              }`}
            >
              <div className='flex items-center justify-between'>
                <span className='text-[10px] text-gray-500 dark:text-gray-450'>
                  Dark Color
                </span>
                <div className='flex items-center gap-1.5'>
                  <span className='text-[10px] font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'>
                    {model.darkColor.toUpperCase()}
                  </span>
                  <div className='relative w-5 h-5 rounded border border-gray-300 dark:border-gray-700 overflow-hidden cursor-pointer'>
                    <input
                      type='color'
                      value={model.darkColor}
                      onChange={(e) =>
                        dispatch({
                          type: 'SetDarkColor',
                          color: e.target.value,
                        })
                      }
                      className='absolute inset-0 w-full h-full cursor-pointer scale-150'
                    />
                  </div>
                </div>
              </div>

              <div className='flex gap-1.5'>
                {darkPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() =>
                      dispatch({ type: 'SetDarkColor', color: preset.hex })
                    }
                    className={`flex-1 text-[9px] py-0.5 px-1 rounded border transition-all cursor-pointer ${
                      model.darkColor.toLowerCase() ===
                      preset.hex.toLowerCase()
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-300 font-medium'
                        : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className='flex justify-between items-center text-[9px] text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800/60 pt-1.5'>
        <span>Version 1.0.0</span>
        <span>Made with devotion</span>
      </div>
    </div>
  )
}
