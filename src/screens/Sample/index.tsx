import { ErrorBlock, NavBar } from 'antd-mobile'

const Sample = () => {
  return (
    <div>
      <NavBar className="sticky top-0 z-[100] bg-white" back={null}>
        SAMPLE
      </NavBar>
      {/* <img src={"https://wjhjnr.csb.app/water-melon.jpeg"} alt="Logo" /> */}
      <ErrorBlock
        className="flex flex-col justify-center items-center"
        fullPage
        title="Best Coming Soon"
        description="We're working on something amazing, and we can't wait to share it with
        you. Stay tuned!"
      />
    </div>
  )
}

export default Sample
