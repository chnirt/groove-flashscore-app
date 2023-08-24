import { NavBar, PullToRefresh, Skeleton } from 'antd-mobile'
import TeamsRanking from './components/TeamsRanking'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { useCallback, useMemo, useState } from 'react'
import MatchButton from '../Match/components/MatchButton'
import PlayersRanking from './components/PlayersRanking'
import { IS_MOCK } from '../../constants'

const Ranking = () => {
  const {
    teams,
    matches,
    stats,
    refetchTeam,
    players,
    refetchPlayer,
    refetchMatch,
    refetchStat,
  } = useFlashScore()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const myTeams = useMemo(() => {
    return teams?.map((team) => {
      const matchResult = matches
        ?.filter(
          (match) =>
            match.matchType === 'RESULT' &&
            match.hidden === false &&
            [match.homeTeamId, match.awayTeamId].includes(team.id)
        )
        .map((match) => {
          const isHome = match.homeTeamId === team.id
          const foundStats = stats?.filter((stat) => stat.matchId === match.id)
          const homeGoals =
            foundStats?.filter(
              (stat) =>
                stat.statId === 'GOAL' && stat.teamId === match.homeTeamId
            ).length ?? 0
          const awayGoals =
            foundStats?.filter(
              (stat) =>
                stat.statId === 'GOAL' && stat.teamId === match.awayTeamId
            ).length ?? 0
          const goalDifference = isHome
            ? homeGoals - awayGoals
            : -(homeGoals - awayGoals)
          const isWin = goalDifference > 0
          const isDraw = goalDifference === 0
          const isLose = goalDifference < 0
          return {
            ...match,
            goalDifference,
            win: isWin ? 1 : 0,
            draw: isDraw ? 1 : 0,
            lose: isLose ? 1 : 0,
            points: isWin ? 3 : isDraw ? 1 : isLose ? 0 : 0,
          }
        })
      const winTotal = matchResult
        ?.map((match) => match.win)
        .reduce((a, b) => a + b, 0)
      const drawTotal = matchResult
        ?.map((match) => match.draw)
        .reduce((a, b) => a + b, 0)
      const loseTotal = matchResult
        ?.map((match) => match.lose)
        .reduce((a, b) => a + b, 0)
      const goalDifferenceTotal = matchResult
        ?.map((match) => match.goalDifference)
        .reduce((a, b) => a + b, 0)
      const pointsTotal = matchResult
        ?.map((match) => match.points)
        .reduce((a, b) => a + b, 0)
      const win = winTotal ?? 0
      const draw = drawTotal ?? 0
      const lose = loseTotal ?? 0
      const goalDifference = goalDifferenceTotal ?? 0
      const points = pointsTotal ?? 0
      return {
        ...team,
        ...(IS_MOCK
          ? {
              name: 'Name Team',
            }
          : {}),
        matches: matchResult?.length ?? 0,
        win: win ?? 0,
        draw: draw ?? 0,
        lose: lose ?? 0,
        goalDifference: goalDifference ?? 0,
        points: points ?? 0,
      }
    })
  }, [teams, matches, stats])

  const goalscorers = useMemo(() => {
    return players
      ?.filter((player) => !player?.goalkeeper)
      ?.map((player) => {
        const teamId = player.teamId
        const matchResult = matches?.filter(
          (match) =>
            match.matchType === 'RESULT' &&
            match.hidden === false &&
            [match.homeTeamId, match.awayTeamId].includes(teamId)
        )
        const points = stats?.filter(
          (stat) => stat.statId === 'GOAL' && stat.playerId === player.id
        ).length
        return {
          ...player,
          ...(IS_MOCK
            ? {
                name: 'Name Player',
              }
            : {}),
          matches: matchResult?.length ?? 0,
          points: points ?? 0,
        }
      })
  }, [players, matches, stats])
  const goalkeepers = useMemo(() => {
    return players
      ?.filter((player) => player?.goalkeeper)
      ?.map((player) => {
        const teamId = player.teamId
        const matchResult = matches?.filter(
          (match) =>
            match.matchType === 'RESULT' &&
            match.hidden === false &&
            [match.homeTeamId, match.awayTeamId].includes(teamId)
        )
        const goalkeeperPoints = matchResult
          ?.map((match) => {
            const foundStats = stats?.filter(
              (stat) => stat.matchId === match.id
            )
            const homeGoals =
              foundStats?.filter(
                (stat) =>
                  stat.statId === 'GOAL' && stat.teamId === match.homeTeamId
              ).length ?? 0
            const awayGoals =
              foundStats?.filter(
                (stat) =>
                  stat.statId === 'GOAL' && stat.teamId === match.awayTeamId
              ).length ?? 0
            return match.homeTeamId === teamId ? -awayGoals : -homeGoals
          })
          .reduce((a, b) => a + b, 0)
        return {
          ...player,
          ...(IS_MOCK
            ? {
                name: 'Name Player',
              }
            : {}),
          matches: matchResult?.length ?? 0,
          points: goalkeeperPoints ?? 0,
        }
      })
  }, [players, matches, stats])

  const onRefresh = useCallback(async () => {
    if (refetchTeam === undefined) return
    if (refetchMatch === undefined) return
    if (refetchPlayer === undefined) return
    if (refetchStat === undefined) return
    await Promise.all([
      refetchTeam(),
      refetchMatch(),
      refetchPlayer(),
      refetchStat(),
    ])
  }, [refetchTeam, refetchMatch, refetchPlayer, refetchStat])

  const renderTabContent = useCallback(() => {
    switch (selectedIndex) {
      case 0: {
        if (myTeams === undefined)
          return <Skeleton animated className="h-screen w-full rounded-3xl" />
        return (
          <TeamsRanking
            rows={myTeams.sort((a, b) =>
              b.points - a.points === 0
                ? b.goalDifference - a.goalDifference
                : b.points - a.points
            )}
          />
        )
      }
      case 1: {
        if (goalscorers === undefined)
          return <Skeleton animated className="h-screen w-full rounded-3xl" />
        return (
          <PlayersRanking
            rows={goalscorers.sort((a, b) => b.points - a.points)}
          />
        )
      }
      case 2: {
        if (goalkeepers === undefined)
          return <Skeleton animated className="h-screen w-full rounded-3xl" />
        return (
          <PlayersRanking
            rows={goalkeepers.sort((a, b) => b.points - a.points)}
          />
        )
      }
      default:
        return null
    }
  }, [selectedIndex, myTeams, goalscorers, goalkeepers])

  return (
    <div>
      <NavBar className="sticky top-0 z-10 bg-bgPrimary" backArrow={false}>
        Ranking
      </NavBar>
      <PullToRefresh onRefresh={onRefresh}>
        <div className="flex flex-col gap-5 px-4">
          <div className="flex flex-row gap-4">
            {['POINTS TABLE', 'TOP GOAL SCORERS', 'TOP GOALKEEPERS'].map(
              (name: string, ti: number) => (
                <MatchButton
                  className="h-full w-full"
                  key={`tab-${ti}`}
                  team={{
                    name,
                  }}
                  selected={selectedIndex === ti}
                  onClick={() => setSelectedIndex(ti)}
                />
              )
            )}
          </div>
          <div className="flex flex-col gap-3">{renderTabContent()}</div>
        </div>
      </PullToRefresh>
    </div>
  )
}

export default Ranking
