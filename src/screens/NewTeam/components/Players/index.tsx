import { Avatar, List } from 'antd-mobile'
import { useCallback, useEffect, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { getDocs, query, where } from 'firebase/firestore'
import { routes } from '../../../../routes'
import { getColRef } from '../../../../firebase/service'

let querySnapshot

const Players = ({ teamId }: { teamId: string }) => {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<any[]>()

  const fetchPlayers = useCallback(async (teamId: string) => {
    const playerColGroupRef = getColRef('players')
    const q = query(playerColGroupRef, where('teamId', '==', teamId))
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
  if (players === undefined) return <div className="px-4">Loading</div>
  if (players.length === 0) return <div className="px-4">No data</div>
  return (
    <List header="Players" mode="card">
      {players.map((player, pi: number) => {
        const avatar = player?.avatar?.[0]?.url ?? ''
        return (
          <List.Item
            key={`player-${pi}`}
            prefix={<Avatar src={avatar} />}
            description={player.jerseyNumber}
            onClick={() =>
              navigate(
                generatePath(routes.editPlayer, {
                  teamId,
                  playerId: player.id,
                })
              )
            }
          >
            {player.name}
          </List.Item>
        )
      })}
    </List>
  )
}

export default Players
