import { Button, Dialog, NavBar, Skeleton, Toast } from 'antd-mobile'
import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { GoArrowLeft, GoKebabHorizontal } from 'react-icons/go'
import { routes } from '../../routes'
import LiveMatchCard from '../Dashboard/components/LiveMatchCard'
import MatchButton from './components/MatchButton'
import useAuth from '../../hooks/useAuth'
import Stat from './components/Stat'
import LineUp from './components/LineUp'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { getDocRef, setCache } from '../../firebase/service'
import { deleteDoc } from 'firebase/firestore'

const Match = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { matches, stats, refetchMatch } = useFlashScore()
  const myMatch = useMemo(() => {
    const foundMatch = matches?.find((match) => match.id === matchId)
    const foundStats = stats?.filter((stat) => stat.matchId === matchId)
    const homeGoals =
      foundStats?.filter(
        (stat) =>
          stat.statId === 'GOAL' && stat.teamId === foundMatch.homeTeamId
      ).length ?? 0
    const awayGoals =
      foundStats?.filter(
        (stat) =>
          stat.statId === 'GOAL' && stat.teamId === foundMatch.awayTeamId
      ).length ?? 0
    const homeYellowCards =
      foundStats?.filter(
        (stat) =>
          stat.statId === 'YELLOW_CARD' && stat.teamId === foundMatch.homeTeamId
      ).length ?? 0
    const awayYellowCards =
      foundStats?.filter(
        (stat) =>
          stat.statId === 'YELLOW_CARD' && stat.teamId === foundMatch.awayTeamId
      ).length ?? 0
    const homeRedCards =
      foundStats?.filter(
        (stat) =>
          stat.statId === 'RED_CARD' && stat.teamId === foundMatch.homeTeamId
      ).length ?? 0
    const awayRedCards =
      foundStats?.filter(
        (stat) =>
          stat.statId === 'RED_CARD' && stat.teamId === foundMatch.awayTeamId
      ).length ?? 0
    return {
      ...foundMatch,
      homeGoals,
      awayGoals,
      homeYellowCards,
      awayYellowCards,
      homeRedCards,
      awayRedCards,
    }
  }, [matchId, matches, stats])
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const removeMatch = useCallback(async () => {
    await Dialog.confirm({
      content: 'Are you sure want to delete?',
      cancelText: 'Cancel',
      confirmText: 'Delete',
      onConfirm: async () => {
        if (matchId === undefined) return
        const matchDocRef = getDocRef('matches', matchId)
        if (matchDocRef === undefined) return
        await deleteDoc(matchDocRef)
        await setCache('matches')
        if (typeof refetchMatch === 'function') {
          await refetchMatch()
        }
        navigate(-1)
        Toast.show({
          icon: 'success',
          content: 'Deleted',
        })
      },
    })
  }, [matchId, navigate, refetchMatch])

  const renderTabContent = useCallback(() => {
    switch (selectedIndex) {
      case 0:
        return [
          {
            title: 'Goals',
            home: myMatch.homeGoals,
            away: myMatch.awayGoals,
          },
          {
            title: 'Yellow cards',
            home: myMatch.homeYellowCards,
            away: myMatch.awayYellowCards,
          },
          {
            title: 'Red cards',
            home: myMatch.homeRedCards,
            away: myMatch.awayRedCards,
          },
        ].map((stat, si: number) => <Stat key={`stat-${si}`} stat={stat} />)
      case 1:
        return <LineUp matchData={myMatch} />
      default:
        return null
    }
  }, [selectedIndex, myMatch])

  useEffect(() => {
    if (matches?.length) {
      if (myMatch) {
        setSelectedIndex(0)
      } else {
        throw 'This match was not existed'
      }
    }
  }, [matches, myMatch])

  return (
    <div className="flex flex-col">
      <NavBar
        className="sticky top-0 z-10 bg-bgPrimary"
        back={
          <button
            className="h-10 w-10 rounded-2xl bg-white p-2"
            onClick={() => navigate(routes.dashboard)}
          >
            <GoArrowLeft className="h-6 w-6 text-black2" />
          </button>
        }
        backArrow={false}
        right={
          user ? (
            <button
              className="h-10 w-10 rounded-2xl bg-white p-2"
              onClick={() =>
                navigate(
                  generatePath(routes.editMatch, {
                    matchId,
                  })
                )
              }
            >
              <GoKebabHorizontal className="h-6 w-6 text-black2" />
            </button>
          ) : null
        }
      >
        {myMatch?.groupStage ? (
          myMatch.groupStage
        ) : (
          <Skeleton.Title className="!mb-0 !mt-0 h-7" />
        )}
      </NavBar>

      <div className="flex flex-col gap-8 p-4">
        {myMatch ? (
          <LiveMatchCard
            match={myMatch}
            homeGoals={myMatch.homeGoals}
            awayGoals={myMatch.awayGoals}
          />
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
                onClick={() => {
                  setSelectedIndex(ti)
                }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">{renderTabContent()}</div>
        </div>
      </div>

      {user ? (
        <Button
          color="primary"
          fill="none"
          block
          type="submit"
          size="large"
          shape="rounded"
          onClick={removeMatch}
        >
          Remove
        </Button>
      ) : null}
    </div>
  )
}

export default Match
