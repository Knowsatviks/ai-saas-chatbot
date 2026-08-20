import './App.css'
import Header from './components/Header'
import {Routes, Route} from "react-router-dom"
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Chat from './pages/Chat'
import Home from './pages/Home'
import { useAuth } from './context/AuthContext'
import NewPassword from './pages/NewPassword'
import OneTimePassword from './pages/OneTimePassword'


function App() {
  useAuth();

  console.log(useAuth()?.isLoggedIn); 

  return (
    <main>
     <Header/>
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/one-time-password" element={<OneTimePassword />} />
     </Routes>
    </main>
  )
}

export default App
