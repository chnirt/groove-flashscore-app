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
import animationData from '../../assets/confetti.json'
import { Image, Modal } from 'antd-mobile'
import Lottie from 'react-lottie'

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
  fetchSettings?: () => Promise<void>
  refetchSettings?: () => Promise<void>
  settings?: any[]
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
  const [settings, setSettings] = useLocalStorage<any[] | undefined>(
    'settings',
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
        const serverUpdatedAt = moment(data?.updatedAt.toDate())
        const clientUpdatedAtCache =
          id === 'teams'
            ? localStorage.getItem('teamsUpdatedAt')
            : id === 'matches'
            ? localStorage.getItem('matchesUpdatedAt')
            : id === 'players'
            ? localStorage.getItem('playersUpdatedAt')
            : id === 'stats'
            ? localStorage.getItem('statsUpdatedAt')
            : null
        const clientUpdatedAt = moment(clientUpdatedAtCache)
        // IS_DEVELOP &&
        //   console.log(
        //     'compare---',
        //     clientUpdatedAt.toDate(),
        //     serverUpdatedAt.toDate()
        //   )
        const synced =
          clientUpdatedAtCache === null
            ? true
            : clientUpdatedAt.isBefore(serverUpdatedAt)
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

  const refetchSettings = useCallback(async () => {
    // IS_DEVELOP && console.log('refetchStat---')
    try {
      const settingsColGroupRef = getColRef('settings')
      const q = query(settingsColGroupRef)
      querySnapshot = await getDocs(q)
      const settingDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // IS_DEVELOP && console.log('settingDocs---', settingDocs)
      setSettings(settingDocs)
      localStorage.setItem('settingUpdatedAt', JSON.stringify(moment()))
      const champion: any = settingDocs.find(
        (settingDoc: any) => settingDoc.id === 'champion'
      )
      if (champion && champion?.visible) {
        const defaultOptions = {
          loop: true,
          autoplay: true,
          animationData,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
            className: 'w-full',
          },
        }

        Modal.alert({
          content: (
            <div className="relative">
              <Image src={champion?.champion} className="w-full" />
              <div className="absolute left-0 top-0">
                <Lottie options={defaultOptions} />
              </div>
            </div>
          ),
          confirmText: 'Congrats',
        })
      }
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [setSettings])

  const fetchSettings = useCallback(async () => {
    await refetchSettings()
  }, [refetchSettings])

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
      fetchSettings,
      refetchSettings,
      settings,
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

      fetchSettings,
      refetchSettings,
      settings,
    ]
  )
  return (
    <FlashScoreContext.Provider value={value}>
      {children}
    </FlashScoreContext.Provider>
  )
}
