import { useCallback, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { IS_DEVELOP, eventNames } from '../../constants'
import { logAnalyticsEvent } from '../../firebase/analytics'
import useFlashScore from '../../context/FlashScore/useFlashScore'
import { routes } from '../../routes'
import { useEffectOnce } from 'react-use'

const Home = () => {
  const location = useLocation()
  const auth = useAuth()
  const navigate = useNavigate()
  const isFetched = useRef(false)
  const { fetchTeam, fetchMatch, fetchPlayer, fetchStat } = useFlashScore()
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--vh',
      window.innerHeight * 0.01 + 'px'
    )
  }, [])
  useEffect(() => {
    if (IS_DEVELOP) return
    const page_path = location.pathname + location.search
    logAnalyticsEvent(eventNames.SCREEN_VIEW, {
      page_path,
    })
    scrollToTop()
  }, [location, scrollToTop])

  useEffectOnce(() => {
    if (typeof fetchTeam !== 'function') return
    if (typeof fetchMatch !== 'function') return
    if (typeof fetchPlayer !== 'function') return
    if (typeof fetchStat !== 'function') return

    if (isFetched.current) {
      return
    }

    isFetched.current = true

    const handleFetchTeam = async () => {
      try {
        // localStorage.removeItem('teams')
        // localStorage.removeItem('matches')
        // localStorage.removeItem('matchs')
        // localStorage.removeItem('players')
        // localStorage.removeItem('stats')
        await Promise.all([
          fetchTeam(),
          fetchMatch(),
          fetchPlayer(),
          fetchStat(),
        ])
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }
    handleFetchTeam()
  })

  return (
    <div className="min-h-screen bg-black1">
      <Outlet context={auth} />
    </div>
  )
}

export default Home
