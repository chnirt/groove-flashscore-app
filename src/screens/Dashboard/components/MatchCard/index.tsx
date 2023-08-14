import moment from 'moment'
import useFlashScore from '../../../../context/FlashScore/useFlashScore'
import { LiveMatchCardProps } from '../LiveMatchCard'

const MatchCard = ({ match, onClick }: LiveMatchCardProps) => {
  const { teams } = useFlashScore()
  if (teams?.length === 0) return null
  const homeTeam = teams?.find((team) => team.id === match.homeTeamId)
  const homeName = homeTeam.name
  const homeTeamLogo = homeTeam.logo[0].url
  const awayTeam = teams?.find((team) => team.id === match.awayTeamId)
  const awayTeamName = awayTeam.name
  const awayTeamLogo = awayTeam.logo[0].url
  const time = moment(match.playDate.toDate()).format('HH:mm')
  const date = moment(match.playDate.toDate())
    .format('DD MMM')
    .toUpperCase()
  return (
    <button
      className="flex min-h-[4rem] items-center justify-between gap-4 rounded-3xl bg-white px-6 py-4"
      onClick={onClick}
    >
      <div className="flex flex-1 items-center justify-end gap-2">
        <p className="m-0 text-base font-semibold text-black2">{homeName}</p>
        {homeTeamLogo ? (
          <img
            className="h-8 w-8 object-contain"
            src={homeTeamLogo}
            alt={`logo-${homeTeamLogo}`}
          />
        ) : null}
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <p className="m-0 text-base font-extrabold text-secondary">{time}</p>
        <p className="m-0 flex items-center justify-center rounded-lg text-xs font-semibold text-quaternary">
          {date}
        </p>
      </div>
      <div className="flex flex-1 items-center gap-2">
        {awayTeamLogo ? (
          <img
            className="h-8 w-8 object-contain"
            src={awayTeamLogo}
            alt={`logo-${awayTeamLogo}`}
          />
        ) : null}
        <p className="m-0 text-left text-base font-semibold text-black2">
          {awayTeamName}
        </p>
      </div>
    </button>
  )
}

export default MatchCard
