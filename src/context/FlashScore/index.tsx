import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { getDocs, orderBy, query } from 'firebase/firestore'
import moment from 'moment'
import { useLocalStorage } from 'usehooks-ts'
import { getColRef } from '../../firebase/service'
import { IS_DEVELOP, MATCH_TIMING } from '../../constants'

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
  fetchCache?: () => Promise<any>
  localCaches?: any[]
}

export const FlashScoreContext = createContext<FlashScoreType>({})

let querySnapshot

export const FlashScoreProvider: FC<PropsWithChildren> = ({ children }) => {
  IS_DEVELOP && console.log('FlashScoreProvider---')
  const [teams, setTeams] = useLocalStorage<any[] | undefined>(
    'teams',
    undefined
  )
  const [matches, setMatches] = useLocalStorage<any[] | undefined>(
    'matches',
    undefined
  )
  const [players, setPlayers] = useLocalStorage<any[] | undefined>(
    'players',
    undefined
  )
  const [stats, setStats] = useLocalStorage<any[] | undefined>(
    'stats',
    undefined
  )
  const [localCaches, setLocalCaches] = useLocalStorage<any | undefined>(
    'localCaches',
    {}
  )
  const [caches, setCaches] = useState<any[] | undefined>()

  const refetchTeam = useCallback(async () => {
    IS_DEVELOP && console.log('refetchTeam---')
    try {
      const teamColGroupRef = getColRef('teams')
      const q = query(teamColGroupRef)
      querySnapshot = await getDocs(q)
      const teamDocs = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
        }
      })
      IS_DEVELOP && console.log('teamDocs---', teamDocs)
      setTeams(teamDocs)
      setLocalCaches((prevState: any) => ({ ...prevState, teams: moment() }))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setTeams, setLocalCaches])

  const fetchTeam = useCallback(async () => {
    await refetchTeam()
  }, [refetchTeam])

  const refetchMatch = useCallback(async () => {
    IS_DEVELOP && console.log('refetchMatch---')
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
        }
      })
      IS_DEVELOP && console.log('matchDocs---', matchDocs)
      setMatches(matchDocs)
      setLocalCaches((prevState: any) => ({ ...prevState, matches: moment() }))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setMatches, setLocalCaches])

  const fetchMatch = useCallback(async () => {
    await refetchMatch()
  }, [refetchMatch])

  const refetchPlayer = useCallback(async () => {
    IS_DEVELOP && console.log('refetchPlayer---')
    try {
      const playerColGroupRef = getColRef('players')
      const q = query(playerColGroupRef)
      querySnapshot = await getDocs(q)
      const playerDocs = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ref: doc.ref,
          ...data,
        }
      })
      IS_DEVELOP && console.log('playerDocs---', playerDocs)
      setPlayers(playerDocs)
      setLocalCaches((prevState: any) => ({ ...prevState, players: moment() }))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setPlayers, setLocalCaches])

  const fetchPlayer = useCallback(async () => {
    await refetchPlayer()
  }, [refetchPlayer])

  const refetchStat = useCallback(async () => {
    IS_DEVELOP && console.log('refetchStat---')
    try {
      const statColGroupRef = getColRef('stats')
      const q = query(statColGroupRef)
      querySnapshot = await getDocs(q)
      const statDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data(),
      }))
      IS_DEVELOP && console.log('statDocs---', statDocs)
      setStats(statDocs)
      setLocalCaches((prevState: any) => ({ ...prevState, stats: moment() }))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setStats, setLocalCaches])

  const fetchStat = useCallback(async () => {
    await refetchStat()
  }, [refetchStat])

  const refetchCache = useCallback(async () => {
    IS_DEVELOP && console.log('refetchCache---')
    try {
      const cacheColGroupRef = getColRef('caches')
      const q = query(cacheColGroupRef)
      querySnapshot = await getDocs(q)
      const cacheDocs = querySnapshot.docs.map((doc) => {
        const id = doc.id
        const data = doc.data()
        const globalUpdatedAt = moment(data?.updatedAt.toDate())
        const localUpdatedAt = moment(localCaches?.[id])
        const localCached = localCaches?.[id] !== undefined
        const synced = localUpdatedAt.isAfter(globalUpdatedAt)
        return {
          id,
          ...data,
          localCached,
          synced,
        }
      })
      setCaches(cacheDocs)
      return cacheDocs
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [localCaches])

  const fetchCache = useCallback(async () => {
    if (caches !== undefined) return
    return await refetchCache()
  }, [refetchCache, caches])

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
      fetchCache,
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
      fetchCache,
    ]
  )
  return (
    <FlashScoreContext.Provider value={value}>
      {children}
    </FlashScoreContext.Provider>
  )
}
