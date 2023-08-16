export const env = import.meta.env
export const eventNames = {
  SCREEN_VIEW: 'screen_view',
  LOGIN: 'login',
  REGISTER: 'register',
}

export const IS_DEVELOP = true && import.meta.env.DEV
export const ORIGIN = window.location.origin
export const MATCH_TIMING = 60
export const STATS = [
  {
    id: 'GOAL',
    name: 'Goal',
  },
  {
    id: 'YELLOW_CARD',
    name: 'Yellow Card',
  },
  {
    id: 'RED_CARD',
    name: 'Red Card',
  },
]
