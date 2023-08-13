import { ProgressBar } from 'antd-mobile'

type Stat = { title: string; home: number; away: number }

const Stat = ({ stat }: { stat: Stat }) => {
  const win = stat.home > stat.away
  const draw = stat.home === stat.away
  const isAllZero = stat.home === 0 && stat.away === 0
  const sumPercent = isAllZero ? 1 : stat.home + stat.away
  const homePercent = (stat.home / sumPercent) * 100
  const awayPercent = (stat.away / sumPercent) * 100
  return (
    <button className="bg-transparent">
      <div className="flex justify-between">
        <p className="m-0 text-base font-semibold text-black2">{stat.home}</p>
        <p className="m-0 text-base text-gray3">{stat.title}</p>
        <p className="m-0 text-base font-semibold text-primary">{stat.away}</p>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <ProgressBar
            className="rotate-180"
            style={{
              '--fill-color': win
                ? 'var(--adm-color-primary)'
                : draw
                ? 'var(--adm-color-primary)'
                : 'var(--adm-color-tertiary)',
              '--track-color': '#E9D8E4',
            }}
            percent={homePercent}
          />
        </div>
        <div className="flex-1">
          <ProgressBar
            style={{
              '--fill-color': !win
                ? 'var(--adm-color-primary)'
                : draw
                ? 'var(--adm-color-primary)'
                : 'var(--adm-color-tertiary)',
              '--track-color': '#E9D8E4',
            }}
            percent={awayPercent}
          />
        </div>
      </div>
    </button>
  )
}

export default Stat
