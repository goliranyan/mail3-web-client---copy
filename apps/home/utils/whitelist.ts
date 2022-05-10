import {
  BETA_TESTING_DATE_RANGE,
  WHITE_LIST_APPLY_DATE_RANGE,
} from '../constants/env'

export function getDateRangeFormat(range: [Date, Date]) {
  const format = (date: Date): string =>
    `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
  return `${format(range[0])}~${format(range[1])}`
}

export function isWhiteListStage() {
  const now = new Date()
  return (
    now.getTime() >= WHITE_LIST_APPLY_DATE_RANGE[0].getTime() &&
    now.getTime() <= WHITE_LIST_APPLY_DATE_RANGE[1].getTime()
  )
}

export function isBetaTestingStage() {
  const now = new Date()
  return (
    now.getTime() >= BETA_TESTING_DATE_RANGE[0].getTime() &&
    now.getTime() <= BETA_TESTING_DATE_RANGE[1].getTime()
  )
}
