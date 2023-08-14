import { User } from 'firebase/auth'
import { AuthStatus } from '.'

export type IUser = User & {
  fullName?: string
  rules?: string
}

export type AuthContextType = {
  user: IUser | null
  status: AuthStatus
  isLoggedIn: boolean
  setStatus: (value: React.SetStateAction<AuthStatus>) => void
  fetchUser: (fbUser: User) => Promise<void>
}
