import { Button, ErrorBlock, Skeleton } from 'antd-mobile'
import { Link } from 'react-router-dom'
import { routes } from '../../routes'

const Error = () => {
  return (
    <div>
      <ErrorBlock
        className="flex flex-col items-center justify-center"
        fullPage
        title="Oops!"
        description="Sorry, an unexpected error has occurred."
      >
        <Link to={routes.app}>
          <Button color="primary" fill="none" shape="rounded">
            Go back home
          </Button>
        </Link>
      </ErrorBlock>

      <div className="flex flex-col gap-7">
        <div className="px-4">
          <Skeleton.Title className="!mb-0 !mt-0 h-7" />
        </div>
        <div className="flex flex-row gap-5 px-4">
          <Skeleton animated className="h-[13rem] w-72 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

export default Error
