import './App.css'
import Header from './components/Header'
import {Routes, Route} from "react-router-dom"
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Chat from './pages/Chat'
import Home from './pages/Home'
import { useAuth } from './context/AuthContext'


function App() {
  useAuth();

  console.log(useAuth()?.isLoggedIn); 

  return (
    <main>
     <Header/>
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
     </Routes>
    </main>
  )
}

export default App
