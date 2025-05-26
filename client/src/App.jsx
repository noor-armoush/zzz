/*import { Routes, Route } from 'react-router-dom'*/
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './screens/Login'
import Signup from './screens/Signup'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}

export default App