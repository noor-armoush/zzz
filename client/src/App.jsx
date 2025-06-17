/*import { Routes, Route } from 'react-router-dom'*/
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './screens/Login'
import Signup from './screens/Signup'
import VerifyCode from './screens/VerifyCode'
import VerifyCode2 from './screens/VerifyCode2'
import ResetPassword from './screens/ResetPassword';

import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
       <Route path="/verify-code" element={<VerifyCode />} />
       <Route path="/verify-code2" element={<VerifyCode2 />} />
       <Route path="/reset-password" element={<ResetPassword />} />


    </Routes>
  )
}

export default App