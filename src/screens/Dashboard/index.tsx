import { Avatar, Button, NavBar, PullToRefresh } from 'antd-mobile'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, generatePath, useNavigate } from 'react-router-dom'
import { routes } from '../../routes'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { twMerge } from 'tailwind-merge'

type Logo = {
  url: string
}
type Team = {
  name: string
  logo?: Logo[]
}

type TeamButtonProps = {
  className?: string
  team: Team
  selected?: boolean
  onClick?: () => void
}

export const TeamButton = ({
  className,
  team,
  selected,
  onClick,
}: TeamButtonProps) => {
  return (
    <button
      className={twMerge(
        'flex h-12 min-w-fit items-center justify-center rounded-3xl bg-white px-4 py-2 text-[#B2B2B2] transition-all',
        selected && 'bg-primary text-white',
        className
      )}
      onClick={onClick}
    >
      {team?.logo ? (
        <img
          className="mr-2 h-6 w-6 object-contain"
          src={team.logo[0]?.url}
          alt={`logo-${team.logo}`}
        />
      ) : null}
      <p className="m-0 text-base font-semibold">{team.name}</p>
    </button>
  )
}

export type MatchType = {
  id: string
  groupStage: string
  homeTeamId: string
  awayTeamId: string
}

type LiveMatchCardProps = {
  className?: string
  match: MatchType
  selected?: boolean
  onClick?: () => void
}

