import { Avatar, List, SearchBar, Skeleton } from 'antd-mobile'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { getDocs, query, where } from 'firebase/firestore'
import { useDebounce } from 'react-use'
import { routes } from '../../../../routes'
import { getColRef } from '../../../../firebase/service'
import useAuth from '../../../../hooks/useAuth'
import useFlashScore from '../../../../context/FlashScore/useFlashScore'

let querySnapshot

const Players = ({ header, teamId }: { header?: string; teamId?: string }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { teams } = useFlashScore()
  const [players, setPlayers] = useState<any[]>()
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  useDebounce(
    () => {
      setDebouncedSearchText(searchText)
    },
    500,
    [searchText]
  )

  const fetchPlayers = useCallback(async (teamId?: string) => {
    const playerColGroupRef = getColRef('players')
    const q = teamId
      ? query(playerColGroupRef, where('teamId', '==', teamId))
      : query(playerColGroupRef)
    querySnapshot = await getDocs(q)
    const playerDocs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    setPlayers(playerDocs)
  }, [])

  useEffect(() => {
    const handleFetchTeam = async () => {
      try {
        if (typeof fetchPlayers !== 'function') return
        await fetchPlayers(teamId)
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchTeam()
  }, [teamId, fetchPlayers, navigate])

  const filterPlayers = useMemo(() => {
    if (players === undefined) return undefined
    if (debouncedSearchText.length === 0) return players
    return players.filter((player: any) =>
      String(player.name)
        .toLowerCase()
        .includes(String(debouncedSearchText).toLowerCase())
    )
  }, [players, debouncedSearchText])

  return (
    <Fragment>
      <SearchBar
        className="sticky top-[45px] z-10 bg-bgPrimary"
        placeholder="Search"
        value={searchText}
        onChange={setSearchText}
      />
      {filterPlayers === undefined ? (
        <Skeleton animated className="h-screen w-full rounded-3xl" />
      ) : filterPlayers.length === 0 ? null : (
        <List header={header} mode="card">
          {filterPlayers.map((player, pi: number) => {
            const avatar = player?.avatar?.[0]?.url ?? ''
            const team = teams?.find((team) => team.id === player.teamId)
            const teamLogo = team?.logo?.[0]?.url
            return (
              <List.Item
                key={`player-${pi}`}
                prefix={<Avatar src={avatar} />}
                description={player.jerseyNumber}
                onClick={
                  user
                    ? () =>
                        navigate(
                          generatePath(routes.editPlayer, {
                            teamId: player.teamId,
                            playerId: player.id,
                          })
                        )
                    : undefined
                }
                arrow={
                  <div className="flex items-center">
                    {player?.goalkeeper ? (
                      <div className="mr-2">Goalkeeper</div>
                    ) : null}
                    <img className="h-10 w-10 object-contain" src={teamLogo} />
                  </div>
                }
              >
                {player.name}
              </List.Item>
            )
          })}
        </List>
      )}
    </Fragment>
  )
}

export default Players
