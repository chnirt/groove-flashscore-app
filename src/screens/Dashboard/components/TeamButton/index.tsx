import { twMerge } from 'tailwind-merge'

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
          src={team.logo[0]?.url}
          alt={`logo-${team.logo}`}
        />
      ) : null}
      <p className={twMerge('m-0 text-base font-semibold', fontClassName)}>
        {team.name}
      </p>
    </button>
  )
}

export default TeamButton