export const LiveMatchCard = ({
  className,
  match,
  selected,
  onClick,
}: LiveMatchCardProps) => {
  const { teams } = useFlashScore()
  if (teams?.length === 0) return null
  const groupStage = match.groupStage
  const homeTeam = teams?.find((team) => team.id === match.homeTeamId)
  const homeName = homeTeam.name
  const homeTeamLogo = homeTeam.logo[0].url
  const awayTeam = teams?.find((team) => team.id === match.awayTeamId)
  const awayTeamName = awayTeam.name
  const awayTeamLogo = awayTeam.logo[0].url
  return (
    <button
      className={twMerge(
        'p-5 justify-center rounded-4xl bg-white transition-all',
        selected && 'bg-tertiary',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p
            className={twMerge(
              'm-0 text-base font-semibold text-black1',
              selected && 'text-white'
            )}
          >
            {groupStage}
          </p>
          <p className="m-0 text-xs text-quaternary">Week 10</p>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            {homeTeamLogo ? (
              <img
                className="h-14 w-14 object-contain"
                src={homeTeamLogo}
                alt={`logo-${homeTeamLogo}`}
              />
            ) : null}
            <p
              className={twMerge(
                'm-0 line-clamp-1 text-right text-sm font-normal text-black2',
                selected && 'text-white'
              )}
            >
              {homeName}
            </p>
            <p className="m-0 text-xs text-quaternary">Home</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p
              className={twMerge(
                'm-0 text-4xl font-bold text-black2',
                selected && 'text-white'
              )}
            >
              0 : 3
            </p>
            <div
              className={twMerge(
                'bg-primary/25 rounded-2xl border-1 border-primary px-3 py-2',
                selected && 'bg-white/25'
              )}
            >
              <p
                className={twMerge(
                  'm-0 flex items-center justify-center text-xs text-primary',
                  selected && 'text-white '
                )}
              >
                83'
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            {awayTeamLogo ? (
              <img
                className="h-14 w-14 object-contain"
                src={awayTeamLogo}
                alt={`logo-${homeTeamLogo}`}
              />
            ) : null}
            <p
              className={twMerge(
                'm-0 line-clamp-1 text-left text-sm font-normal text-black2',
                selected && 'text-white'
              )}
            >
              {awayTeamName}
            </p>
            <p className="m-0 text-xs text-quaternary">Away</p>
          </div>
        </div>
      </div>
    </button>
  )
}

const MatchCard = ({ match, onClick }: LiveMatchCardProps) => {
  const { teams } = useFlashScore()
  if (teams?.length === 0) return null
  const homeTeam = teams?.find((team) => team.id === match.homeTeamId)
  const homeName = homeTeam.name
  const homeTeamLogo = homeTeam.logo[0].url
  const awayTeam = teams?.find((team) => team.id === match.awayTeamId)
  const awayTeamName = awayTeam.name
  const awayTeamLogo = awayTeam.logo[0].url
  return (
    <button
      className="flex min-h-[4rem] items-center justify-between gap-4 rounded-3xl bg-white px-6 py-4"
      onClick={onClick}
    >
      <div className="flex flex-1 items-center justify-end gap-2">
        <p className="m-0 line-clamp-1 text-right text-base font-semibold text-black2">
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
        <p className="m-0 text-base font-extrabold text-secondary">06:30</p>
        <p className="m-0 flex items-center justify-center rounded-lg text-xs font-semibold text-quaternary">
          30 OCT
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
        <p className="m-0 line-clamp-1 text-left text-base font-semibold text-black2">
          {awayTeamName}
        </p>
      </div>
    </button>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { teams, fetchTeam, refetchTeam, matches, fetchMatch, refetchMatch } =
    useFlashScore()
  const myLiveMatches = useMemo(() => matches, [matches])
  const myMatches = useMemo(() => matches, [matches])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const navigateMatch = useCallback(
    (match: MatchType) => {
      navigate(generatePath(routes.match, { matchId: match.id }))
    },
    [navigate]
  )

  const onRefresh = useCallback(async () => {
    if (refetchTeam === undefined) return
    refetchTeam()
    if (refetchMatch === undefined) return
    refetchMatch()
    setSelectedIndex(0)
  }, [refetchTeam, refetchMatch])

  useEffect(() => {
    const handleFetchTeam = async () => {
      try {
        if (typeof fetchTeam !== 'function') return
        await fetchTeam()
        if (typeof fetchMatch !== 'function') return
        await fetchMatch()
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchTeam()
  }, [fetchTeam, fetchMatch, navigate])

  return (
    <div className="flex flex-col">
      <NavBar
        className="sticky top-0 bg-bgPrimary"
        style={{
          '--height': '76px',
        }}
        back={
          <Avatar
            className="rounded-full border-2 border-white"
            src="https://images.augustman.com/wp-content/uploads/sites/6/2023/06/29134648/iron-man-f.jpg"
            style={{
              '--size': '38px',
            }}
          />
        }
        backArrow={false}
        right={
          <Button
            className="text-secondary"
            fill="none"
            onClick={() => navigate(routes.newTeam)}
          >
            New team
          </Button>
        }
      >
        Groove FlashScore
      </NavBar>

      <PullToRefresh onRefresh={onRefresh}>
        <div className="my-4 flex flex-col gap-8">
          <div className="no-scrollbar flex gap-5 overflow-x-scroll px-4">
            {teams?.length ? (
              [{ name: 'All' }, ...teams].map((team, ti: number) => (
                <TeamButton
                  key={`team-${ti}`}
                  team={team}
                  selected={selectedIndex === ti}
                  onClick={() => setSelectedIndex(ti)}
                />
              ))
            ) : (
              <div>Loading</div>
            )}
          </div>

          <div className="flex flex-col gap-7">
            <div className="px-4">
              <p className="m-0 text-lg font-bold text-gray1">Live Matches</p>
            </div>
            <div className="no-scrollbar flex overflow-scroll px-4">
              <div className="flex gap-4">
                {myLiveMatches?.length ? (
                  myLiveMatches.map((liveMatch, lmi) => (
                    <LiveMatchCard
                      key={`live-match-${lmi}`}
                      className="min-h-[13rem] w-72"
                      match={liveMatch}
                      selected={lmi === 0}
                      onClick={() => navigateMatch(liveMatch)}
                    />
                  ))
                ) : (
                  <div>Loading</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="m-0 text-lg font-bold text-gray1">Matches</h2>
              <Link to={routes.newMatch}>
                <Button
                  className="text-sm font-semibold text-secondary"
                  fill="none"
                >
                  New match
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4 px-4">
              {myMatches?.length ? (
                myMatches.map((match, mi: number) => (
                  <MatchCard
                    key={`match-${mi}`}
                    match={match}
                    onClick={() => navigateMatch(match)}
                  />
                ))
              ) : (
                <div>Loading</div>
              )}
            </div>
          </div>
        </div>
      </PullToRefresh>
    </div>
  )
}

export default Dashboard
