import Table from '../../../../components/Table'

const PlayersRanking = ({ rows }: { rows: any[] }) => {
  const columns = [
    { field: 'rank', headerName: '', className: 'min-w-[40px]' },
    { field: 'name', headerName: 'Name', className: 'w-full' },
    {
      field: 'points',
      headerName: 'PTS',
      renderCell: (fieldValue: any) => {
        return <p className="m-0 font-bold">{fieldValue}</p>
      },
    },
  ]
  return (
    <div>
      <Table columns={columns} rows={rows} />
    </div>
  )
}

export default PlayersRanking
