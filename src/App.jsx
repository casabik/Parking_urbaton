import { Button } from "@suid/material"
import { Router, Routes, Route } from '@solidjs/router'
import Login from "./pages/Login"
import Registration from "./pages/Registration"
import Index from "./pages/Index"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" component={Index} />
        <Route path="/login" component={Login} />
        <Route path="/registration" component={Registration} />
      </Routes>
    </Router>
  )
}

export default App
