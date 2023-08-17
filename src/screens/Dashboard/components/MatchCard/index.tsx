import moment from 'moment'
import { twMerge } from 'tailwind-merge'
import useFlashScore from '../../../../context/FlashScore/useFlashScore'
import { LiveMatchCardProps } from '../LiveMatchCard'

const MatchCard = ({
  className,
  match,
  onClick,
  completed,
}: LiveMatchCardProps) => {
  const { teams } = useFlashScore()
  if (teams?.length === 0) return null
  const homeTeam = teams?.find((team) => team.id === match.homeTeamId)
  const homeName = homeTeam.name
  const homeTeamLogo = homeTeam.logo[0]?.url
  const awayTeam = teams?.find((team) => team.id === match.awayTeamId)
  const awayTeamName = awayTeam.name
  const awayTeamLogo = awayTeam.logo[0]?.url
  const playDate = new Date(
    match.playDate.seconds * 1000 + match.playDate.nanoseconds / 1000000
  )
  const time = moment(playDate).format('HH:mm')
  const date = moment(playDate).format('DD MMM').toUpperCase()
  return (
    <button
      className={twMerge(
        'flex min-h-[4rem] items-center justify-between gap-4 rounded-3xl bg-white px-6 py-4',
        completed && 'bg-black1',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-1 items-center justify-end gap-2">
        <p
          className={twMerge(
            'm-0 text-base font-semibold text-black2',
            completed && 'text-white'
          )}
        >
          {homeName}
        </p>
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
        <p
          className={twMerge(
            'm-0 text-left text-base font-semibold text-black2',
            completed && 'text-white'
          )}
        >
          {awayTeamName}
        </p>
      </div>
    </button>
  )
}

export default MatchCard
