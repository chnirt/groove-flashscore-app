import { Avatar, Button, NavBar, PullToRefresh } from 'antd-mobile'
import { useCallback, useEffect, useMemo } from 'react'
import { Link, generatePath, useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { routes } from '../../routes'
import useFlashScore from '../../context/FlashScore/useFlashScore'

type TeamButtonProps = {
  className?: string
  title: string
}

export const TeamButton = ({ className, title }: TeamButtonProps) => {
  return (
    <button
      className={classNames(
        'flex min-w-[100px] items-center justify-center rounded-2xl px-5 py-4',
        className
      )}
    >
      {title}
    </button>
  )
}

export type MatchType = {
  id: string
  homeTeamId: string
  awayTeamId: string
}

type LiveMatchCardProps = {
  className?: string
  match: MatchType
  onClick?: () => void
}

export const LiveMatchCard = ({
  className,
  match,
  onClick,
}: LiveMatchCardProps) => {
  const { teams } = useFlashScore()
  if (teams?.length === 0) return null
  const homeTeam = teams?.find((team) => team.id === match.homeTeamId)
  const homeName = homeTeam.name
  const homeTeamLogo = Array.isArray(homeTeam.logo)
    ? homeTeam.logo[0].url
    : homeTeam.logo
  const awayTeam = teams?.find((team) => team.id === match.awayTeamId)
  const awayTeamName = awayTeam.name
  const awayTeamLogo = Array.isArray(awayTeam.logo)
    ? awayTeam.logo[0].url
    : awayTeam.logo
  return (
    <button
      className={classNames(
        'justify-center rounded-3xl bg-pink-500 px-5 py-6',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="m-0">Title</h1>
          <h2 className="m-0">Week 10</h2>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col items-center justify-center gap-2">
            <Avatar src={homeTeamLogo} />
            <h4 className="m-0">{homeName}</h4>
            <h6 className="m-0">Home</h6>
          </div>
          <div className="flex flex-col items-center justify-center gap-3">
            <h1 className="m-0">0 : 0</h1>
            <h4 className="m-0 flex items-center justify-center rounded-lg border-2 border-black">
              83'
            </h4>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <Avatar src={awayTeamLogo} />
            <h4 className="m-0">{awayTeamName}</h4>
            <h6 className="m-0">Away</h6>
          </div>
        </div>
      </div>
    </button>
  )
}

const MatchCard = ({ match, onClick }: any) => {
  const { teams } = useFlashScore()
  if (teams?.length === 0) return null
  const homeTeam = teams?.find((team) => team.id === match.homeTeamId)
  const homeName = homeTeam.name
  const homeTeamLogo = Array.isArray(homeTeam.logo)
    ? homeTeam.logo[0].url
    : homeTeam.logo
  const awayTeam = teams?.find((team) => team.id === match.awayTeamId)
  const awayTeamName = awayTeam.name
  const awayTeamLogo = Array.isArray(awayTeam.logo)
    ? awayTeam.logo[0].url
    : awayTeam.logo
  return (
    <button
      className="flex justify-between gap-4 rounded-3xl bg-white px-5 py-7"
      onClick={onClick}
    >
      <div className="flex items-center justify-center gap-2">
        <h4 className="m-0">{homeName}</h4>
        <Avatar src={homeTeamLogo} />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="m-0">0 : 0</h2>
        <h4 className="m-0 flex items-center justify-center rounded-lg border-2 border-black">
          83'
        </h4>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Avatar src={awayTeamLogo} />
        <h4 className="m-0">{awayTeamName}</h4>
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
  }, [refetchTeam, refetchMatch])

  useEffect(() => {
    if (typeof fetchTeam !== 'function') return
    if (typeof fetchMatch !== 'function') return
    const handleFetchTeam = async () => {
      try {
        await fetchTeam()
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
        className="sticky top-0 bg-[#F7F7F7]"
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
            className="text-[#FF793F]"
            fill="none"
            onClick={() => navigate(routes.newTeam)}
          >
            New team
          </Button>
        }
      />

      <PullToRefresh onRefresh={onRefresh}>
        <div className="flex flex-col gap-8 p-4">
          <div className="no-scrollbar flex overflow-x-scroll">
            <div className="flex gap-5">
              {teams?.length ? (
                teams.map((team, ti) => (
                  <TeamButton key={`team-${ti}`} title={team.name} />
                ))
              ) : (
                <div>Loading</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-7">
            <div>
              <h2 className="m-0 text-[#575757]">Live Match</h2>
            </div>
            <div className="no-scrollbar flex overflow-scroll">
              <div className="flex gap-4">
                {myLiveMatches?.length ? (
                  myLiveMatches.map((liveMatch, lmi) => (
                    <LiveMatchCard
                      key={`live-match-${lmi}`}
                      className="h-56 w-72"
                      match={liveMatch}
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
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[#575757]">Matches</h2>
              <Link to={routes.newMatch}>
                <Button className="text-[#FF793F]" fill="none">
                  New match
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
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
