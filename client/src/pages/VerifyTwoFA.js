import { useState } from 'react'
// import '../App.css'
import { isExpired, decodeToken } from "react-jwt";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './style.css'
import anim from './Union.png'
import logo from './logo.png'

function App() {

    const [token, settoken] = useState('')

    async function verify_twofa(event) {

        event.preventDefault()

        const response = await fetch('http://localhost:3000/api/verify2fa', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
            })
        })
        const data = await response.json()
        // console.log(data)

        if (data.verified) {
            alert("2FA Successful!")
            // window.location.href = '/dashboard'
        } else {
            alert("2FA Failed!")
        }
    }

    return (
        <>
            <div className='left'>
                <form onSubmit={verify_twofa}>
                    <h1 style={{ textAlign: "center" }}><b>Enter 2FA TOTP</b></h1>
                    <h4 style={{ textAlign: "center" }}><b>As shown by your authenticator app</b></h4>
                    <label for="totp">TOTP<br />
                        <input type="text" className='text-area' value={token} onChange={(e) => settoken(e.target.value)} />
                    </label><br />
                    <button type='submit' className='button-84'>Done</button>
                </form>
            </div>
        </>
    )
}

export default App

