import { twMerge } from 'tailwind-merge'
import { TeamButtonProps } from '../../../Dashboard/components/TeamButton'

const MatchButton = ({
  className,
  fontClassName,
  team,
  selected,
  onClick,
}: TeamButtonProps) => {
  return (
    <button
      className={twMerge(
        'bg-gray2 flex h-12 flex-1 items-center justify-center rounded-2xl py-2 text-[#B2B2B2] transition-all',
        selected && 'bg-primary text-white',
        className
      )}
      onClick={onClick}
    >
      {team?.logo ? (
        <img
          className="mr-2 h-6 w-6 object-contain"
          src={team.logo[0]?.url}
          alt={`logo-${team.logo}`}
        />
      ) : null}
      <p className={twMerge('m-0 text-base', fontClassName)}>{team.name}</p>
    </button>
  )
}

export default MatchButton
