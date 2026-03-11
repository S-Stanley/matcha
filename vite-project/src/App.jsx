import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./UI/MainLayout";
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import CompleteProfile from './pages/CompleteProfile.jsx'
import Match from './pages/Match.jsx'
import Profile from './pages/Profile.jsx'
import Message from './pages/Message.jsx'
import Recherche from './pages/Recherche.jsx'
import PublicProfile from "./pages/PublicProfile.jsx";
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/completeprofile" element={<CompleteProfile />} />
        <Route element={<MainLayout />}>
          <Route path="/match" element={<Match />} />
          <Route path="/recherche" element={<Recherche />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/message" element={<Message />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
