import { NavBar } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { GoArrowLeft, GoKebabHorizontal } from 'react-icons/go'
import { routes } from '../../routes'
import { getDocRef, getDocument } from '../../firebase/service'
import LiveMatchCard from '../Dashboard/components/LiveMatchCard'
import MatchButton from './components/MatchButton'
import useAuth from '../../hooks/useAuth'
import Stat from './components/Stat'

const Match = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [match, setMatch] = useState<any | undefined>()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const fetchMatchById = useCallback(async (matchId: string) => {
    if (matchId === undefined) return
    const matchDocRef = getDocRef('matches', matchId)
    const matchDocData: any = await getDocument(matchDocRef)
    setMatch(matchDocData)
  }, [])

  useEffect(() => {
    const handleFetchMatch = async () => {
      try {
        if (matchId === undefined) return
        if (typeof fetchMatchById !== 'function') return
        await fetchMatchById(matchId)
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchMatch()
  }, [matchId, fetchMatchById, navigate])

  return (
    <div className="flex flex-col">
      <NavBar
        style={{
          '--height': '76px',
        }}
        back={
          <button
            className="h-10 w-10 rounded-2xl bg-white p-2"
            onClick={() => navigate(-1)}
          >
            <GoArrowLeft className="h-6 w-6 text-black2" />
          </button>
        }
        backArrow={false}
        right={
          user ? (
            <button className="h-10 w-10 rotate-90 rounded-2xl bg-white p-2">
              <GoKebabHorizontal className="h-6 w-6 text-black2" />
            </button>
          ) : null
        }
      >
        {match?.groupStage ? match.groupStage : <div>Loading</div>}
      </NavBar>

      <div className="flex flex-col gap-8 p-4">
        {match ? <LiveMatchCard match={match} /> : <div>Loading</div>}

        <div className="flex flex-col gap-5 rounded-3xl bg-white p-4">
          <div className="flex gap-4">
            {['Stats', 'Line-up'].map((name: string, ti: number) => (
              <MatchButton
                key={`tab-${ti}`}
                team={{
                  name,
                }}
                selected={selectedIndex === ti}
                onClick={() => setSelectedIndex(ti)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Shots',
                // home: 2,
                // away: 6,
                home: 0,
                away: 0,
              },
              {
                title: 'Yellow card',
                // home: 3,
                // away: 2,
                home: 0,
                away: 0,
              },
              {
                title: 'Red card',
                // home: 1,
                // away: 1,
                home: 0,
                away: 0,
              },
            ].map((stat, si: number) => (
              <Stat key={`stat-${si}`} stat={stat} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Match
