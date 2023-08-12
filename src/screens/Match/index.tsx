import { Avatar, ProgressBar } from 'antd-mobile'
import { SearchOutline } from 'antd-mobile-icons'
import {
  // LiveMatchCard,
  TeamButton,
} from '../Dashboard'

const Match = () => {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-[1px] border-black p-4">
        <Avatar
          className="border-2 border-white"
          src="https://t4.ftcdn.net/jpg/05/42/36/11/360_F_542361185_VFRJWpR2FH5OiAEVveWO7oZnfSccZfD3.jpg"
          style={{
            '--size': '24px',
          }}
        />
        <h6 className="m-0">FlashScore</h6>

        <button className="flex items-center justify-center">
          <SearchOutline className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-col gap-8 p-4">
        {/* <LiveMatchCard match={} /> */}

        <div className="flex flex-col gap-5 rounded-3xl bg-white px-5 py-7">
          <div className="flex gap-4">
            {['Stats', 'Line-up', 'Summary'].map((team) => (
              <TeamButton className="flex flex-1" title={team} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {['Shots', 'Yellow card', 'Red card'].map((stat) => (
              <div>
                <div className="flex justify-between">
                  <h2>0</h2>
                  <h2>{stat}</h2>
                  <h2>0</h2>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <ProgressBar className="rotate-180" percent={50} />
                  </div>
                  <div className="flex-1">
                    <ProgressBar percent={50} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Match
