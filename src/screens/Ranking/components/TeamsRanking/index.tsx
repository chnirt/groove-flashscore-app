import Table from '../../../../components/Table'

const Teams = ({ rows }: { rows: any[] }) => {
  const columns = [
    { field: 'rank', headerName: '' },
    { field: 'name', headerName: 'Name', className: 'w-full' },
    {
      field: 'matches',
      headerName: 'M',
    },
    {
      field: 'win',
      headerName: 'W',
    },
    {
      field: 'draw',
      headerName: 'D',
    },
    {
      field: 'lose',
      headerName: 'L',
    },
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

export default Teams
