import { Outlet } from 'react-router-dom'
import BottomTabBar from '../../components/BottomTabBar'

const App = () => {
  return (
    <div className="m-auto flex min-h-screen max-w-md flex-col bg-bgPrimary">
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
