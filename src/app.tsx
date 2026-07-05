import React from 'react'
import { type Dispatcher } from 'tea-cup-fp'

import { type Model, type Msg } from './type'

export interface AppProps {
  model: Model
  dispatch: Dispatcher<Msg>
}

export const App = ({ model, dispatch }: AppProps) => {
  const presets = [
    { name: 'Pitch Black', hex: '#000000' },
    { name: 'Telegram Dark', hex: '#181818' },
    { name: 'Material Dark', hex: '#121212' },
  ]

  return (
    <div className='flex h-full flex-col justify-between p-4 select-none'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-xs font-semibold tracking-wider uppercase text-blue-400'>
          PWA Dark Title Force
        </h1>

        {/* Toggle Switch */}
        <button
          onClick={() => dispatch({ type: 'ToggleEnabled' })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            model.enabled ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              model.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Main Setting */}
      <div
        className={`mt-2 space-y-2 transition-opacity duration-200 ${
          model.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <div className='flex items-center justify-between'>
          <span className='text-xs text-gray-400'>Forced Dark Color</span>
          <div className='flex items-center gap-1.5'>
            <span className='text-xs font-mono bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 border border-gray-700'>
              {model.darkColor.toUpperCase()}
            </span>
            <div className='relative w-6 h-6 rounded border border-gray-700 overflow-hidden cursor-pointer'>
              <input
                type='color'
                value={model.darkColor}
                onChange={(e) =>
                  dispatch({ type: 'SetColor', color: e.target.value })
                }
                className='absolute inset-0 w-full h-full cursor-pointer scale-150'
              />
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className='flex gap-2'>
          {presets.map((preset) => (
            <button
              key={preset.hex}
              onClick={() => dispatch({ type: 'SetColor', color: preset.hex })}
              className={`flex-1 text-[10px] py-1 px-1.5 rounded border transition-all cursor-pointer ${
                model.darkColor.toLowerCase() === preset.hex.toLowerCase()
                  ? 'bg-blue-950/40 border-blue-500 text-blue-300 font-medium'
                  : 'bg-gray-900 border-gray-850 text-gray-400 hover:border-gray-700'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className='flex justify-between items-center text-[9px] text-gray-500 mt-2 border-t border-gray-800/60 pt-2'>
        <span>Version 1.0.0</span>
        <span className='flex items-center gap-0.5'>Made with devotion</span>
      </div>
    </div>
  )
}
