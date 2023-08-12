import { Form, Input, Button, Toast } from "antd-mobile";
import { Fragment } from "react";
import { Link } from "react-router-dom";
// import useAuth from "../../hooks/useAuth";
import { routes } from "../../routes";
import { signInWithEmailAndPasswordFirebase } from "../../firebase/service";
import { MASTER_MOCK_DATA } from "../../mocks";
import { Loading } from "../../global";
import PasswordInput from "../../components/PasswordInput";
import { logAnalyticsEvent } from "../../firebase/analytics";
import { IS_DEVELOP, eventNames } from "../../constants";

const initialValues = MASTER_MOCK_DATA.LOGIN;

const Login = () => {
  // const { login } = useAuth();

  const onFinish = async (values: typeof initialValues) => {
    try {
      Loading.get.show();
      const { email, password } = values;
      await signInWithEmailAndPasswordFirebase(email, password);

      if (IS_DEVELOP) return;
      logAnalyticsEvent(eventNames.LOGIN, { email });
    } catch (error: any) {
      // console.log(error.message)
      Toast.show({
        icon: "error",
        content: error.message,
      });
      Loading.get.hide();
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
  };

  return (
    <Fragment>
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
            Login
          </Button>
        }
      >
        <Form.Header>Login</Form.Header>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Invalid email" },
          ]}
        >
          <Input type="email" autoComplete="email" placeholder="chnirt" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Password is required" },
            {
              min: 4,
              message: "Password should be at least 4 characters",
            },
            {
              max: 20,
              message: "Password must have at 20 characters",
            },
          ]}
        >
          <PasswordInput autoComplete="current-password" placeholder="******" />
        </Form.Item>
      </Form>
      <Link to={routes.register}>
        <Button color="primary" fill="none">
          CREATE ACCOUNT
        </Button>
      </Link>
    </Fragment>
  );
};

export default Login;
