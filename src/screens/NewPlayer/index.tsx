import { Button, Form, Input, NavBar, Toast } from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { GoArrowLeft } from 'react-icons/go'
import { useCallback } from 'react'
import { Timestamp } from 'firebase/firestore'
import useAuth from '../../hooks/useAuth'
import { MASTER_MOCK_DATA } from '../../mocks'
import { addDocument, getColRef } from '../../firebase/service'
import { Loading } from '../../global'

const initialValues = MASTER_MOCK_DATA.NEW_PLAYER

const NewMatch = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { teamId } = useParams()
  const { user } = useAuth()

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

        // if (isEditMode) {
        //   if (categoryDocRefState === null) return
        //   await updateDocument(categoryDocRefState, categoryData)
        // } else {
        const playerDocRef = getColRef('players')
        await addDocument(playerDocRef, playerData)
        // }

        // if (typeof refetchMatch === 'function') {
        //   await refetchMatch()
        // }

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
    [user, teamId, navigate]
  )

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
              pattern: /[0-9]{2}/,
              message: 'Jersey Number must be number',
            },
          ]}
          shouldUpdate
        >
          <Input autoComplete="none" placeholder="94" />
        </Form.Item>
      </Form>
    </div>
  )
}

export default NewMatch
