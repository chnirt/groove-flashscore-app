import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getColRef } from '../../firebase/service'
import { getDocs, orderBy, query } from 'firebase/firestore'
import moment from 'moment'
import { MATCH_TIMING } from '../../constants'

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
  const [teams, setTeams] = useState<any[] | undefined>()
  const [matches, setMatches] = useState<any[] | undefined>()
  const [players, setPlayers] = useState<any[] | undefined>()
  const [stats, setStats] = useState<any[] | undefined>()

  const refetchTeam = useCallback(async () => {
    try {
      const teamColGroupRef = getColRef('teams')
      const q = query(teamColGroupRef)
      querySnapshot = await getDocs(q)
      const teamDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        matches: 0,
        win: 0,
        draw: 0,
        lose: 0,
        goalDifference: 0,
        points: 0,
      }))
      setTeams(teamDocs)
    } catch (error) {
      console.error(error)
    }
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
        const ranking = {
          homeGoals,
          awayGoals,
          win: isWin ? 1 : 0,
          draw: isDraw ? 1 : 0,
          lose: isLose ? 1 : 0,
          goalDifference,
          points: isWin ? 3 : isDraw ? 1 : isLose ? 0 : 0,
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
          ranking,
        }
      })
      setMatches(matchDocs)
    } catch (error) {
      console.error(error)
    }
  }, [stats])

  const fetchMatch = useCallback(async () => {
    if (matches?.length) return
    await refetchMatch()
  }, [matches, refetchMatch])

  const refetchPlayer = useCallback(async () => {
    try {
      const playerColGroupRef = getColRef('players')
      const q = query(playerColGroupRef)
      querySnapshot = await getDocs(q)
      const playerDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        points: 0,
      }))
      setPlayers(playerDocs)
    } catch (error) {
      console.error(error)
    }
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
  useEffect(() => {
    const handleRefetchMatch = async () => {
      await refetchMatch()
    }
    handleRefetchMatch()
  }, [refetchMatch])

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
