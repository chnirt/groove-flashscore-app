import {
  Button,
  DatePicker,
  DatePickerRef,
  Form,
  Input,
  NavBar,
  Picker,
  PickerRef,
  Switch,
  Toast,
} from 'antd-mobile'
import { Link, generatePath, useNavigate, useParams } from 'react-router-dom'
import { GoArrowLeft } from 'react-icons/go'
import dayjs from 'dayjs'
import { Select } from 'antd'
import { RefObject, useCallback, useEffect, useMemo, useState } from 'react'
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
import moment from 'moment'

const initialValues = MASTER_MOCK_DATA.NEW_MATCH

const NewMatch = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { matchId } = useParams()
  const isEditMode = matchId
  const { user } = useAuth()
  const { matches, teams, refetchMatch } = useFlashScore()
  const myMatch = useMemo(
    () => matches?.find((match) => match.id === matchId),
    [matches, matchId]
  )

  // const fetchMatchById = useCallback(
  //   async (matchId: string) => {
  //     if (matchId === undefined) return
  //     const matchDocRef = getDocRef('matches', matchId)
  //     if (matchDocRef === null) return

  //     const matchDocData: any = await getDocument(matchDocRef)
  //     const hours = moment(matchDocData.playDate.toDate()).hours()
  //     const minutes = moment(matchDocData.playDate.toDate()).minutes()
  //     form.setFieldsValue({
  //       ...matchDocData,
  //       playDate: matchDocData.playDate.toDate(),
  //       time: [hours, minutes],
  //     })
  //   },
  //   [form]
  // )

  // useEffect(() => {
  //   const handleFetchMatch = async () => {
  //     try {
  //       if (matchId === undefined) return
  //       if (typeof fetchMatchById !== 'function') return
  //       await Promise.all([fetchMatchById(matchId)])
  //     } catch (e) {
  //       navigate(routes.error)
  //     }
  //   }

  //   handleFetchMatch()
  // }, [matchId, fetchMatchById, navigate])

  useEffect(() => {
    if (!myMatch) return
    const hours = moment(myMatch.playDate.toDate()).hours()
    const minutes = moment(myMatch.playDate.toDate()).minutes()
    form.setFieldsValue({
      ...myMatch,
      playDate: myMatch.playDate.toDate(),
      time: [hours, minutes],
    });
  }, [myMatch, form]);

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (!user) return

      try {
        Loading.get.show()
        const {
          groupStage,
          homeTeamId,
          awayTeamId,
          playDate,
          time,
          hidden,
        }: any = values
        if (playDate === null) return
        if (time.length > 0) {
          playDate.setHours(time[0])
          playDate.setMinutes(time[1])
        }
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
          if (!matchId) return
          const matchDocRef = getDocRef('matches', matchId);

          if (matchDocRef === null) return
          await updateDocument(matchDocRef, matchData)
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
      } catch (error: any) {
        Toast.show({
          icon: 'error',
          content: error.message,
        })
      } finally {
        Loading.get.hide()
      }
    },
    [user, navigate, refetchMatch, isEditMode, matchId]
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
              value ? dayjs(value).format('YYYY-MM-DD') : 'Select a date'
            }
          </DatePicker>
        </Form.Item>

        <Form.Item
          name="time"
          label="Time"
          rules={[
            {
              required: true,
              message: 'Time is required',
            },
          ]}
          trigger="onConfirm"
          onClick={(_, pickerRef: RefObject<PickerRef>) => {
            pickerRef.current?.open()
          }}
        >
          <Picker
            columns={[
              Array(24)
                .fill(null)
                .map((_, hour) => ({
                  label: hour < 9 ? `0${hour}` : hour,
                  value: hour,
                })),
              Array(60)
                .fill(null)
                .map((_, hour) => ({
                  label: hour < 9 ? `0${hour}` : hour,
                  value: hour,
                })),
            ]}
          >
            {(value) =>
              value
                ? value.map((value) => value?.label).join(':')
                : 'Select a time'
            }
          </Picker>
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
