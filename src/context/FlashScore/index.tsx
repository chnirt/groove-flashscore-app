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
import useAuth from '../../hooks/useAuth'

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
}

export const FlashScoreContext = createContext<FlashScoreType>({})

let querySnapshot

export const FlashScoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[] | undefined>()
  const [matches, setMatches] = useState<any[] | undefined>()
  const [players, setPlayers] = useState<any[] | undefined>()

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
      const matchDocs = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((doc: any) => (user ? doc : !doc.hidden))
      setMatches(matchDocs)
    } catch (error) {
      console.error(error)
    }
  }, [user])

  const fetchMatch = useCallback(async () => {
    // if (matches?.length) return
    await refetchMatch()
    // }, [matches, refetchMatch])
  }, [refetchMatch])

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
    ]
  )
  return (
    <FlashScoreContext.Provider value={value}>
      {children}
    </FlashScoreContext.Provider>
  )
}
