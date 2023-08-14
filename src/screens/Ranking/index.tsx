import { NavBar, PullToRefresh } from 'antd-mobile'
import TeamsRanking from './components/TeamsRanking'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../routes'
import MatchButton from '../Match/components/MatchButton'
import PlayersRanking from './components/PlayersRanking'

const Ranking = () => {
  const navigate = useNavigate()
  const { teams, fetchTeam, refetchTeam, players, fetchPlayer, refetchPlayer } =
    useFlashScore()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const goalscorers = useMemo(
    () => players?.filter((player) => !player?.goalkeeper),
    [players]
  )
  const goalkeepers = useMemo(
    () => players?.filter((player) => player?.goalkeeper) ?? [],
    [players]
  )

  const onRefresh = useCallback(async () => {
    if (refetchTeam === undefined) return
    if (refetchPlayer === undefined) return
    refetchTeam()
    refetchPlayer()
  }, [refetchTeam, refetchPlayer])

  useEffect(() => {
    const handleFetchTeam = async () => {
      try {
        if (typeof fetchTeam !== 'function') return
        if (typeof fetchPlayer !== 'function') return
        await Promise.all([fetchTeam(), fetchPlayer()])
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchTeam()
  }, [fetchTeam, fetchPlayer, navigate])

  const renderTabContent = useCallback(() => {
    switch (selectedIndex) {
      case 0: {
        if (teams === undefined) return null
        return <TeamsRanking rows={teams} />
      }
      case 1: {
        if (goalscorers === undefined) return null
        return <PlayersRanking rows={goalscorers} />
      }
      case 2: {
        if (goalscorers === undefined) return null
        return <PlayersRanking rows={goalkeepers} />
      }
      default:
        return null
    }
  }, [selectedIndex, teams, goalscorers, goalkeepers])

  return (
    <div>
      <NavBar
        style={{
          '--height': '76px',
        }}
        backArrow={false}
      >
        Ranking
      </NavBar>
      <PullToRefresh onRefresh={onRefresh}>
        <div className="flex flex-col gap-5 px-4">
          <div className="flex flex-row gap-4">
            {['CLUB SCORERS', 'GOAL SCORERS', 'GOALKEEPERS'].map(
              (name: string, ti: number) => (
                <MatchButton
                  key={`tab-${ti}`}
                  team={{
                    name,
                  }}
                  selected={selectedIndex === ti}
                  onClick={() => setSelectedIndex(ti)}
                />
              )
            )}
          </div>
          <div className="flex flex-col gap-3">{renderTabContent()}</div>
        </div>
      </PullToRefresh>
    </div>
  )
}

export default Ranking
