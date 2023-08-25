import { Outlet, useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import BottomTabBar from '../../components/BottomTabBar'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { routes } from '../../routes'
import { Loading } from '../../global'

const App = () => {
  const isFetched = useRef(false)
  const {
    fetchTeam,
    fetchMatch,
    fetchPlayer,
    fetchStat,
    fetchCache,
    fetchSettings,
  } = useFlashScore()
  const navigate = useNavigate()

  useEffectOnce(() => {
    if (typeof fetchCache !== 'function') return
    if (typeof fetchTeam !== 'function') return
    if (typeof fetchMatch !== 'function') return
    if (typeof fetchPlayer !== 'function') return
    if (typeof fetchStat !== 'function') return
    if (typeof fetchSettings !== 'function') return

    if (isFetched.current) {
      return
    }

    isFetched.current = true

    const handleFetchAll = async () => {
      try {
        Loading.get.show()
        // const myCaches = await fetchCache()
        // const fetchAllPromises: any[] = []
        // myCaches.forEach((myCache: any) => {
        //   switch (myCache.id) {
        //     case 'teams':
        //       fetchAllPromises.push(fetchTeam())
        //       break
        //     case 'matches':
        //       fetchAllPromises.push(fetchMatch())
        //       break
        //     case 'players':
        //       fetchAllPromises.push(fetchPlayer())
        //       break
        //     case 'stats':
        //       fetchAllPromises.push(fetchStat())
        //       break
        //     default:
        //       break
        //   }
        // })
        // await Promise.all(fetchAllPromises)
        await Promise.all([
          fetchTeam(),
          fetchMatch(),
          fetchPlayer(),
          fetchStat(),
          fetchSettings(),
        ])
        // do something
      } catch (e) {
        navigate(routes.error)
      } finally {
        Loading.get.hide()
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
