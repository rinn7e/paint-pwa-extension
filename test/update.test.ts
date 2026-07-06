import { describe, expect, test } from 'vitest'

import {
  handleInitSettings,
  handleSetDarkColor,
  handleSetFontSize,
  handleSetLightColor,
  handleToggleDarkEnabled,
  handleToggleGlobalEnabled,
  handleToggleLightEnabled,
  update,
} from '../src/update'
import { type Model, type Msg } from '../src/type'

describe('Settings Logic Update Functions', () => {
  const initialModel: Model = {
    globalEnabled: true,
    fontSize: 16,
    hostname: 'web.telegram.org',
    isSystemPage: false,
    darkEnabled: true,
    darkColor: '#000000',
    lightEnabled: false,
    lightColor: '#ffffff',
  }

  const systemModel: Model = {
    globalEnabled: true,
    fontSize: 16,
    hostname: 'system-page',
    isSystemPage: true,
    darkEnabled: false,
    darkColor: '#000000',
    lightEnabled: false,
    lightColor: '#ffffff',
  }

  test('handleInitSettings should return model reflecting Msg parameters', () => {
    const msg: Msg = {
      type: 'InitSettings',
      globalEnabled: false,
      fontSize: 18,
      hostname: 'instagram.com',
      isSystemPage: false,
      darkEnabled: false,
      darkColor: '#121212',
      lightEnabled: true,
      lightColor: '#f3f4f6',
    }
    const result = handleInitSettings(msg)
    expect(result.globalEnabled).toBe(false)
    expect(result.fontSize).toBe(18)
    expect(result.hostname).toBe('instagram.com')
    expect(result.isSystemPage).toBe(false)
    expect(result.darkEnabled).toBe(false)
    expect(result.darkColor).toBe('#121212')
    expect(result.lightEnabled).toBe(true)
    expect(result.lightColor).toBe('#f3f4f6')
  })

  test('handleToggleGlobalEnabled should toggle global toggle', () => {
    const [nextModel] = handleToggleGlobalEnabled(initialModel)
    expect(nextModel.globalEnabled).toBe(false)

    const [nextModel2] = handleToggleGlobalEnabled(nextModel)
    expect(nextModel2.globalEnabled).toBe(true)
  })

  test('handleSetFontSize should clamp and update font size', () => {
    const [nextModel] = handleSetFontSize(initialModel, 20)
    expect(nextModel.fontSize).toBe(20)

    const [minClampedModel] = handleSetFontSize(initialModel, 5)
    expect(minClampedModel.fontSize).toBe(12)

    const [maxClampedModel] = handleSetFontSize(initialModel, 40)
    expect(maxClampedModel.fontSize).toBe(32)
  })

  test('handleToggleDarkEnabled should toggle domain dark toggle if not system page', () => {
    const [nextModel] = handleToggleDarkEnabled(initialModel)
    expect(nextModel.darkEnabled).toBe(false)

    const [sysResultModel] = handleToggleDarkEnabled(systemModel)
    expect(sysResultModel.darkEnabled).toBe(false) // unchanged
  })

  test('handleSetDarkColor should update custom dark color if not system page', () => {
    const [nextModel] = handleSetDarkColor(initialModel, '#181818')
    expect(nextModel.darkColor).toBe('#181818')

    const [sysResultModel] = handleSetDarkColor(systemModel, '#181818')
    expect(sysResultModel.darkColor).toBe('#000000') // unchanged
  })

  test('handleToggleLightEnabled should toggle domain light toggle if not system page', () => {
    const [nextModel] = handleToggleLightEnabled(initialModel)
    expect(nextModel.lightEnabled).toBe(true)

    const [sysResultModel] = handleToggleLightEnabled(systemModel)
    expect(sysResultModel.lightEnabled).toBe(false) // unchanged
  })

  test('handleSetLightColor should update custom light color if not system page', () => {
    const [nextModel] = handleSetLightColor(initialModel, '#f3f4f6')
    expect(nextModel.lightColor).toBe('#f3f4f6')

    const [sysResultModel] = handleSetLightColor(systemModel, '#f3f4f6')
    expect(sysResultModel.lightColor).toBe('#ffffff') // unchanged
  })

  test('update reducer delegates actions to individual handlers correctly', () => {
    const [nextModel] = update({ type: 'ToggleGlobalEnabled' }, initialModel)
    expect(nextModel?.globalEnabled).toBe(false)

    const [nextModel2] = update({ type: 'ToggleDarkEnabled' }, initialModel)
    expect(nextModel2?.darkEnabled).toBe(false)

    const [nextModel3] = update(
      { type: 'SetDarkColor', color: '#121212' },
      initialModel,
    )
    expect(nextModel3?.darkColor).toBe('#121212')

    const [nextModel4] = update({ type: 'ToggleLightEnabled' }, initialModel)
    expect(nextModel4?.lightEnabled).toBe(true)

    const [nextModel5] = update(
      { type: 'SetLightColor', color: '#e5e7eb' },
      initialModel,
    )
    expect(nextModel5?.lightColor).toBe('#e5e7eb')

    const [nextModel6] = update({ type: 'SetFontSize', fontSize: 24 }, initialModel)
    expect(nextModel6?.fontSize).toBe(24)

    const [nextModel7] = update({ type: 'SetFontSizeDone' }, initialModel)
    expect(nextModel7?.fontSize).toBe(16) // unchanged
  })
})
