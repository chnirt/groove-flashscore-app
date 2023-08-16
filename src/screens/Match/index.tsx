import { NavBar, Skeleton } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { GoArrowLeft, GoKebabHorizontal } from 'react-icons/go'
import { DocumentData, DocumentReference } from 'firebase/firestore'
import { routes } from '../../routes'
import { getDocRef, getDocument } from '../../firebase/service'
import LiveMatchCard from '../Dashboard/components/LiveMatchCard'
import MatchButton from './components/MatchButton'
import useAuth from '../../hooks/useAuth'
import Stat from './components/Stat'
import LineUp from './components/LineUp'
import useFlashScore from '../../context/FlashScore/useFlashScore'

const Match = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchTeam, fetchMatch } = useFlashScore()
  const [match, setMatch] = useState<any | undefined>()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [matchDocRefState, setMatchDocRefState] = useState<DocumentReference<
    DocumentData,
    DocumentData
  > | null>(null)

  const fetchMatchById = useCallback(async (matchId: string) => {
    if (matchId === undefined) return
    const matchDocRef = getDocRef('matches', matchId)
    setMatchDocRefState(matchDocRef)
    const matchDocData: any = await getDocument(matchDocRef)
    setMatch(matchDocData)
  }, [])

  useEffect(() => {
    const handleFetchMatch = async () => {
      try {
        if (matchId === undefined) return
        if (typeof fetchMatchById !== 'function') return
        if (typeof fetchTeam !== 'function') return
        if (typeof fetchMatch !== 'function') return
        await Promise.all([fetchTeam(), fetchMatch(), fetchMatchById(matchId)])
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchMatch()
  }, [matchId, fetchMatchById, fetchTeam, fetchMatch, navigate])

  const renderTabContent = useCallback(() => {
    switch (selectedIndex) {
      case 0:
        return [
          {
            title: 'Goals',
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
        ].map((stat, si: number) => <Stat key={`stat-${si}`} stat={stat} />)
      case 1:
        return <LineUp matchDocRefState={matchDocRefState} match={match} />
      default:
        return null
    }
  }, [selectedIndex, matchDocRefState, match])

  return (
    <div className="flex flex-col">
      <NavBar
        className="sticky top-0 z-10 bg-bgPrimary"
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
        {match?.groupStage ? (
          match.groupStage
        ) : (
          <Skeleton.Title className="!mb-0 !mt-0 h-7" />
        )}
      </NavBar>

      <div className="flex flex-col gap-8 p-4">
        {match ? (
          <LiveMatchCard match={match} />
        ) : (
          <Skeleton animated className="h-[13rem] w-full rounded-3xl" />
        )}

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
          <div className="flex flex-col gap-3">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default Match
