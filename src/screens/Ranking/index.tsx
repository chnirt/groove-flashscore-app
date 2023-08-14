import { NavBar } from 'antd-mobile'

const Ranking = () => {
  return (
    <div>
      <NavBar
        style={{
          '--height': '76px',
        }}
        backArrow={false}
      >
        Ranking
      </NavBar>
      <div className="px-4"></div>
    </div>
  )
}

export default Ranking
