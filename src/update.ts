import { Cmd, Task } from 'tea-cup-fp'

import { loadSettingsPromise, saveSettingsPromise } from './storage/storage'
import { type Model, type Msg } from './type'

export const init = (): [Model | null, Cmd<Msg>] => {
  const cmd = Task.attempt(
    Task.fromPromise(loadSettingsPromise),
    (result): Msg => {
      if (result.tag === 'Ok') {
        return {
          type: 'InitSettings',
          enabled: result.value.enabled,
          darkColor: result.value.darkColor,
        }
      } else {
        return {
          type: 'InitSettings',
          enabled: true,
          darkColor: '#000000',
        }
      }
    },
  )
  return [null, cmd]
}

export const update = (
  msg: Msg,
  model: Model | null,
): [Model | null, Cmd<Msg>] => {
  if (msg.type === 'InitSettings') {
    return [
      {
        enabled: msg.enabled,
        darkColor: msg.darkColor,
      },
      Cmd.none(),
    ]
  }

  if (!model) {
    return [null, Cmd.none()]
  }

  switch (msg.type) {
    case 'ToggleEnabled': {
      const nextEnabled = !model.enabled
      const nextModel = { ...model, enabled: nextEnabled }
      const cmd = Task.attempt(
        Task.fromPromise(() => saveSettingsPromise(nextModel)),
        (): Msg => ({ type: 'NoOp' }),
      )
      return [nextModel, cmd]
    }
    case 'SetColor': {
      const nextModel = { ...model, darkColor: msg.color }
      const cmd = Task.attempt(
        Task.fromPromise(() => saveSettingsPromise(nextModel)),
        (): Msg => ({ type: 'NoOp' }),
      )
      return [nextModel, cmd]
    }
    case 'NoOp':
    default:
      return [model, Cmd.none()]
  }
}
