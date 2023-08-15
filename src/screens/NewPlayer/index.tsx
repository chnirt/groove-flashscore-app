import {
  Button,
  Dialog,
  Form,
  ImageUploadItem,
  ImageUploader,
  Input,
  NavBar,
  Radio,
  Space,
  Switch,
  Toast,
} from 'antd-mobile'
import { useNavigate, useParams } from 'react-router-dom'
import { GoArrowLeft, GoPlusCircle } from 'react-icons/go'
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
import { uploadStorageBytesResumable } from '../../firebase/storage'

const initialValues = MASTER_MOCK_DATA.NEW_PLAYER

const maxCount = 1

const NewMatch = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const uploadMethod = Form.useWatch('uploadMethod', form)
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
        const { playerName, jerseyNumber, goalkeeper, playerAvatar } = values
        const uid = user.uid
        const avatar = Array.isArray(playerAvatar)
          ? playerAvatar
          : [{ url: playerAvatar }]
        const playerData = {
          name: playerName,
          jerseyNumber,
          goalkeeper,
          avatar,
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
        playerAvatar: playerDocData.avatar,
      })
    },
    [form]
  )

  const removePlayer = useCallback(async () => {
    await Dialog.confirm({
      content: 'Are you sure want to delete?',
      cancelText: 'Cancel',
      confirmText: 'Delete',
      onConfirm: async () => {
        if (playerDocRefState === null) return
        await deleteDoc(playerDocRefState)
        navigate(-1)
        Toast.show({
          icon: 'success',
          content: 'Deleted',
        })
      },
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
        className="sticky top-0 bg-bgPrimary"
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
            {isEditMode ? 'Save' : 'Add'}
          </Button>
        }
      >
        <Form.Header>New Team</Form.Header>
        <Form.Item
          name="playerName"
          label="Player Name"
          rules={[
            {
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
        <Form.Item
          name="goalkeeper"
          label="Goalkeeper"
          childElementPosition="right"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item name="uploadMethod" label="Upload Method">
          <Radio.Group
            onChange={(updateMethod) => {
              if (maxCount === 1) {
                if (updateMethod === 'file') {
                  const file = form.getFieldValue('playerAvatar')
                  if (typeof file !== 'string') return
                  form.setFieldsValue({ playerAvatar: [{ url: file }] })
                  return
                }
                if (updateMethod === 'link') {
                  const file = form
                    .getFieldValue('playerAvatar')
                    .filter((teamFile: any) => Boolean(teamFile))
                  if (!Array.isArray(file)) return
                  form.setFieldsValue({ playerAvatar: file[0].url })
                  return
                }
                return
              }

              const file = form
                .getFieldValue('playerAvatar')
                .filter((teamFile: any) => Boolean(teamFile))
              form.setFieldsValue({ playerAvatar: file })
            }}
          >
            <Space>
              <Radio value="file">File</Radio>
              <Radio value="link">Link</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        {uploadMethod === 'file' && (
          <Form.Item
            name="playerAvatar"
            label="Player Avatar"
            rules={[{ required: true, message: 'Player Avatar is required' }]}
          >
            <ImageUploader
              upload={function (file: File): Promise<ImageUploadItem> {
                const isJpgOrPng =
                  file.type === 'image/jpeg' || file.type === 'image/png'
                if (!isJpgOrPng) {
                  Toast.show({
                    icon: 'error',
                    content: 'You can only upload JPG/PNG file!',
                  })
                  return Promise.reject(
                    new Error('You can only upload JPG/PNG file!')
                  )
                }
                const isLt2M = file.size / 1024 / 1024 < 2
                if (!isLt2M) {
                  Toast.show({
                    icon: 'error',
                    content: 'Image must smaller than 2MB!',
                  })
                  return Promise.reject(
                    new Error('Image must smaller than 2MB!')
                  )
                }

                return new Promise((resolve, reject) => {
                  uploadStorageBytesResumable(
                    file,
                    undefined,
                    (error) => reject(error),
                    async ({ downloadURL }) =>
                      resolve({
                        url: downloadURL,
                      })
                  )
                })
              }}
              multiple
              maxCount={maxCount}
            />
          </Form.Item>
        )}
        {uploadMethod === 'link' ? (
          maxCount === 1 ? (
            <Form.Item
              name="playerAvatar"
              label="Player Avatar"
              rules={[
                {
                  required: true,
                  message: 'Player Avatar is required',
                },
              ]}
              shouldUpdate
            >
              <Input autoComplete="none" placeholder="https://example.com" />
            </Form.Item>
          ) : (
            <Form.Array
              name="playerAvatar"
              renderAdd={() => (
                <Button color="primary" fill="none">
                  <GoPlusCircle /> Add
                </Button>
              )}
              renderHeader={({ index }, { remove }) => (
                <div className="flex items-center justify-between">
                  <span>Link {index + 1}</span>
                  <Button
                    onClick={() => remove(index)}
                    style={{ float: 'right' }}
                    color="primary"
                    fill="none"
                  >
                    Remove
                  </Button>
                </div>
              )}
            >
              {(fields) =>
                fields.map(({ index }) => (
                  <>
                    <Form.Item
                      name={[index, 'url']}
                      label="Link"
                      rules={[{ required: true, message: 'Link is required' }]}
                    >
                      <Input placeholder="https://example.com" />
                    </Form.Item>
                  </>
                ))
              }
            </Form.Array>
          )
        ) : null}
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
