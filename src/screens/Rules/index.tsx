import { useCallback, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import useAuth from '../../hooks/useAuth'

const markdown = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`

const Rules = () => {
  const { user } = useAuth()
  const [value, setValue] = useState(markdown)

  const onChange = useCallback((value: string) => {
    setValue(value)
  }, [])

  return (
    <div className="p-4">
      {user ? (
        <SimpleMDE value={value} onChange={onChange} />
      ) : (
        <ReactMarkdown children={markdown} />
      )}
    </div>
  )
}

export default Rules
