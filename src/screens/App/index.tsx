import { Outlet, useNavigate } from 'react-router-dom'
import BottomTabBar from '../../components/BottomTabBar'
import { useRef } from 'react'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { useEffectOnce } from 'react-use'
import { routes } from '../../routes'

const App = () => {
  const isFetched = useRef(false)
  const {
    fetchTeam,
    fetchMatch,
    fetchPlayer,
    fetchStat,
    // fetchCache
  } = useFlashScore()
  const navigate = useNavigate()

  useEffectOnce(() => {
    if (typeof fetchTeam !== 'function') return
    if (typeof fetchMatch !== 'function') return
    if (typeof fetchPlayer !== 'function') return
    if (typeof fetchStat !== 'function') return
    // if (typeof fetchCache !== 'function') return

    if (isFetched.current) {
      return
    }

    isFetched.current = true

    const handleFetchAll = async () => {
      try {
        // localStorage.removeItem('teams')
        // localStorage.removeItem('matches')
        // localStorage.removeItem('matchs')
        // localStorage.removeItem('players')
        // localStorage.removeItem('stats')
        // const result: any = await fetchCache()
        await Promise.all([
          fetchTeam(),
          fetchMatch(),
          fetchPlayer(),
          fetchStat(),
        ])
        // await Promise.all([
        //   ...(result?.teams ? [fetchTeam()] : []),
        //   ...(result?.matches ? [fetchMatch()] : []),
        //   ...(result?.players ? [fetchPlayer()] : []),
        //   ...(result?.stats ? [fetchStat()] : []),
        // ])
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }
    handleFetchAll()
  })

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
