import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { getColRef } from '../../firebase/service'
import { getDocs, orderBy, query } from 'firebase/firestore'
import moment from 'moment'
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
}

export const FlashScoreContext = createContext<FlashScoreType>({})

let querySnapshot

export const FlashScoreProvider: FC<PropsWithChildren> = ({ children }) => {
  // console.log('FlashScoreProvider---')
  const [teams, setTeams] = useState<any[] | undefined>()
  const [matches, setMatches] = useState<any[] | undefined>()
  const [players, setPlayers] = useState<any[] | undefined>()
  const [stats, setStats] = useState<any[] | undefined>()

  const refetchTeam = useCallback(async () => {
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
      // console.log('teamDocs---', teamDocs)
      setTeams(teamDocs)
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [])

  const fetchTeam = useCallback(async () => {
    if (teams !== undefined) return
    await refetchTeam()
  }, [refetchTeam, teams])

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
      // console.log('matchDocs---', matchDocs)
      setMatches(matchDocs)
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [])

  const fetchMatch = useCallback(async () => {
    // if (matches !== undefined) return
    await refetchMatch()
  }, [refetchMatch])

  const refetchPlayer = useCallback(async () => {
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
      // console.log('playerDocs---', playerDocs)
      setPlayers(playerDocs)
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [])

  const fetchPlayer = useCallback(async () => {
    if (players !== undefined) return
    await refetchPlayer()
  }, [refetchPlayer, players])

  const refetchStat = useCallback(async () => {
    try {
      const statColGroupRef = getColRef('stats')
      const q = query(statColGroupRef)
      querySnapshot = await getDocs(q)
      const statDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data(),
      }))
      // console.log('statDocs---', statDocs)
      setStats(statDocs)
    } catch (error) {
      if (IS_DEVELOP) {
        console.error(error)
      }
    }
  }, [])

  const fetchStat = useCallback(async () => {
    // if (stats !== undefined) return
    await refetchStat()
  }, [refetchStat])

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
