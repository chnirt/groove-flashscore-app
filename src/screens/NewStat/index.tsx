import { Button, Dialog, Form, NavBar, Toast } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { GoArrowLeft } from 'react-icons/go'
import { useCallback, useEffect, useMemo } from 'react'
import { deleteDoc } from 'firebase/firestore'
import useAuth from '../../hooks/useAuth'
import { MASTER_MOCK_DATA } from '../../mocks'
import {
  addDocument,
  getColRef,
  getDocRef,
  setCache,
  updateDocument,
} from '../../firebase/service'
import { Loading } from '../../global'
import { Select } from 'antd'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { STATS } from '../../constants'
import { routes } from '../../routes'

const initialValues = MASTER_MOCK_DATA.NEW_STAT

const NewStat = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const statIdState = Form.useWatch('statId', form)
  const { matchId, statId } = useParams()
  const isEditMode = statId
  const { user } = useAuth()
  const { matches, players, refetchStat, stats } = useFlashScore()
  const filteredPlayers = useMemo(() => {
    if (matchId === undefined) return undefined
    const foundedMatch = matches?.find((match) => match.id === matchId)
    if (foundedMatch === undefined) return undefined
    if (players === undefined) return undefined
    return players?.filter((player) =>
      [foundedMatch.homeTeamId, foundedMatch.awayTeamId].includes(player.teamId)
    )
  }, [matchId, matches, players])
  const goalScorers = useMemo(() => filteredPlayers, [filteredPlayers])
  const goalKeepers = useMemo(
    () => filteredPlayers?.filter((player) => player.goalkeeper),
    [filteredPlayers]
  )

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (user === null) return
      try {
        Loading.get.show()
        const { statId: statIdState, playerId, goalKeeperId } = values
        const foundPlayer = filteredPlayers?.find(
          (filteredPlayer) => filteredPlayer.id === playerId
        )
        const teamId = foundPlayer.teamId
        const playerName = foundPlayer.name
        const uid = user.uid
        const statData = {
          statId: statIdState,
          playerId,
          playerName,
          ...(goalKeeperId ? { goalKeeperId } : {}),
          teamId,
          matchId,
          uid,
        }

        if (isEditMode) {
          if (statId === undefined) return
          const statDocRef = getDocRef('stats', statId)
          if (statDocRef === undefined) return
          await updateDocument(statDocRef, statData)
        } else {
          const statsDocRef = getColRef('stats')
          await addDocument(statsDocRef, statData)
        }

        await setCache('stats')

        if (typeof refetchStat === 'function') {
          await refetchStat()
        }

        navigate(-1)
        Toast.show({
          icon: 'success',
          content: isEditMode ? 'Saved' : 'Added',
        })

        return
      } catch (error: any) {
        Toast.show({
          icon: 'error',
          content: error.message,
        })
      } finally {
        Loading.get.hide()
      }
    },
    [user, navigate, refetchStat, filteredPlayers, matchId, isEditMode, statId]
  )

  const removePlayer = useCallback(async () => {
    await Dialog.confirm({
      content: 'Are you sure want to delete?',
      cancelText: 'Cancel',
      confirmText: 'Delete',
      onConfirm: async () => {
        if (statId === undefined) return
        const statDocRef = getDocRef('stats', statId)
        if (statDocRef === undefined) return
        await deleteDoc(statDocRef)
        await setCache('stats')
        if (typeof refetchStat === 'function') {
          await refetchStat()
        }
        navigate(-2)
        Toast.show({
          icon: 'success',
          content: 'Deleted',
        })
      },
    })
  }, [navigate, refetchStat, statId])

  const fetchStatById = useCallback(
    async (statId: string) => {
      if (stats === undefined) return
      const statDocData = await stats.find((team) => team.id === statId)
      form.setFieldsValue({
        ...statDocData,
      })
    },
    [form, stats]
  )

  useEffect(() => {
    if (statId === undefined || typeof fetchStatById !== 'function') return
    const handleFetchPlayer = async () => {
      try {
        await fetchStatById(statId)
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchPlayer()
  }, [statId, fetchStatById, navigate])

  return (
    <div>
      <NavBar
        className="sticky top-0 bg-bgPrimary"
        back={
          <button
            className="h-10 w-10 rounded-2xl bg-white p-2"
            onClick={() => navigate(-1)}
          >
            <GoArrowLeft className="h-6 w-6 text-black2" />
          </button>
        }
        backArrow={false}
      >
        New Stat
      </NavBar>

      <Form
        form={form}
        initialValues={initialValues}
        layout="horizontal"
        onFinish={onFinish}
        mode="card"
        footer={
          <Button
            block
            type="submit"
            color="primary"
            size="large"
            shape="rounded"
          >
            {isEditMode ? 'Save' : 'Add'}
          </Button>
        }
      >
        <Form.Header>New Stat</Form.Header>
        <Form.Item
          name="statId"
          label="Stat"
          rules={[
            {
              required: true,
              message: 'Stat is required',
            },
          ]}
        >
          <Select className="w-full">
            {STATS.map((stat, ti: number) => (
              <Select.Option key={`stat-${ti}`} value={stat.id}>
                {stat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="playerId"
          label="Player"
          rules={[
            {
              required: true,
              message: 'Player is required',
            },
          ]}
        >
          <Select className="w-full" disabled={goalScorers?.length === 0}>
            {goalScorers?.length !== undefined && goalScorers?.length > 0
              ? goalScorers.map((player, ti: number) => (
                  <Select.Option key={`player-${ti}`} value={player.id}>
                    {player.name}
                  </Select.Option>
                ))
              : null}
          </Select>
        </Form.Item>

        {statIdState === 'GOAL' && (
          <Form.Item
            name="goalKeeperId"
            label="GoalKeeper"
            rules={[
              {
                required: true,
                message: 'GoalKeeper is required',
              },
            ]}
          >
            <Select className="w-full" disabled={goalKeepers?.length === 0}>
              {goalKeepers?.length !== undefined && goalKeepers?.length > 0
                ? goalKeepers.map((player, ti: number) => (
                    <Select.Option key={`player-${ti}`} value={player.id}>
                      {player.name}
                    </Select.Option>
                  ))
                : null}
            </Select>
          </Form.Item>
        )}
      </Form>

      {user && isEditMode ? (
        <Button
          color="primary"
          fill="none"
          block
          type="submit"
          size="large"
          shape="rounded"
          onClick={removePlayer}
        >
          Remove
        </Button>
      ) : null}
    </div>
  )
}

export default NewStat
