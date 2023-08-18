import {
  // Image,
  SpinLoading,
} from 'antd-mobile'
// import { ORIGIN } from "../../constants";

const Loading = () => {
  return (
    <div
      role="status"
      className="absolute left-1/2 top-2/4 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center"
    >
      {/* <div className="flex justify-center items-center">
        <Image
          className="w-8 aspect-square"
          src={`${ORIGIN}/images/favicon.ico`}
        />
        Flash Score App
      </div> */}
      <SpinLoading color="primary" />
    </div>
  )
}

export default Loading
