import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { getColRef } from '../../firebase/service'
import { getDocs, query, where } from 'firebase/firestore'
import useAuth from '../../hooks/useAuth'

type FlashScoreType = {
  teams?: any[]
  fetchTeam?: () => Promise<void>
  refetchTeam?: () => Promise<void>
  matches?: any[]
  fetchMatch?: () => Promise<void>
  refetchMatch?: () => Promise<void>
}

export const FlashScoreContext = createContext<FlashScoreType>({})

let querySnapshot

export const FlashScoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[] | undefined>()
  const [matches, setMatches] = useState<any[] | undefined>()

  const refetchTeam = useCallback(async () => {
    try {
      if (user?.uid === undefined) return
      const teamColGroupRef = getColRef('teams')
      const q = query(teamColGroupRef, where('uid', '==', user.uid))
      querySnapshot = await getDocs(q)
      const teamDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTeams(teamDocs)
    } catch (error) {
      console.log(error)
    }
  }, [user])

  const fetchTeam = useCallback(async () => {
    if (teams?.length) return
    await refetchTeam()
  }, [teams, refetchTeam])

  const refetchMatch = useCallback(async () => {
    try {
      if (user?.uid === undefined) return
      const matchColGroupRef = getColRef('matches')
      const q = query(matchColGroupRef, where('uid', '==', user.uid))
      querySnapshot = await getDocs(q)
      const matchDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMatches(matchDocs)
    } catch (error) {
      console.log(error)
    }
  }, [user])

  const fetchMatch = useCallback(async () => {
    if (teams?.length) return
    await refetchMatch()
  }, [teams, refetchMatch])

  const value = useMemo(
    () => ({
      teams,
      fetchTeam,
      refetchTeam,
      matches,
      fetchMatch,
      refetchMatch,
    }),
    [teams, fetchTeam, refetchTeam, matches, fetchMatch, refetchMatch]
  )
  return (
    <FlashScoreContext.Provider value={value}>
      {children}
    </FlashScoreContext.Provider>
  )
}
