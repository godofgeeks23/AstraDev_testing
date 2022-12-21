import React, { useEffect, useState } from 'react'
import '../App.css'
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom'
import './style.css'
import anim from './Union.png'
import logo from './logo.png'

const ResetPassword = () => {

    const search = useLocation().search;
    const email = new URLSearchParams(search).get("email");
    const token = new URLSearchParams(search).get("token");
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')

    const navigate = useNavigate()

    async function reset_my_password(event) {
        event.preventDefault()
        const req_body = {
            email: email,
            resetpswd_token: token,
            password: password,
            password2: password2,
        }
        const response = await fetch('http://localhost:3000/api/resetPassword', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req_body)
        })
        const data = await response.json()
        if (data.status == "ok") {
            alert("Password Reset Successfully.\nLogin In using the new credentials to continue...")
            navigate('/login')
        } else { alert("Password Reset Failed!") }

    }

    return (
        <>
        <div className='left'>
            <div className='left-content'>
            <p className='reset-heading'><b>Reset Your <br />
            Password</b></p>
            </div>
            <div><img src={anim} className="anim" alt='anim' /></div>
        </div>
        <div className='right'>
            <div className='right-content'>
           <div><h2> <img src={logo} className="logo" alt='anim' />&nbsp; Cyethack Solutions</h2></div>
            <div className='right-content-text'>
                <form onSubmit={reset_my_password}>
                    <h1 style={{textAlign:"center"}}><b>Reset Your Password</b></h1>
                    <label for="pass">New Password<br />
                    <input type="password" className='text-area' value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </label><br />
                    <label for="confpass">Confirm Password <br />
                    <input type="password" className='text-area' value={password2} onChange={(e) => setPassword2(e.target.value)}/>
                    </label><br />
                    <button type='submit' className='button-84'>Next Step</button>
                </form>
            </div> 
            </div>
        </div>
        </>
      ) 
}

export default ResetPassword
