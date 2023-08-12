import { NavBar, ProgressBar } from 'antd-mobile'
import { LiveMatchCard, TeamButton } from '../Dashboard'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { routes } from '../../routes'
import useAuth from '../../hooks/useAuth'
import { getDocRef, getDocument } from '../../firebase/service'

const Match = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [match, setMatch] = useState<any | undefined>()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const fetchMatchById = useCallback(
    async (matchId: string) => {
      if (user === null) return
      if (matchId === undefined) return
      // setLoading(true)
      const matchDocRef = getDocRef('matches', matchId)
      const matchDocData: any = await getDocument(matchDocRef)
      setMatch(matchDocData)
    },
    [user]
  )

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
            className="rounded-2xl bg-white p-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        }
        backArrow={false}
      >
        New Team
      </NavBar>

      <div className="flex flex-col gap-8 p-4">
        {match ? <LiveMatchCard match={match} /> : <div>Loading</div>}

        <div className="flex flex-col gap-5 rounded-3xl bg-white px-5 py-7">
          <div className="flex gap-4">
            {['Stats', 'Line-up', 'Summary'].map((name: string, ti: number) => (
              <TeamButton
                key={`tab-${ti}`}
                className="flex flex-1"
                team={{
                  name,
                }}
                selected={selectedIndex === ti}
                onClick={() => setSelectedIndex(ti)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {['Shots', 'Yellow card', 'Red card'].map((stat, si: number) => (
              <div key={`stat-${si}`}>
                <div className="flex justify-between">
                  <h2>0</h2>
                  <h2>{stat}</h2>
                  <h2>0</h2>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <ProgressBar className="rotate-180" percent={50} />
                  </div>
                  <div className="flex-1">
                    <ProgressBar percent={50} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Match
