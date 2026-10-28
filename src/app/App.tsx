import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { Setup as FiveHundredSetup } from '../games/five-hundred/Setup'
import { GameRoute } from './GameRoute'
import { Home } from './Home'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/new/500', element: <FiveHundredSetup /> },
  { path: '/game/:id', element: <GameRoute /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
