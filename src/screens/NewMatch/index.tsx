import {
  Button,
  DatePicker,
  DatePickerRef,
  Form,
  NavBar,
  Toast,
} from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { GoArrowLeft } from 'react-icons/go'
import dayjs from 'dayjs'
import { Select } from 'antd'
import { RefObject, useCallback } from 'react'
import { Timestamp } from 'firebase/firestore'
import useAuth from '../../hooks/useAuth'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { MASTER_MOCK_DATA } from '../../mocks'
import { addDocument, getColRef } from '../../firebase/service'
import { Loading } from '../../global'

const initialValues = MASTER_MOCK_DATA.NEW_MATCH

const NewMatch = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { user } = useAuth()
  const { teams, refetchMatch } = useFlashScore()

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (user === null) return
      try {
        Loading.get.show()
        const { homeTeamId, awayTeamId, playDate } = values
        if (playDate === null) return
        const uid = user.uid
        const matchData = {
          homeTeamId,
          awayTeamId,
          playDate: Timestamp.fromDate(playDate),
          uid,
        }

        // if (isEditMode) {
        //   if (categoryDocRefState === null) return
        //   await updateDocument(categoryDocRefState, categoryData)
        // } else {
        const matchDocRef = getColRef('matches')
        await addDocument(matchDocRef, matchData)
        // }

        if (typeof refetchMatch === 'function') {
          await refetchMatch()
        }

        navigate(-1)
        Toast.show({
          icon: 'success',
          content: 'Match is added',
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
    [user, navigate, refetchMatch]
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
        New Match
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
          name="homeTeamId"
          label="Home Team"
          rules={[
            {
              required: true,
              message: 'Home Team is required',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('awayTeamId') !== value) {
                  return Promise.resolve()
                }
                return Promise.reject('2 teams must be different')
              },
            }),
          ]}
          dependencies={['awayTeamId', 'homeTeamId']}
        >
          <Select className="w-full" disabled={teams?.length === 0}>
            {teams?.length !== undefined && teams?.length > 0
              ? teams.map((team) => (
                  <Select.Option value={team.id}>{team.name}</Select.Option>
                ))
              : null}
          </Select>
        </Form.Item>
        <Form.Item
          name="awayTeamId"
          label="Away Team"
          rules={[
            {
              required: true,
              message: 'Away Team is required',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('homeTeamId') !== value) {
                  return Promise.resolve()
                }
                return Promise.reject('2 teams must be different')
              },
            }),
          ]}
          dependencies={['awayTeamId', 'homeTeamId']}
        >
          <Select className="w-full" disabled={teams?.length === 0}>
            {teams?.length !== undefined && teams?.length > 0
              ? teams.map((team) => (
                  <Select.Option value={team.id}>{team.name}</Select.Option>
                ))
              : null}
          </Select>
        </Form.Item>
        <Form.Item
          name="playDate"
          label="Play Date"
          rules={[
            {
              required: true,
              message: 'Play Date is required',
            },
          ]}
          trigger="onConfirm"
          onClick={(_, datePickerRef: RefObject<DatePickerRef>) => {
            datePickerRef.current?.open()
          }}
        >
          <DatePicker>
            {(value) =>
              value ? dayjs(value).format('YYYY-MM-DD') : 'Select a time'
            }
          </DatePicker>
        </Form.Item>
      </Form>
    </div>
  )
}

export default NewMatch
