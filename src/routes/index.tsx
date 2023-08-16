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
  players: '/players',
  newTeam: '/newTeam',
  editTeam: '/teams/:teamId',
  newPlayer: '/teams/:teamId/newPlayer',
  editPlayer: '/teams/:teamId/players/:playerId',
  newMatch: '/newMatch',
  match: '/matches/:matchId',
  editMatch: '/matches/:matchId/edit',
  newStat: '/matches/:matchId/newStat',
  editStat: '/matches/:matchId/newStat/:statId',
  rules: '/rules',
  ranking: '/ranking',

  me: '/me',

  error: '/error',
}

export const router = createBrowserRouter([
  {
    element: <Home />,
    errorElement: <Error />,
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
            path: routes.players,
            element: (
              <Loadable
                {...{
                  factory: () => import('../screens/Players'),
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
            path: routes.rules,
            element: (
              <Loadable
                {...{
                  factory: () => import('../screens/Rules'),
                }}
              />
            ),
          },
          {
            path: routes.ranking,
            element: (
              <Loadable
                {...{
                  factory: () => import('../screens/Ranking'),
                }}
              />
            ),
          },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: routes.app,
            element: <App />,
            children: [
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
                path: routes.editTeam,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewTeam'),
                    }}
                  />
                ),
              },
              {
                path: routes.newPlayer,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewPlayer'),
                    }}
                  />
                ),
              },
              {
                path: routes.editPlayer,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewPlayer'),
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
                path: routes.editMatch,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewMatch'),
                    }}
                  />
                ),
              },
              {
                path: routes.newStat,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewStat'),
                    }}
                  />
                ),
              },
              {
                path: routes.editStat,
                element: (
                  <Loadable
                    {...{
                      factory: () => import('../screens/NewStat'),
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
          {
            path: routes.register,
            element: (
              <Loadable
                {...{
                  factory: () => import('../screens/Register'),
                }}
              />
            ),
          },
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
