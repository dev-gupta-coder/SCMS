// Backs the Supabase Auth client so the login screen's "Remember me" checkbox
// controls whether the session survives a browser restart (localStorage) or
// ends with the tab/window (sessionStorage). Supabase reads/writes its session
// through this adapter, so the choice made at sign-in time sticks for that session.

const REMEMBER_ME_KEY = 'scms-remember-me'

function activeStorage(): Storage {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'false' ? sessionStorage : localStorage
}

/** Call before signing in. Defaults to "remembered" (localStorage) if never set. */
export function setRememberMe(remember: boolean) {
  localStorage.setItem(REMEMBER_ME_KEY, String(remember))
}

export const rememberMeStorage = {
  getItem: (key: string) => activeStorage().getItem(key),
  setItem: (key: string, value: string) => activeStorage().setItem(key, value),
  removeItem: (key: string) => activeStorage().removeItem(key),
}
