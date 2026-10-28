import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { Setup as FiveHundredSetup } from '../games/five-hundred/Setup'
import { GameRoute } from './GameRoute'
import { Home } from './Home'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/new/500', element: <FiveHundredSetup /> },
  { path: '/game/:id', element: <GameRoute view="board" /> },
  { path: '/game/:id/round', element: <GameRoute view="round" /> },
  { path: '/game/:id/round/:roundId', element: <GameRoute view="round" /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
