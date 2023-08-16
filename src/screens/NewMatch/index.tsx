import {
  Button,
  DatePicker,
  DatePickerRef,
  Form,
  Input,
  NavBar,
  Switch,
  Toast,
} from 'antd-mobile'
import { Link, generatePath, useNavigate, useParams } from 'react-router-dom'
import { GoArrowLeft } from 'react-icons/go'
import dayjs from 'dayjs'
import { Select } from 'antd'
import { RefObject, useCallback, useEffect, useState } from 'react'
import { DocumentData, DocumentReference, Timestamp } from 'firebase/firestore'
import useAuth from '../../hooks/useAuth'
import useFlashScore from '../../context/FlashScore/useFlashScore'
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
import Stats from './components/Stats'

const initialValues = MASTER_MOCK_DATA.NEW_MATCH

const NewMatch = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { matchId } = useParams()
  const isEditMode = matchId
  const { user } = useAuth()
  const { teams, fetchTeam, fetchMatch, refetchMatch } = useFlashScore()
  const [matchDocRefState, setMatchDocRefState] = useState<DocumentReference<
    DocumentData,
    DocumentData
  > | null>(null)

  const fetchMatchById = useCallback(
    async (matchId: string) => {
      if (matchId === undefined) return
      const matchDocRef = getDocRef('matches', matchId)
      setMatchDocRefState(matchDocRef)
      const matchDocData: any = await getDocument(matchDocRef)
      form.setFieldsValue({
        ...matchDocData,
        playDate: matchDocData.playDate.toDate(),
      })
    },
    [form]
  )

  useEffect(() => {
    const handleFetchMatch = async () => {
      try {
        if (matchId === undefined) return
        if (typeof fetchTeam !== 'function') return
        if (typeof fetchMatch !== 'function') return
        if (typeof fetchMatchById !== 'function') return
        await Promise.all([fetchTeam(), fetchMatch(), fetchMatchById(matchId)])
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchMatch()
  }, [matchId, fetchTeam, fetchMatch, fetchMatchById, navigate])

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (user === null) return
      try {
        Loading.get.show()
        const { groupStage, homeTeamId, awayTeamId, playDate, hidden } = values
        if (playDate === null) return
        const uid = user.uid
        const matchData = {
          groupStage,
          homeTeamId,
          awayTeamId,
          playDate: Timestamp.fromDate(playDate),
          hidden,
          uid,
        }

        if (isEditMode) {
          if (matchDocRefState === null) return
          await updateDocument(matchDocRefState, matchData)
        } else {
          const matchDocRef = getColRef('matches')
          await addDocument(matchDocRef, matchData)
        }

        if (typeof refetchMatch === 'function') {
          await refetchMatch()
        }

        navigate(-1)
        Toast.show({
          icon: 'success',
          content: isEditMode ? 'Saved' : 'Added',
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
    [user, navigate, refetchMatch, isEditMode, matchDocRefState]
  )

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
        right={
          user && isEditMode ? (
            <Link
              to={generatePath(routes.newStat, {
                matchId,
              })}
            >
              <button className="bg-transparent text-base font-medium text-secondary">
                New stat
              </button>
            </Link>
          ) : null
        }
      >
        {isEditMode ? 'Edit Match' : 'New Match'}
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
        <Form.Header>{isEditMode ? 'Edit Match' : 'New Match'}</Form.Header>
        <Form.Item
          name="groupStage"
          label="Group Stage"
          rules={[
            {
              required: true,
              message: 'Group Stage is required',
            },
          ]}
          shouldUpdate
        >
          <Input autoComplete="none" placeholder="Round of 3" />
        </Form.Item>
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
              ? teams.map((team, ti: number) => (
                  <Select.Option key={`home-team-${ti}`} value={team.id}>
                    {team.name}
                  </Select.Option>
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
              ? teams.map((team, ti) => (
                  <Select.Option key={`away-team-${ti}`} value={team.id}>
                    {team.name}
                  </Select.Option>
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

        <Form.Item
          name="hidden"
          label="Hidden"
          childElementPosition="right"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>

      {user && matchId ? <Stats header="Stats" matchId={matchId} /> : null}
    </div>
  )
}

export default NewMatch
