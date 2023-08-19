import { Form, Input, Button, Toast } from 'antd-mobile'
import { Link } from 'react-router-dom'
// import useAuth from "../../hooks/useAuth";
import { routes } from '../../routes'
import {
  addDocument,
  createUserWithEmailAndPasswordFirebase,
  fetchSignInMethodsForEmailFirebase,
  getDocRef,
} from '../../firebase/service'
import { MASTER_MOCK_DATA } from '../../mocks'
import { Loading } from '../../global'
import PasswordInput from '../../components/PasswordInput'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { IS_DEVELOP, eventNames } from '../../constants'

const initialValues = MASTER_MOCK_DATA.REGISTER

const Register = () => {
  // const { login } = useAuth();
  const onFinish = async (values: typeof initialValues) => {
    try {
      Loading.get.show()
      const { fullName, email, username, password } = values
      const providers = await fetchSignInMethodsForEmailFirebase(email)

      if (providers.length > 0) {
        throw Error('Email already exists!')
      }

      const userCredential = await createUserWithEmailAndPasswordFirebase(
        email,
        password
      )

      if (userCredential) {
        const uid = userCredential.user.uid
        const userDocRef = getDocRef('users', uid)
        const userData = {
          uid,
          fullName: String(fullName).trim(),
          email,
          username: String(username).trim(),
          // avatar: avatarPlaceholder,
          // keywords: generateKeywords(email),
        }
        await addDocument(userDocRef, userData)
      }

      if (IS_DEVELOP) return
      logAnalyticsEvent(eventNames.REGISTER, {
        email,
      })
    } catch (error: any) {
      Toast.show({
        icon: 'error',
        content: error.message,
      })
      Loading.get.hide()
    }
    // if (values.username === "chnirt" && values.password === "Admin@123") {
    //   const loginFromAPI = async () => {
    //     const data: { username: string } = await new Promise((resolve) =>
    //       setTimeout(() => resolve({ username: values.username }), 1000)
    //     );
    //     return data;
    //   };
    //   return login(loginFromAPI);
    // }
  }
  return (
    <div className="m-auto flex min-h-screen max-w-md flex-col bg-bgPrimary">
      <Form
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
            Register
          </Button>
        }
      >
        <Form.Header>Register</Form.Header>
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[
            { required: true, message: 'Full Name is required' },
            {
              min: 4,
              message: 'Full Name should be at least 4 characters',
            },
            {
              max: 20,
              message: 'Full Name must have at 20 characters',
            },
          ]}
        >
          <Input placeholder="chnirt" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email' },
          ]}
        >
          <Input type="email" placeholder="chnirt@gmail.com" />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Username is required' },
            {
              min: 4,
              message: 'Username should be at least 4 characters',
            },
            {
              max: 20,
              message: 'Username must have at 20 characters',
            },
          ]}
        >
          <Input placeholder="chnirt" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Password is required' },
            {
              min: 4,
              message: 'Password should be at least 4 characters',
            },
            {
              max: 20,
              message: 'Password must have at 20 characters',
            },
          ]}
        >
          <PasswordInput type="password" placeholder="******" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Confirm Password is required',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(
                  'The two passwords that you entered do not match!'
                )
              },
            }),
          ]}
        >
          <PasswordInput
            type="password"
            autoComplete="new-password"
            placeholder="******"
          />
        </Form.Item>
      </Form>
      <Link to={routes.login}>
        <Button color="primary" fill="none">
          LOGIN
        </Button>
      </Link>
    </div>
  )
}

export default Register
