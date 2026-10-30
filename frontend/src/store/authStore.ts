import { create } from "zustand"
import { User, LoginResponse } from "@/types"

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (payload: LoginResponse) => void
  setAccessToken: (token: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  initialize: () => void
}

const ACCESS_TOKEN_KEY = "tasktrackr_access_token"
const REFRESH_TOKEN_KEY = "tasktrackr_refresh_token"
const USER_KEY = "tasktrackr_user_meta"

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  login: (payload: LoginResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
    set({
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      isAuthenticated: true,
      isInitialized: true,
    })
  },

  setAccessToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    set({ accessToken: token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: true,
    })
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user
    if (current) {
      const merged = { ...current, ...updates }
      localStorage.setItem(USER_KEY, JSON.stringify(merged))
      set({ user: merged })
    }
  },

  initialize: () => {
    const savedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)

    let parsedUser: User | null = null
    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser)
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }

    if (savedRefreshToken) {
      set({
        accessToken: savedAccessToken || null,
        refreshToken: savedRefreshToken,
        user: parsedUser,
        isAuthenticated: !!savedAccessToken,
        isInitialized: true,
      })
    } else {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      })
    }
  },
}))
