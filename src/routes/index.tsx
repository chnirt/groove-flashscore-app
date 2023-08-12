import { createBrowserRouter } from 'react-router-dom'
import { Loadable, PrivateRoute, PublicRoute } from './utils'
import Home from '../screens/Home'
import App from '../screens/App'
import Error from '../screens/Error'

export const routes = {
  login: '/login',
  register: '/register',
  app: '/',

  dashboard: '/',
  newTeam: '/newTeam',
  newMatch: '/newMatch',
  match: '/match/:matchId',
  me: '/me',

  error: '/error',
}

export const router = createBrowserRouter([
  {
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          {
            path: routes.app,
            element: <App />,
            children: [
              {
                path: routes.dashboard,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/Dashboard'),
                    }}
                  />
                ),
              },
              {
                path: routes.newTeam,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewTeam'),
                    }}
                  />
                ),
              },
              {
                path: routes.newMatch,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewMatch'),
                    }}
                  />
                ),
              },
              {
                path: routes.match,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/Match'),
                    }}
                  />
                ),
              },
              {
                path: routes.me,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/Profile'),
                    }}
                  />
                ),
              },
            ],
          },
        ],
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: routes.login,
            element: (
              <Loadable
                {...{
                  factory: () => import('../screens/Login'),
                }}
              />
            ),
          },
          // {
          //   path: routes.register,
          //   element: (
          //     <Loadable
          //       {...{
          //         factory: () => import('../screens/Register'),
          //       }}
          //     />
          //   ),
          // },
        ],
      },
      {
        path: routes.error,
        element: (
          <Loadable
            {...{
              factory: () => import('../screens/Error'),
            }}
          />
        ),
      },
    ],
  },
])
