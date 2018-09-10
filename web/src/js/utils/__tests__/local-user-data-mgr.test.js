/* eslint-env jest */

import moment from 'moment'
import MockDate from 'mockdate'
import localStorageMgr, {
  __mockClear
} from '../localstorage-mgr'

jest.mock('../localstorage-mgr')

const mockNow = '2018-04-12T10:30:00.000'

beforeAll(() => {
  MockDate.set(moment(mockNow))
})

afterEach(() => {
  __mockClear()
  jest.clearAllMocks()
})

afterAll(() => {
  MockDate.reset()
})

describe('local user data manager', () => {
  // getTabsOpenedToday method
  it('returns tabs today when the user has opened tabs today', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.date', moment('2018-04-12T12:50:42.000').utc().toISOString())
    localStorageMgr.setItem('tab.user.lastTabDay.count', 14)
    const getTabsOpenedToday = require('../local-user-data-mgr').getTabsOpenedToday
    expect(getTabsOpenedToday()).toBe(14)
  })

  it('returns zero tabs today when the user last opened tabs more than one day ago', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.date', moment('2018-04-11T08:05:10.000').utc().toISOString())
    localStorageMgr.setItem('tab.user.lastTabDay.count', 14)
    const getTabsOpenedToday = require('../local-user-data-mgr').getTabsOpenedToday
    expect(getTabsOpenedToday()).toBe(0)
  })

  it('returns zero tabs today when the last tab day values are not set in localStorage', () => {
    const getTabsOpenedToday = require('../local-user-data-mgr').getTabsOpenedToday
    expect(getTabsOpenedToday()).toBe(0)
  })

  it('returns zero tabs today when the last tab date value is not set in localStorage', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.count', 6)
    const getTabsOpenedToday = require('../local-user-data-mgr').getTabsOpenedToday
    expect(getTabsOpenedToday()).toBe(0)
  })

  it('returns zero tabs today when the last tab day count is not set in localStorage', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.date', moment('2018-04-12T12:50:42.000').utc().toISOString())
    const getTabsOpenedToday = require('../local-user-data-mgr').getTabsOpenedToday
    expect(getTabsOpenedToday()).toBe(0)
  })

  // incrementTabsOpenedToday method
  it('increments the tabs today when the user has opened tabs today', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.date', moment('2018-04-12T12:50:42.000').utc().toISOString())
    localStorageMgr.setItem('tab.user.lastTabDay.count', 14)
    jest.clearAllMocks()
    const incrementTabsOpenedToday = require('../local-user-data-mgr').incrementTabsOpenedToday
    incrementTabsOpenedToday()
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.count', 15)
    expect(localStorageMgr.setItem).not.toHaveBeenCalledWith('tab.user.lastTabDay.date', moment.utc().toISOString())
  })

  it('resets the counter of tabs today when the user last opened tabs more than one day ago', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.date', moment('2018-04-11T08:05:10.000').utc().toISOString())
    localStorageMgr.setItem('tab.user.lastTabDay.count', 14)
    jest.clearAllMocks()
    const incrementTabsOpenedToday = require('../local-user-data-mgr').incrementTabsOpenedToday
    incrementTabsOpenedToday()
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.count', 1)
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.date', moment.utc().toISOString())
  })

  it('resets the counter of tabs today when the last tab day values are not set in localStorage', () => {
    const incrementTabsOpenedToday = require('../local-user-data-mgr').incrementTabsOpenedToday
    incrementTabsOpenedToday()
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.count', 1)
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.date', moment.utc().toISOString())
  })

  it('resets the counter of tabs today when the last tab date value is not set in localStorage', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.count', 6)
    jest.clearAllMocks()
    const incrementTabsOpenedToday = require('../local-user-data-mgr').incrementTabsOpenedToday
    incrementTabsOpenedToday()
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.count', 1)
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.date', moment.utc().toISOString())
  })

  it('resets the counter of tabs today when the last tab day count is not set in localStorage', () => {
    localStorageMgr.setItem('tab.user.lastTabDay.date', moment('2018-04-12T12:50:42.000').utc().toISOString())
    jest.clearAllMocks()
    const incrementTabsOpenedToday = require('../local-user-data-mgr').incrementTabsOpenedToday
    incrementTabsOpenedToday()
    expect(localStorageMgr.setItem).toHaveBeenCalledWith('tab.user.lastTabDay.count', 1)
    expect(localStorageMgr.setItem).not.toHaveBeenCalledWith('tab.user.lastTabDay.date', moment.utc().toISOString())
  })

  // setBrowserExtensionInstallTime method
  it('sets the extension install time timestamp in localStorage', () => {
    const setBrowserExtensionInstallTime = require('../local-user-data-mgr').setBrowserExtensionInstallTime
    setBrowserExtensionInstallTime()
    expect(localStorageMgr.setItem)
      .toHaveBeenCalledWith('tab.newUser.approxInstallTime', moment.utc().toISOString())
  })

  // getBrowserExtensionInstallTime
  it('gets the extension install date from localStorage', () => {
    const now = moment('2018-04-12T12:50:42.000')
    localStorageMgr.setItem('tab.newUser.approxInstallTime', now.utc().toISOString())
    const getBrowserExtensionInstallTime = require('../local-user-data-mgr').getBrowserExtensionInstallTime
    const installTime = getBrowserExtensionInstallTime()
    expect(installTime.isSame(now)).toBe(true)
  })

  it('returns null if the extension install date in localStorage is invalid', () => {
    // Suppress expected MomentJS warning
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {})

    localStorageMgr.setItem('tab.newUser.approxInstallTime', 'foo')
    const getBrowserExtensionInstallTime = require('../local-user-data-mgr').getBrowserExtensionInstallTime
    const installTime = getBrowserExtensionInstallTime()
    expect(installTime).toBeNull()
  })

  it('returns null if the extension install date in localStorage does not exist', () => {
    localStorageMgr.removeItem('tab.newUser.approxInstallTime')
    const getBrowserExtensionInstallTime = require('../local-user-data-mgr').getBrowserExtensionInstallTime
    const installTime = getBrowserExtensionInstallTime()
    expect(installTime).toBeNull()
  })
})
