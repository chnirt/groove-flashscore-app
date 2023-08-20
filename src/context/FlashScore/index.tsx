import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
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

  const refetchTeam = useCallback(async () => {
    // IS_DEVELOP && console.log('refetchTeam---')
    try {
      const teamColGroupRef = getColRef('teams')
      const q = query(teamColGroupRef)
      querySnapshot = await getDocs(q)
      const teamDocs = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ref: doc.ref,
          ...data,
        }
      })
      // IS_DEVELOP && console.log('teamDocs---', teamDocs)
      setTeams(teamDocs)
      localStorage.setItem('teamsUpdatedAt', JSON.stringify(moment()))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setTeams])

  const fetchTeam = useCallback(async () => {
    await refetchTeam()
  }, [refetchTeam])

  const refetchMatch = useCallback(async () => {
    // IS_DEVELOP && console.log('refetchMatch---')
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
      // IS_DEVELOP && console.log('matchDocs---', matchDocs)
      setMatches(matchDocs)
      localStorage.setItem('matchesUpdatedAt', JSON.stringify(moment()))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setMatches])

  const fetchMatch = useCallback(async () => {
    await refetchMatch()
  }, [refetchMatch])

  const refetchPlayer = useCallback(async () => {
    // IS_DEVELOP && console.log('refetchPlayer---')
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
      // IS_DEVELOP && console.log('playerDocs---', playerDocs)
      setPlayers(playerDocs)
      localStorage.setItem('playersUpdatedAt', JSON.stringify(moment()))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setPlayers])

  const fetchPlayer = useCallback(async () => {
    await refetchPlayer()
  }, [refetchPlayer])

  const refetchStat = useCallback(async () => {
    // IS_DEVELOP && console.log('refetchStat---')
    try {
      const statColGroupRef = getColRef('stats')
      const q = query(statColGroupRef)
      querySnapshot = await getDocs(q)
      const statDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data(),
      }))
      // IS_DEVELOP && console.log('statDocs---', statDocs)
      setStats(statDocs)
      localStorage.setItem('statsUpdatedAt', JSON.stringify(moment()))
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setStats])

  const fetchStat = useCallback(async () => {
    await refetchStat()
  }, [refetchStat])

  const refetchCache = useCallback(async () => {
    // IS_DEVELOP && console.log('refetchCache---')
    try {
      const cacheColGroupRef = getColRef('caches')
      const q = query(cacheColGroupRef)
      querySnapshot = await getDocs(q)
      const cacheDocs = querySnapshot.docs.map((doc) => {
        const id = doc.id
        const data = doc.data()
        const globalUpdatedAt = moment(data?.updatedAt.toDate())
        const localUpdatedAtCache =
          id === 'teams'
            ? localStorage.getItem('teamsUpdatedAt')
            : id === 'matches'
            ? localStorage.getItem('matchesUpdatedAt')
            : id === 'players'
            ? localStorage.getItem('playersUpdatedAt')
            : id === 'stats'
            ? localStorage.getItem('statsUpdatedAt')
            : null
        const localUpdatedAt = moment(localUpdatedAtCache)
        // IS_DEVELOP &&
        //   console.log(
        //     'compare---',
        //     localUpdatedAt.toDate(),
        //     globalUpdatedAt.toDate()
        //   )
        const synced =
          localUpdatedAtCache === null
            ? true
            : localUpdatedAt.isBefore(globalUpdatedAt)
        return {
          id,
          ...data,
          synced,
        }
      })
      // IS_DEVELOP && console.log('cacheDocs---', cacheDocs)
      const caches = [
        {
          id: 'teams',
          fetch:
            cacheDocs.find((cacheDoc) => cacheDoc.id === 'teams')?.synced ??
            true,
        },
        {
          id: 'matches',
          fetch:
            cacheDocs.find((cacheDoc) => cacheDoc.id === 'matches')?.synced ??
            true,
        },
        {
          id: 'players',
          fetch:
            cacheDocs.find((cacheDoc) => cacheDoc.id === 'players')?.synced ??
            true,
        },
        {
          id: 'stats',
          fetch:
            cacheDocs.find((cacheDoc) => cacheDoc.id === 'stats')?.synced ??
            true,
        },
      ].filter((cache: any) => cache.fetch)
      // IS_DEVELOP && console.log('caches---', caches)
      return caches
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [])

  const fetchCache = useCallback(async () => {
    return await refetchCache()
  }, [refetchCache])

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
