import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  // useEffect,
  useMemo,
  // useState,
} from 'react'
import { getColRef } from '../../firebase/service'
import { getDocs, orderBy, query } from 'firebase/firestore'
import moment from 'moment'
import { MATCH_TIMING } from '../../constants'
import { useLocalStorage } from 'react-use'

type FlashScoreType = {
  teams?: any[]
  fetchTeam?: () => Promise<void>
  refetchTeam?: () => Promise<void>
  matches?: any[]
  fetchMatch?: () => Promise<void>
  refetchMatch?: () => Promise<void>
  players?: any[]
  fetchPlayer?: () => Promise<void>
  refetchPlayer?: () => Promise<void>
  stats?: any[]
  fetchStat?: () => Promise<void>
  refetchStat?: () => Promise<void>
}

export const FlashScoreContext = createContext<FlashScoreType>({})

let querySnapshot

export const FlashScoreProvider: FC<PropsWithChildren> = ({ children }) => {
  console.log('flashScoreProvider')
  const [teams, setTeams] = useLocalStorage<any[] | undefined>('teams')
  const [matches, setMatches] = useLocalStorage<any[] | undefined>('matchs')
  const [players, setPlayers] = useLocalStorage<any[] | undefined>('players')
  const [stats, setStats] = useLocalStorage<any[] | undefined>('stats')

  const refetchTeam = useCallback(async () => {
    try {
      const teamColGroupRef = getColRef('teams')
      const q = query(teamColGroupRef)
      querySnapshot = await getDocs(q)
      const teamDocs = querySnapshot.docs.map((doc) => {
        const matchResult = matches?.filter(
          (match) =>
            match.matchType === 'RESULT' &&
            [match.homeTeamId, match.awayTeamId].includes(doc.id)
        )

        const win = matchResult
          ?.map((match) =>
            match.homeTeamId === doc.id
              ? match?.homeRanking?.win
              : match?.awayRanking?.win
          )
          .reduce((a, b) => a + b, 0)
        const draw = matchResult
          ?.map((match) =>
            match.homeTeamId === doc.id
              ? match?.homeRanking?.draw
              : match?.awayRanking?.draw
          )
          .reduce((a, b) => a + b, 0)
        const lose = matchResult
          ?.map((match) =>
            match.homeTeamId === doc.id
              ? match?.homeRanking?.lose
              : match?.awayRanking?.lose
          )
          .reduce((a, b) => a + b, 0)
        const goalDifference = matchResult
          ?.map((match) =>
            match.homeTeamId === doc.id
              ? match?.homeRanking?.goalDifference
              : match?.awayRanking?.goalDifference
          )
          .reduce((a, b) => a + b, 0)
        const points = matchResult
          ?.map((match) =>
            match.homeTeamId === doc.id
              ? match?.homeRanking?.points
              : match?.awayRanking?.points
          )
          .reduce((a, b) => a + b, 0)
        return {
          id: doc.id,
          ...doc.data(),
          matches: matchResult?.length ?? 0,
          win: win ?? 0,
          draw: draw ?? 0,
          lose: lose ?? 0,
          goalDifference: goalDifference ?? 0,
          points: points ?? 0,
        }
      })
      setTeams(teamDocs)
    } catch (error) {
      console.error(error)
    }
    // }, [matches])
  }, [])

  const fetchTeam = useCallback(async () => {
    if (teams?.length) return
    await refetchTeam()
  }, [teams, refetchTeam])

  const refetchMatch = useCallback(async () => {
    try {
      const matchColGroupRef = getColRef('matches')
      const q = query(matchColGroupRef, orderBy('playDate', 'asc'))

      querySnapshot = await getDocs(q)
      const matchDocs = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        const playDate = moment(data?.playDate.toDate())
        const isLive =
          playDate.isSameOrBefore(moment()) &&
          moment().diff(playDate, 'minutes') <= MATCH_TIMING
        const isUpcoming = playDate.isAfter(moment())
        const isResult =
          playDate.isSameOrBefore(moment()) &&
          moment().diff(playDate, 'minutes') > MATCH_TIMING

        const homeTeamId = data?.homeTeamId
        const awayTeamId = data?.awayTeamId
        const homeGoals =
          stats?.filter(
            (stat) => stat.statId === 'GOAL' && stat.teamId === homeTeamId
          ).length ?? 0
        const awayGoals =
          stats?.filter(
            (stat) => stat.statId === 'GOAL' && stat.teamId === awayTeamId
          ).length ?? 0
        const goalDifference = homeGoals - awayGoals
        const isWin = goalDifference > 0
        const isDraw = goalDifference === 0
        const isLose = goalDifference < 0
        const homeRanking = stats
          ? {
              win: isWin ? 1 : 0,
              draw: isDraw ? 1 : 0,
              lose: isLose ? 1 : 0,
              goalDifference,
              points: isWin ? 3 : isDraw ? 1 : isLose ? 0 : 0,
            }
          : {
              win: 0,
              draw: 0,
              lose: 0,
              goalDifference: 0,
              points: 0,
            }

        const awayRanking = stats
          ? {
              win: !isWin ? 1 : 0,
              draw: isDraw ? 1 : 0,
              lose: !isLose ? 1 : 0,
              goalDifference: -goalDifference,
              points: !isWin ? 3 : isDraw ? 1 : !isLose ? 0 : 0,
            }
          : {
              win: 0,
              draw: 0,
              lose: 0,
              goalDifference: 0,
              points: 0,
            }

        return {
          id: doc.id,
          ...data,
          matchType: isLive
            ? 'LIVE'
            : isUpcoming
            ? 'UPCOMING'
            : isResult
            ? 'RESULT'
            : '',
          homeGoals,
          awayGoals,
          homeRanking,
          awayRanking,
        }
      })
      setMatches(matchDocs)
    } catch (error) {
      console.error(error)
    }
    // }, [stats])
  }, [])

  const fetchMatch = useCallback(async () => {
    console.log(matches?.length)
    if (matches?.length) return
    await refetchMatch()
  }, [matches, refetchMatch])

  const refetchPlayer = useCallback(async () => {
    try {
      const playerColGroupRef = getColRef('players')
      const q = query(playerColGroupRef)
      querySnapshot = await getDocs(q)
      const playerDocs = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        const isGoalKeeper = data.goalkeeper
        const teamId = data.teamId
        const matchResult = matches?.filter(
          (match) =>
            match.matchType === 'RESULT' &&
            [match.homeTeamId, match.awayTeamId].includes(teamId)
        )
        const goalkeeperPoints = matchResult?.map((match) =>
          match.homeTeamId === teamId ? -match?.awayGoals : -match?.homeGoals
        )
        const points = stats?.filter(
          (stat) => stat.statId === 'GOAL' && stat.playerId === doc.id
        ).length
        return {
          id: doc.id,
          ...doc.data(),
          matches: matchResult?.length ?? 0,
          points: isGoalKeeper ? goalkeeperPoints : points ?? 0,
        }
      })
      setPlayers(playerDocs)
    } catch (error) {
      console.error(error)
    }
    // }, [matches, stats])
  }, [])

  const fetchPlayer = useCallback(async () => {
    if (players?.length) return
    await refetchPlayer()
  }, [players, refetchPlayer])

  const refetchStat = useCallback(async () => {
    try {
      const statColGroupRef = getColRef('stats')
      const q = query(statColGroupRef)
      querySnapshot = await getDocs(q)
      const statDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStats(statDocs)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const fetchStat = useCallback(async () => {
    if (stats?.length) return
    await refetchStat()
  }, [stats, refetchStat])

  // NOTE: special case
  // useEffect(() => {
  //   const handleRefetchMatch = async () => {
  //     await refetchMatch()
  //   }
  //   handleRefetchMatch()
  // }, [refetchMatch])

  // useEffect(() => {
  //   const handleRefetchTeam = async () => {
  //     await refetchTeam()
  //   }
  //   handleRefetchTeam()
  // }, [refetchTeam])

  // useEffect(() => {
  //   const handleRefetchPlayer = async () => {
  //     await refetchPlayer()
  //   }
  //   handleRefetchPlayer()
  // }, [refetchPlayer])

  const value = useMemo(
    () => ({
      teams,
      fetchTeam,
      refetchTeam,
      matches,
      fetchMatch,
      refetchMatch,
      players,
      fetchPlayer,
      refetchPlayer,
      stats,
      fetchStat,
      refetchStat,
    }),
    [
      teams,
      fetchTeam,
      refetchTeam,
      matches,
      fetchMatch,
      refetchMatch,
      players,
      fetchPlayer,
      refetchPlayer,
      stats,
      fetchStat,
      refetchStat,
    ]
  )
  return (
    <FlashScoreContext.Provider value={value}>
      {children}
    </FlashScoreContext.Provider>
  )
}
