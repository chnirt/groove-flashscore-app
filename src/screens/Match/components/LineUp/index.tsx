import {
  Button,
  Form,
  ImageUploadItem,
  ImageUploader,
  Input,
  Radio,
  Space,
  Toast,
  Image,
} from 'antd-mobile'
import { useCallback, useEffect } from 'react'
import { DocumentData, DocumentReference } from 'firebase/firestore'
import { GoPlusCircle } from 'react-icons/go'
import { MASTER_MOCK_DATA } from '../../../../mocks'
import { Loading } from '../../../../global'
import useAuth from '../../../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { uploadStorageBytesResumable } from '../../../../firebase/storage'
import { getDocument, updateDocument } from '../../../../firebase/service'
import { routes } from '../../../../routes'

const initialValues = MASTER_MOCK_DATA.NEW_LINEUP

const maxCount = 1

const LineUp = ({
  matchDocRefState,
  match,
}: {
  matchDocRefState: DocumentReference<DocumentData, DocumentData> | null
  match: any
}) => {
  const [form] = Form.useForm()
  const uploadMethod = Form.useWatch('uploadMethod', form)
  const navigate = useNavigate()
  const { user } = useAuth()

  const onFinish = useCallback(
    async (values: typeof initialValues) => {
      if (user === null) return
      if (matchDocRefState === null) return
      try {
        Loading.get.show()
        const { lineUpFile } = values
        const file = Array.isArray(lineUpFile)
          ? lineUpFile
          : [{ url: lineUpFile }]
        const lineUpData = {
          file,
        }

        await updateDocument(matchDocRefState, lineUpData)

        Toast.show({
          icon: 'success',
          content: 'LineUp is edited',
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
    [user, navigate, matchDocRefState]
  )

  const fetchLineUpById = useCallback(
    async (matchDocRefState: any) => {
      const lineUpDocData: any = await getDocument(matchDocRefState)
      form.setFieldsValue({
        ...lineUpDocData,
        lineUpFile: lineUpDocData.file,
      })
    },
    [form]
  )

  useEffect(() => {
    if (typeof fetchLineUpById !== 'function') return
    const handleFetchTeam = async () => {
      try {
        await fetchLineUpById(matchDocRefState)
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchTeam()
  }, [matchDocRefState, fetchLineUpById, navigate])

  if (user)
    return (
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
            Save
          </Button>
        }
      >
        <Form.Header>LineUp</Form.Header>
        <Form.Item name="uploadMethod" label="Upload Method">
          <Radio.Group
            onChange={(updateMethod) => {
              if (maxCount === 1) {
                if (updateMethod === 'file') {
                  const lineUpFile = form.getFieldValue('lineUpFile')
                  if (typeof lineUpFile !== 'string') return
                  form.setFieldsValue({ lineUpFile: [{ url: lineUpFile }] })
                  return
                }
                if (updateMethod === 'link') {
                  const lineUpFile = form
                    .getFieldValue('lineUpFile')
                    .filter((file: any) => Boolean(file))
                  if (!Array.isArray(lineUpFile)) return
                  form.setFieldsValue({ lineUpFile: lineUpFile[0].url })
                  return
                }
                return
              }

              const lineUpFile = form
                .getFieldValue('lineUpFile')
                .filter((file: any) => Boolean(file))
              form.setFieldsValue({ lineUpFile })
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
            name="lineUpFile"
            label="LineUp File"
            rules={[{ required: true, message: 'LineUp File is required' }]}
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
              name="lineUpFile"
              label="LineUp File"
              rules={[
                {
                  required: true,
                  message: 'LineUp File is required',
                },
              ]}
              shouldUpdate
            >
              <Input autoComplete="none" placeholder="https://example.com" />
            </Form.Item>
          ) : (
            <Form.Array
              name="lineUpFile"
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
    )

  return (
    <Image className="rounded-2xl" src={match?.file[0]?.url} fit="contain" />
  )
}

export default LineUp
