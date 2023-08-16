import { Outlet } from 'react-router-dom'
import BottomTabBar from '../../components/BottomTabBar'

const App = () => {
  return (
    <div className="flex min-h-screen flex-col bg-bgPrimary">
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <div className="sticky bottom-0">
        <BottomTabBar />
      </div>
    </div>
  )
}

export default App
