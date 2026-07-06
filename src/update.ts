import { Cmd, Task } from 'tea-cup-fp'

import {
  type Settings,
  defaultSettings,
  loadSettingsPromise,
  queryActiveTabPromise,
  saveSettingsPromise,
} from './storage/storage'
import { type Model, type Msg } from './type'

const queryActiveTabAndSettings = async (): Promise<{
  hostname: string
  isSystemPage: boolean
  settings: Settings
}> => {
  const { hostname } = await queryActiveTabPromise()
  const isSystemPage = hostname === 'system-page'
  const settings = await loadSettingsPromise(hostname)
  return { hostname, isSystemPage, settings }
}

export const init = (): [Model | null, Cmd<Msg>] => {
  const cmd = Task.attempt(
    Task.fromPromise(queryActiveTabAndSettings),
    (result): Msg => {
      if (result.tag === 'Ok') {
        return {
          type: 'InitSettings',
          hostname: result.value.hostname,
          isSystemPage: result.value.isSystemPage,
          darkEnabled: result.value.settings.darkEnabled,
          darkColor: result.value.settings.darkColor,
          lightEnabled: result.value.settings.lightEnabled,
          lightColor: result.value.settings.lightColor,
        }
      } else {
        return {
          type: 'InitSettings',
          hostname: 'system-page',
          isSystemPage: true,
          darkEnabled: defaultSettings.darkEnabled,
          darkColor: defaultSettings.darkColor,
          lightEnabled: defaultSettings.lightEnabled,
          lightColor: defaultSettings.lightColor,
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
        hostname: msg.hostname,
        isSystemPage: msg.isSystemPage,
        darkEnabled: msg.darkEnabled,
        darkColor: msg.darkColor,
        lightEnabled: msg.lightEnabled,
        lightColor: msg.lightColor,
      },
      Cmd.none(),
    ]
  }

  if (!model) {
    return [null, Cmd.none()]
  }

  if (model.isSystemPage) {
    return [model, Cmd.none()]
  }

  switch (msg.type) {
    case 'ToggleDarkEnabled': {
      const nextModel = { ...model, darkEnabled: !model.darkEnabled }
      const cmd = Task.attempt(
        Task.fromPromise(() =>
          saveSettingsPromise(model.hostname, nextModel),
        ),
        (): Msg => ({ type: 'NoOp' }),
      )
      return [nextModel, cmd]
    }
    case 'SetDarkColor': {
      const nextModel = { ...model, darkColor: msg.color }
      const cmd = Task.attempt(
        Task.fromPromise(() =>
          saveSettingsPromise(model.hostname, nextModel),
        ),
        (): Msg => ({ type: 'NoOp' }),
      )
      return [nextModel, cmd]
    }
    case 'ToggleLightEnabled': {
      const nextModel = { ...model, lightEnabled: !model.lightEnabled }
      const cmd = Task.attempt(
        Task.fromPromise(() =>
          saveSettingsPromise(model.hostname, nextModel),
        ),
        (): Msg => ({ type: 'NoOp' }),
      )
      return [nextModel, cmd]
    }
    case 'SetLightColor': {
      const nextModel = { ...model, lightColor: msg.color }
      const cmd = Task.attempt(
        Task.fromPromise(() =>
          saveSettingsPromise(model.hostname, nextModel),
        ),
        (): Msg => ({ type: 'NoOp' }),
      )
      return [nextModel, cmd]
    }
    case 'NoOp':
    default:
      return [model, Cmd.none()]
  }
}
