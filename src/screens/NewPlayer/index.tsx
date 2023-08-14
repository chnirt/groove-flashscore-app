import { Button, Form, Input, NavBar, Toast } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { GoArrowLeft } from 'react-icons/go'
import { useCallback, useEffect, useState } from 'react'
import { DocumentData, DocumentReference, deleteDoc } from 'firebase/firestore'
import useAuth from '../../hooks/useAuth'
import { MASTER_MOCK_DATA } from '../../mocks'
import {
  addDocument,
  getColRef,
  getDocRef,
  getDocument,
  updateDocument,
} from '../../firebase/service'
import { Loading } from '../../global'
import { routes } from '../../routes'

const initialValues = MASTER_MOCK_DATA.NEW_PLAYER

const NewMatch = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { teamId, playerId } = useParams()
  const isEditMode = playerId
  const { user } = useAuth()
  const [playerDocRefState, setPlayerDocRefState] = useState<DocumentReference<
    DocumentData,
    DocumentData
  > | null>(null)

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (user === null) return
      if (teamId === undefined) return
      try {
        Loading.get.show()
        const { playerName, jerseyNumber } = values
        console.log(values)
        const uid = user.uid
        const playerData = {
          name: playerName,
          jerseyNumber,
          teamId,
          uid,
        }

        if (isEditMode) {
          if (playerDocRefState === null) return
          await updateDocument(playerDocRefState, playerData)
        } else {
          const playerDocRef = getColRef('players')
          await addDocument(playerDocRef, playerData)
        }

        navigate(-1)
        Toast.show({
          icon: 'success',
          content: 'Player is added',
        })

        return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        Toast.show({
          icon: 'error',
          content: error.message,
        })
      } finally {
        Loading.get.hide()
      }
    },
    [user, teamId, navigate, isEditMode, playerDocRefState]
  )

  const fetchPlayerById = useCallback(
    async (playerId: string) => {
      const playerDocRef = getDocRef('players', playerId)
      setPlayerDocRefState(playerDocRef)
      const playerDocData: any = await getDocument(playerDocRef)
      form.setFieldsValue({
        ...playerDocData,
        playerName: playerDocData.name,
      })
    },
    [form]
  )

  const removePlayer = useCallback(async () => {
    if (playerDocRefState === null) return
    await deleteDoc(playerDocRefState)
    navigate(-1)
    Toast.show({
      icon: 'success',
      content: 'Player is deleted',
    })
  }, [playerDocRefState, navigate])

  useEffect(() => {
    if (playerId === undefined || typeof fetchPlayerById !== 'function') return
    const handleFetchTeam = async () => {
      try {
        await fetchPlayerById(playerId)
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchTeam()
  }, [playerId, fetchPlayerById, navigate])

  return (
    <div>
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
      >
        New Player
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
            Add
          </Button>
        }
      >
        <Form.Header>New Team</Form.Header>
        <Form.Item
          name="playerName"
          label="Player Name"
          rules={[
            {
              required: true,
              message: 'Player Name is required',
            },
          ]}
          shouldUpdate
        >
          <Input autoComplete="none" placeholder="Trinh Chin Chin" />
        </Form.Item>
        <Form.Item
          name="jerseyNumber"
          label="Jersey Number"
          rules={[
            {
              required: true,
              message: 'Jersey Number is required',
            },
            {
              pattern: /[0-9]/,
              message: 'Jersey Number must be number',
            },
            {
              len: 2,
              message: 'Jersey Number should be at least 4 characters',
            },
          ]}
          shouldUpdate
        >
          <Input autoComplete="none" placeholder="94" />
        </Form.Item>
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

export default NewMatch
