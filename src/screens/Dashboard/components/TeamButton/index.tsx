import { twMerge } from 'tailwind-merge'
import { IS_MOCK } from '../../../../constants'

type Logo = {
  url: string
}

type Team = {
  name: string
  logo?: Logo[]
}

export type TeamButtonProps = {
  className?: string
  fontClassName?: string
  team: Team
  selected?: boolean
  onClick?: () => void
}

const TeamButton = ({
  className,
  fontClassName,
  team,
  selected,
  onClick,
  ...rest
}: TeamButtonProps) => {
  return (
    <button
      className={twMerge(
        'flex h-12 min-w-fit items-center justify-center rounded-3xl bg-white px-4 py-2 text-[#B2B2B2] transition-all',
        selected && 'bg-primary text-white',
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {team?.logo ? (
        <img
          className="mr-2 h-6 w-6 object-contain"
          src={
            IS_MOCK
              ? 'https://images.vexels.com/media/users/3/132208/isolated/preview/b6c63f2ec9d7dc0b53c71d47dc800561-soccer-logo.png'
              : team.logo[0]?.url
          }
          alt={`logo-${team.logo}`}
        />
      ) : null}
      <p className={twMerge('m-0 text-base font-semibold', fontClassName)}>
        {IS_MOCK ? 'Team Name' : team.name}
      </p>
    </button>
  )
}

export default TeamButton
