import { Avatar, NavBar, PullToRefresh } from 'antd-mobile'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, generatePath, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { routes } from '../../routes'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import MatchCard from './components/MatchCard'
import LiveMatchCard, { MatchType } from './components/LiveMatchCard'
import TeamButton from './components/TeamButton'
import useAuth from '../../hooks/useAuth'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { teams, fetchTeam, refetchTeam, matches, fetchMatch, refetchMatch } =
    useFlashScore()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const formattedTeams = useMemo(
    () => (teams ? [{ name: 'All' }, ...teams] : []),
    [teams]
  )
  const filteredMatches = useMemo(() => {
    if (selectedIndex === 0) return matches
    const foundTeam = formattedTeams[selectedIndex]
    if (foundTeam === undefined) return matches
    const result = matches?.filter((match) =>
      [match.homeTeamId, match.awayTeamId].includes(foundTeam.id)
    )
    return result
  }, [matches, selectedIndex, formattedTeams])
  const myLiveMatches = useMemo(() => {
    const result = filteredMatches?.filter((match) =>
      moment(match.playDate.toDate()).isSameOrBefore(moment())
    )
    return result
  }, [filteredMatches])
  const myMatches = useMemo(() => {
    const result = filteredMatches?.filter((match) =>
      moment(match.playDate.toDate()).isAfter(moment())
    )
    return result
  }, [filteredMatches])

  const navigateMatch = useCallback(
    (match: MatchType) => {
      navigate(generatePath(routes.match, { matchId: match.id }))
    },
    [navigate]
  )

  const handleSelectTeam = useCallback((teamIndex: number) => {
    setSelectedIndex(teamIndex)
  }, [])

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
        if (typeof fetchMatch !== 'function') return
        await Promise.all([fetchTeam(), fetchMatch()])
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
          user ? (
            <Avatar
              className="rounded-full border-2 border-white"
              src="https://images.augustman.com/wp-content/uploads/sites/6/2023/06/29134648/iron-man-f.jpg"
              style={{
                '--size': '38px',
              }}
            />
          ) : null
        }
        backArrow={false}
        right={
          user ? (
            <Link to={routes.newTeam}>
              <button className="bg-transparent text-base font-medium text-secondary">
                New team
              </button>
            </Link>
          ) : null
        }
      >
        <button className="bg-transparent">
          <p className="text-lg text-black2">Groove FlashScore</p>
        </button>
      </NavBar>

      <PullToRefresh onRefresh={onRefresh}>
        <div className="my-4 flex flex-col gap-8">
          <div className="no-scrollbar flex gap-5 overflow-x-scroll px-4">
            {teams?.length === undefined ? (
              <div>Loading</div> ? (
                teams?.length === 0
              ) : (
                <div>No data</div>
              )
            ) : (
              formattedTeams.map((team, ti: number) => (
                <TeamButton
                  key={`team-${ti}`}
                  team={team}
                  selected={selectedIndex === ti}
                  onClick={() =>
                    user
                      ? navigate(
                          generatePath(routes.editTeam, { teamId: team.id })
                        )
                      : handleSelectTeam(ti)
                  }
                />
              ))
            )}
          </div>

          {myLiveMatches?.length === undefined ? (
            <div className="px-4">Loading</div>
          ) : myLiveMatches.length === 0 ? null : (
            <div className="flex flex-col gap-7">
              <div className="px-4">
                <p className="m-0 text-lg font-bold text-gray1">Live Matches</p>
              </div>
              <div className="no-scrollbar flex overflow-scroll px-4">
                <div className="flex gap-4">
                  {myLiveMatches.map((liveMatch, lmi) => (
                    <LiveMatchCard
                      key={`live-match-${lmi}`}
                      className="min-h-[13rem] w-72"
                      match={liveMatch}
                      selected={lmi === 0}
                      onClick={() => navigateMatch(liveMatch)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="m-0 text-lg font-bold text-gray1">Matches</h2>
              {user ? (
                <Link to={routes.newMatch}>
                  <button className="bg-transparent text-base font-medium text-secondary">
                    New match
                  </button>
                </Link>
              ) : null}
            </div>
            <div className="flex flex-col gap-4 px-4">
              {myMatches?.length === undefined ? (
                <div>Loading</div>
              ) : myMatches.length === 0 ? null : (
                myMatches.map((match, mi: number) => (
                  <MatchCard
                    key={`match-${mi}`}
                    match={match}
                    onClick={() => navigateMatch(match)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </PullToRefresh>
    </div>
  )
}

export default Dashboard
