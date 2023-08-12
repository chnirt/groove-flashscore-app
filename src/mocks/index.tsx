import { nanoid } from 'nanoid'
import { IS_DEVELOP } from '../constants'

export const MASTER_MOCK_DATA = {
  LOGIN: {
    email: IS_DEVELOP ? 'chnirt@gmail.com' : '',
    password: IS_DEVELOP ? 'Admin@123' : '',
  },
  REGISTER: {
    fullName: IS_DEVELOP ? 'Chnirt Chnirt' : '',
    email: IS_DEVELOP ? 'chnirt@gmail.com' : '',
    username: IS_DEVELOP ? 'chnirt' : '',
    password: IS_DEVELOP ? 'Admin@123' : '',
    confirmPassword: IS_DEVELOP ? 'Admin@123' : '',
  },
  NEW_CATEGORY: {
    categoryName: IS_DEVELOP ? 'Cocktail' : '',
  },
  NEW_DISH: {
    uploadMethod: IS_DEVELOP ? 'link' : 'file',
    dishName: IS_DEVELOP ? 'Phatty’S Nachos' : '',
    dishDescription: IS_DEVELOP
      ? 'They are crispy, cheesy, and spicy, and they go well with a cold beer or a soft drink. You can also add some toppings to your nachos, such as chicken, beef, bacon, or jalapeños, for an extra charge'
      : '',
    price: IS_DEVELOP ? 99000 : 0,
    dishFiles: [],
  },
  SETTINGS: {
    logo: [],
    wifi: IS_DEVELOP ? '12345678' : '',
    currency: IS_DEVELOP ? 'vnd' : '',
  },
  NEW_TEAM: {
    teamName: IS_DEVELOP ? 'Jupiter 1' : '',
    uploadMethod: IS_DEVELOP ? 'file' : 'link',
    teamLogo: IS_DEVELOP
      ? [
          {
            url: 'https://static.vecteezy.com/system/resources/previews/007/407/076/non_2x/football-logo-design-a-ball-vector.jpg',
          },
        ]
      : [],
  },
  NEW_MATCH: {
    homeTeamId: '',
    awayTeamId: '',
    playDate: IS_DEVELOP ? new Date() : null,
  },
}

export const TEAMS = [
  {
    id: nanoid(),
    name: 'All',
  },
  {
    id: nanoid(),
    name: 'Jupiter 1',
  },
  {
    id: nanoid(),
    name: 'Jupiter 2',
  },
  {
    id: nanoid(),
    name: 'Saturn',
  },
  {
    id: nanoid(),
    name: 'Mars & Venus',
  },
]

export type ITeams = typeof TEAMS

export const MATCHES = [
  {
    id: nanoid(),
    playStage: 'G', // stage of the match, i.e. G for group stage, R for Round of 16, Q for Quarter Final, S for Semi final and F for final
    playDate: new Date().toISOString(),
    teamHomeId: 'Jupiter 1',
    teamAwayId: 'Jupiter 2',
    winLost: 'W', // team either win or lose or drawn indicated by the character W, L, or D
    goalScore: 2,
    penaltyScore: 1,
  },
  {
    id: nanoid(),
    playStage: 'G', // stage of the match, i.e. G for group stage, R for Round of 16, Q for Quarter Final, S for Semi final and F for final
    playDate: new Date().toISOString(),
    teamHomeId: 'Jupiter 2',
    teamAwayId: 'Jupiter 1',
    winLost: 'W', // team either win or lose or drawn indicated by the character W, L, or D
    goalScore: 2,
    penaltyScore: 1,
  },
]

export type IMatches = typeof MATCHES
