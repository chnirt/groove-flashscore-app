import { Button, ErrorBlock } from 'antd-mobile'
import { Link, useRouteError } from 'react-router-dom'
import { routes } from '../../routes'

const Error = () => {
  const error = useRouteError()

  return (
    <div>
      <ErrorBlock
        className="flex flex-col items-center justify-center"
        fullPage
        title="Oops!"
        description={error as string || "Sorry, an unexpected error has occurred."}
      >
        <Link to={routes.app}>
          <Button color="primary" fill="none" shape="rounded">
            Go back home
          </Button>
        </Link>
      </ErrorBlock>
    </div>
  )
}

export default Error
