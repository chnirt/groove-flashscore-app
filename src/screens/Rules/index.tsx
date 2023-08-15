import { useCallback, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'react-simplemde-editor'
import { Button, NavBar, Toast } from 'antd-mobile'
import 'easymde/dist/easymde.min.css'
import useAuth from '../../hooks/useAuth'
import { Loading } from '../../global'
import { getDocRef, getDocument, updateDocument } from '../../firebase/service'
import { routes } from '../../routes'
import { useNavigate } from 'react-router-dom'

// const markdown = `
// 04 clubs will compete in a round-robin format to calculate the scores. After the group stage, the clubs ranked first and second will play
// in the final match, while the teams ranked third and fourth will compete in the third-place playoff.
// - Each team must have 8 - 12 players.
// - Players within a team must be members of the same BU (excepted Mars & Venus).
// - Any changes to the players in the team compared to the registered list must be submitted to and confirmed by the organizing committee.
// - The team must prepare their uniforms and register with the organizers at least 5 days before the tournament takes place. All players'
// uniforms must have a jersey number, and the players' jersey numbers cannot be changed throughout their participation in the competition
// - In all cases, the decision of the organizing committee is final
// `

const uid = 'YmkaDMxsc5cctaWNJvE3uqunXig2'

const Rules = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [value, setValue] = useState()

  const handleSubmit = useCallback(async () => {
    try {
      Loading.get.show()
      const settingsData = {
        ...(value ? { rules: value } : {}),
      }
      const settingsDocRef = getDocRef('users', uid)
      await updateDocument(settingsDocRef, settingsData)
      Toast.show({
        icon: 'success',
        content: 'Saved',
      })

      return
    } catch (error: any) {
      Toast.show({
        icon: 'error',
        content: error.message,
      })
    } finally {
      Loading.get.hide()
    }
  }, [value])

  const fetchRules = useCallback(async () => {
    const userDocRef = getDocRef('users', uid)
    const userDocData: any = await getDocument(userDocRef)
    setValue(userDocData.rules)
  }, [])

  useEffect(() => {
    if (typeof fetchRules !== 'function') return
    const handleFetchRules = async () => {
      try {
        await fetchRules()
        // do something
      } catch (e) {
        navigate(routes.error)
      }
    }

    handleFetchRules()
  }, [fetchRules, navigate])

  return (
    <div>
      <NavBar
        className="sticky top-0 bg-bgPrimary"
        style={{
          '--height': '76px',
        }}
        backArrow={false}
      >
        Rules
      </NavBar>
      <div className="px-4">
        {user ? (
          <SimpleMDE value={value} onChange={setValue} />
        ) : value === undefined ? (
          <div>Loading</div>
        ) : (
          <ReactMarkdown children={value} />
        )}
        {user ? (
          <Button
            block
            type="button"
            color="primary"
            size="large"
            shape="rounded"
            onClick={handleSubmit}
          >
            Save
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default Rules
