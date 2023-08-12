import { FC, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User2 } from 'lucide-react'
import { CompassOutline } from 'antd-mobile-icons'
import { TabBar } from 'antd-mobile'
import { routes } from '../../routes'

const BottomTabBar: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
        title: 'Dashboard',
        icon: <CompassOutline />,
      },
      {
        key: routes.me,
        title: 'Profile',
        icon: <User2 />,
      },
    ],
    []
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
        <TabBar.Item
          className="pt-5"
          key={item.key}
          icon={item.icon}
          title={item.title}
        />
      ))}
    </TabBar>
  )
}

export default BottomTabBar
