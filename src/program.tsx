import React from 'react'
import { ProgramWithNav } from 'react-tea-cup'
import { type Dispatcher, Sub } from 'tea-cup-fp'

import { App } from './app'
import { type Model, type Msg } from './type'
import { init, update } from './update'

const preLoadingView = () => {
  return (
    <div className='flex h-[180px] w-[320px] items-center justify-center select-none bg-[#0b0f19]'>
      <div
        className='h-8 w-8 animate-spin border-4 border-t-blue-500 border-gray-800'
        style={{ borderRadius: '50%' }}
      ></div>
    </div>
  )
}

const preView = (dispatch: Dispatcher<Msg>, model: Model | null) => {
  return model ? <App model={model} dispatch={dispatch} /> : preLoadingView()
}

export const AppProgram = () => {
  return (
    <ProgramWithNav<Model | null, Msg>
      onUrlChange={() => ({ type: 'NoOp' })}
      init={init}
      update={update}
      view={preView}
      subscriptions={() => Sub.none()}
    />
  )
}
