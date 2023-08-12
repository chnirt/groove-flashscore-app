import {
  Button,
  Form,
  ImageUploadItem,
  ImageUploader,
  Input,
  NavBar,
  Radio,
  Space,
  Toast,
} from 'antd-mobile'
import { useCallback } from 'react'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MASTER_MOCK_DATA } from '../../mocks'
import { Loading } from '../../global'
import useAuth from '../../hooks/useAuth'
import { uploadStorageBytesResumable } from '../../firebase/storage'
import { addDocument, getColRef } from '../../firebase/service'
import useFlashScore from '../../context/FlashScore/useFlashScore'

const initialValues = MASTER_MOCK_DATA.NEW_TEAM

const maxCount = 1

const NewTeam = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { user } = useAuth()
  const { refetchTeam } = useFlashScore()
  const uploadMethod = Form.useWatch('uploadMethod', form)

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (user === null) return
      try {
        Loading.get.show()
        const { teamName, teamLogo } = values
        const uid = user.uid
        const teamData = {
          name: teamName,
          logo: teamLogo,
          uid,
        }

        // if (isEditMode) {
        //   if (categoryDocRefState === null) return
        //   await updateDocument(categoryDocRefState, categoryData)
        // } else {
        const teamDocRef = getColRef('teams')
        await addDocument(teamDocRef, teamData)
        // }

        if (typeof refetchTeam === 'function') {
          await refetchTeam()
        }

        navigate(-1)
        Toast.show({
          icon: 'success',
          content: 'Team is added',
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
    [user, navigate, refetchTeam]
  )

  return (
    <div>
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
          name="teamName"
          label="Team Name"
          rules={[
            {
              required: true,
              message: 'Team Name is required',
            },
          ]}
          shouldUpdate
        >
          <Input autoComplete="none" placeholder="Jupiter" />
        </Form.Item>
        <Form.Item name="uploadMethod" label="Upload Method">
          <Radio.Group
            onChange={(updateMethod) => {
              if (maxCount === 1) {
                if (updateMethod === 'file') {
                  const teamLogo = form.getFieldValue('teamLogo')
                  if (typeof teamLogo !== 'string') return
                  form.setFieldsValue({ teamLogo: [{ url: teamLogo }] })
                  return
                }
                if (updateMethod === 'link') {
                  const teamLogo = form
                    .getFieldValue('teamLogo')
                    .filter((teamFile: any) => Boolean(teamFile))
                  if (!Array.isArray(teamLogo)) return
                  form.setFieldsValue({ teamLogo: teamLogo[0].url })
                  return
                }
                return
              }

              const teamLogo = form
                .getFieldValue('teamLogo')
                .filter((teamFile: any) => Boolean(teamFile))
              form.setFieldsValue({ teamLogo })
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
            name="teamLogo"
            label="Team Logo"
            rules={[{ required: true, message: 'Dish Files is required' }]}
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
              name="teamLogo"
              label="Team Logo"
              rules={[
                {
                  required: true,
                  message: 'Team Logo is required',
                },
              ]}
              shouldUpdate
            >
              <Input autoComplete="none" placeholder="https://example.com" />
            </Form.Item>
          ) : (
            <Form.Array
              name="teamLogo"
              renderAdd={() => (
                <Button color="primary" fill="none">
                  <PlusCircle /> Add
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
                    Delete
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
    </div>
  )
}

export default NewTeam
