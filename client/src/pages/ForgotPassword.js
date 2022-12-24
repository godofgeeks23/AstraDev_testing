import React, { useEffect, useState } from 'react'
import '../App.css'
import anim from './Union.png'
import logo from './logo.png'
import './style.css'

const ForgotPassword = () => {

    const [email, setEmail] = useState('')

    async function sendResetPassMail(dest, token) {
        const req_body = {
            destination: dest,
            token: token,
        }
        const response = await fetch('http://localhost:3000/api/sendResetPasswordMail', {
            method: 'POST',
            // credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req_body)
        })
        const data = await response.json()
        if (data.status == "ok") {
            alert("Check Your Mail!")
            // navigate('/login')
        } else { alert("Unable to send mail!") }
    }

    async function getresetpasstoken(event) {
        event.preventDefault()

        const req_body = { email: email, }
        const response = await fetch('http://localhost:3000/api/resetPasswordToken', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req_body)
        })
        // redirect to /mailsent
        const data = await response.json()
        console.log(data)
        // window.location.href = '/mailsent'
        if (data.status == "ok") {
            // alert("Visit http://localhost:3001/resetpassword?email=" + email + "&token=" + data.pswd_reset_token + " to reset your password.")
            sendResetPassMail(email, data.pswd_reset_token)
        } else {
            alert("Reset password token generation failed!")
        }
    }
    
    return (
        <>
        <div className='left'>
            <div className='left-content'>
            <p className='reset-heading'><b>Forgot <br />
            Password</b></p>
            <div className='reset-content'><p>Please enter your email mobile number and we'll send the reset password link to your mail.</p></div>
            </div>
            <div><img src={anim} className="anim" alt='anim' /></div>
        </div>
        <div className='right'>
            <div className='right-content'>
           <div><h2> <img src={logo} className="logo" alt='anim' />&nbsp; Cyethack Solutions</h2></div>
            <div className='right-content-text'>
                <form onSubmit={getresetpasstoken}>
                    <h1 style={{textAlign:"center"}}><b>Forgot Password</b></h1>
                    <label for="email">Email<br />
                    <input type="email" className='text-area' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label><br />
                    <label for="mnum">Mobile Number <br />
                    <input type="number" className='text-area' />
                    </label><br />
                    <button type='submit' className='button-84'>Done</button>
                </form>
            </div>
            </div>
        </div>
        </>
      ) 
}

export default ForgotPassword
