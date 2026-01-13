import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import CompleteProfile from './pages/CompleteProfile.jsx'
import Home from './pages/Home.jsx'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/completeprofile" element={<CompleteProfile />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
