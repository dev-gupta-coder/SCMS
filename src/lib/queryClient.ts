import { QueryClient } from '@tanstack/react-query'

// if two pages call useMyBuildings(), QueryClient returns the cached buildings instead of fetching again.

export const queryClient = new QueryClient()
