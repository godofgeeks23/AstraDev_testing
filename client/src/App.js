import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ManagerPanel from './pages/ManagerPanel'

const App = () => {
    return (
        <div className='h-100 d-flex align-items-center justify-content-center'>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/managerpanel" element={<ManagerPanel allowedRoles={["Manager"]} />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
