import { useCallback, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffectOnce } from 'usehooks-ts'
import useAuth from '../../hooks/useAuth'
import { IS_DEVELOP, eventNames } from '../../constants'
import { logAnalyticsEvent } from '../../firebase/analytics'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { Loading } from '../../global'
import { routes } from '../../routes'

const Home = () => {
  const location = useLocation()
  const auth = useAuth()
  const navigate = useNavigate()
  const isFetched = useRef(false)
  const {
    fetchTeam,
    fetchMatch,
    fetchPlayer,
    fetchStat,
    fetchCache,
    fetchSettings,
  } = useFlashScore()

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

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

    document.documentElement.style.setProperty(
      '--vh',
      window.innerHeight * 0.01 + 'px'
    )
  })

  useEffect(() => {
    if (IS_DEVELOP) return
    const page_path = location.pathname + location.search
    logAnalyticsEvent(eventNames.SCREEN_VIEW, {
      page_path,
    })
    scrollToTop()
  }, [location, scrollToTop])

  return (
    <div className="min-h-screen bg-black1">
      <Outlet context={auth} />
    </div>
  )
}

export default Home
