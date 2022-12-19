import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ManagerPanel from './pages/ManagerPanel'
import InvitePage from './pages/InvitePage'
import ActivateUserPage from './pages/ActivateUser'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import EnableTwoFA from './pages/EnableTwoFA'
import VerifyTwoFA from './pages/VerifyTwoFA'
import MailSent from './pages/MailSent'

const App = () => {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/managerpanel" element={<ManagerPanel allowedRoles={["Manager"]} />} />
                    <Route path="/invitepage" element={<InvitePage allowedRoles={["Manager"]} />} />
                    <Route path="/activateuser" element={<ActivateUserPage />} />
                    <Route path="/forgotpassword" element={<ForgotPassword />} />
                    <Route path="/resetpassword" element={<ResetPassword />} />
                    <Route path="/enabletwofa" element={<EnableTwoFA />} />
                    <Route path="/verifytwofa" element={<VerifyTwoFA />} />
                    <Route path="/mailsent" element={<MailSent />} />

                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
