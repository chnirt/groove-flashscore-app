import { FC, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import { GoHomeFill, GoHubot, GoLaw, GoTrophy } from 'react-icons/go'
import { routes } from '../../routes'
import useAuth from '../../hooks/useAuth'

const BottomTabBar: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { pathname } = location

  const setRouteActive = useCallback(
    (value: string) => {
      navigate(value)
    },
    [navigate]
  )

  const tabs = useMemo(
    () => [
      {
        key: routes.dashboard,
        icon: <GoHomeFill className="h-7 w-7" />,
      },
      {
        key: routes.laws,
        icon: <GoLaw />,
      },
      {
        key: routes.ranking,
        icon: <GoTrophy />,
      },
      ...(user
        ? [
            {
              key: routes.me,
              icon: <GoHubot />,
            },
          ]
        : []),
    ],
    [user]
  )
  return (
    <TabBar
      className="bg-white pb-safe"
      activeKey={pathname}
      onChange={(value) => {
        setRouteActive(value)
      }}
    >
      {tabs.map((item) => (
        <TabBar.Item className="py-5" key={item.key} icon={item.icon} />
      ))}
    </TabBar>
  )
}

export default BottomTabBar
