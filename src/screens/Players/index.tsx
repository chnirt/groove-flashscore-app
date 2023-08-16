import { NavBar } from 'antd-mobile'
import Players from '../NewTeam/components/Players'

const PlayersScreen = () => {
  return (
    <div>
      <NavBar className="sticky top-0 z-10 bg-bgPrimary" backArrow={false}>
        Players
      </NavBar>

      <Players />
    </div>
  )
}

export default PlayersScreen
