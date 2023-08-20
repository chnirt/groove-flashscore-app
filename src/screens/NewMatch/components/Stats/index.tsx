import { generatePath, useNavigate } from 'react-router-dom'
import useAuth from '../../../../hooks/useAuth'
import useFlashScore from '../../../../context/FlashScore/useFlashScore'
import { Fragment, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import { List, SearchBar, Skeleton } from 'antd-mobile'
import { routes } from '../../../../routes'

const Stats = ({ header, matchId }: { header?: string; matchId?: string }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats } = useFlashScore()
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  useDebounce(
    () => {
      setDebouncedSearchText(searchText)
    },
    500,
    [searchText]
  )

  const filterStats = useMemo(() => {
    const visibleStats = stats?.filter((stat) =>
      matchId ? stat.matchId === matchId : true
    )
    if (debouncedSearchText.length === 0) return visibleStats
    return visibleStats?.filter((stat: any) =>
      String(stat.name)
        .toLowerCase()
        .includes(String(debouncedSearchText).toLowerCase())
    )
  }, [matchId, stats, debouncedSearchText])

  return (
    <Fragment>
      {filterStats && filterStats.length > 0 && (
        <SearchBar
          className="sticky top-[45px] z-10 bg-bgPrimary"
          placeholder="Search"
          value={searchText}
          onChange={setSearchText}
        />
      )}
      {filterStats === undefined ? (
        <Skeleton animated className="h-screen w-full rounded-3xl" />
      ) : (
        <List header={header} mode="card">
          {filterStats.length === 0
            ? null
            : filterStats.map((stat, pi: number) => {
                return (
                  <List.Item
                    key={`stat-${pi}`}
                    onClick={
                      user
                        ? () =>
                            navigate(
                              generatePath(routes.editStat, {
                                matchId: stat.matchId,
                                statId: stat.id,
                              })
                            )
                        : undefined
                    }
                    arrow={
                      <div className="flex items-center">
                        {stat?.statId ? (
                          <div className="mr-2">{stat.statId}</div>
                        ) : null}
                      </div>
                    }
                  >
                    {stat.playerName}
                  </List.Item>
                )
              })}
        </List>
      )}
    </Fragment>
  )
}

export default Stats
