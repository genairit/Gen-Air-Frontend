import { router } from './router.tsx'
import { RouterProvider } from 'react-router-dom'
import MuiThemeProvider from './context/MuiThemeContext.tsx'

function App() {
  return (
    <MuiThemeProvider>
      <RouterProvider router={router} />
    </MuiThemeProvider>
  )
}

export default App
