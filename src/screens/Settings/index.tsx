import { Button, Form, Input, NavBar, Switch, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { MASTER_MOCK_DATA } from '../../mocks'
import { Loading } from '../../global'
import { useCallback, useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import { addDocument, getDocRef } from '../../firebase/service'
import { routes } from '../../routes'
import useFlashScore from '../../context/FlashScore/useFlashScore'

const initialValues = MASTER_MOCK_DATA.SETTINGS

const Settings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { settings } = useFlashScore()
  const [form] = Form.useForm()

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (user === null) return
      try {
        Loading.get.show()

        const { champion, visible } = values
        const uid = user.uid
        const settingsData = {
          champion,
          visible,
          uid,
        }

        const settingDocRef = getDocRef('settings', 'champion')
        await addDocument(settingDocRef, settingsData)

        navigate(-1)
        Toast.show({
          icon: 'success',
          content: 'Saved',
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
    [user, navigate]
  )

  const fetchSettings = useCallback(async () => {
    if (settings === undefined) return
    const systemDocData = await settings.find(
      (setting: any) => setting.id === 'champion'
    )
    form.setFieldsValue({
      ...systemDocData,
    })
  }, [form, settings])

  useEffect(() => {
    if (typeof fetchSettings !== 'function') return
    const handleFetchPlayer = async () => {
      try {
        await fetchSettings()
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchPlayer()
  }, [fetchSettings, navigate])

  return (
    <div>
      <NavBar
        className="sticky top-0 z-[100] bg-white"
        onBack={() => navigate(-1)}
      >
        Settings
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
            // disabled={
            //   !form.isFieldsTouched(true) ||
            //   form.getFieldsError().filter(({ errors }) => errors.length)
            //     .length > 0
            // }
          >
            SAVE
          </Button>
        }
      >
        <Form.Header>Settings</Form.Header>
        <Form.Item
          name="champion"
          label="Champion"
          rules={[{ required: true, message: 'Champion is required' }]}
        >
          <Input placeholder="https://example.com" />
          {/* <ImageUploader
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
                return Promise.reject(new Error('Image must smaller than 2MB!'))
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
            maxCount={1}
          /> */}
        </Form.Item>

        <Form.Item
          name="visible"
          label="Visible"
          childElementPosition="right"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* <Form.Item shouldUpdate className="submit" noStyle>
          {() => (
            <Button
              block
              type="submit"
              color="primary"
              size="large"
              shape="rounded"
              // disabled={
              //   !form.isFieldsTouched(true) ||
              //   form.getFieldsError().filter(({ errors }) => errors.length)
              //     .length > 0
              // }
              disabled={
                form.getFieldsError().filter(({ errors }) => errors.length)
                  .length > 0
              }
            >
              SAVE
            </Button>
          )}
        </Form.Item> */}
      </Form>
    </div>
  )
}

export default Settings
