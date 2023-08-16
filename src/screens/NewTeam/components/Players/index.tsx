import { Avatar, List, SearchBar, Skeleton } from 'antd-mobile'
import { Fragment, useMemo, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { useDebounce } from 'react-use'
import { routes } from '../../../../routes'
import useAuth from '../../../../hooks/useAuth'
import useFlashScore from '../../../../context/FlashScore/useFlashScore'

const Players = ({ header, teamId }: { header?: string; teamId?: string }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { teams, players } = useFlashScore()
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  useDebounce(
    () => {
      setDebouncedSearchText(searchText)
    },
    500,
    [searchText]
  )

  const filterPlayers = useMemo(() => {
    const visiblePlayers = players?.filter((player) =>
      teamId ? player.teamId === teamId : true
    )
    if (debouncedSearchText.length === 0) return visiblePlayers
    return visiblePlayers?.filter((player: any) =>
      String(player.name)
        .toLowerCase()
        .includes(String(debouncedSearchText).toLowerCase())
    )
  }, [teamId, players, debouncedSearchText])

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
