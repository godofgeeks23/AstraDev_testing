import React, { useEffect, useState } from 'react'
import '../App.css'
import Cookies from 'js-cookie';
import Access_denied from './components/AccessDenied';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const ForgotPassword = () => {

    const [email, setEmail] = useState('')

    async function sendResetPassMail(dest, token) {
        const req_body = {
            source: "support@cyethack.com",
            destinations: [dest],
            subject: "Password Reset Request",
            body: "Reset Password",
            html: "<h1>Visit http://localhost:3001/resetpassword?email=" + dest + "&token=" + token + " to reset your password.<h1>",
        }
        fetch('https://qet85fubbi.execute-api.ap-south-1.amazonaws.com/dev/sendemail', {
            method: 'POST',
            // credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req_body)
        }).then((res) => {
            res.json().then((data) => {
                console.log("Response returned by Mailing API: ", data)
                if (data.message_id) {
                    alert("Check Your Mail!")
                } else {
                    alert("Unable to send mail!")
                }
            })
        })
        // const data = await response.json()
        // console.log("got response: ", data)
        // if (data.message_id) {
        //     alert("Check Your Mail!")
        // } else {
        //     alert("Unable to send mail!")
        // }
    }

    async function getresetpasstoken(event) {
        event.preventDefault()

        const req_body = { email: email, }
        const response = await fetch('http://localhost:3000/api/reset_password_token', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req_body)
        })
        const data = await response.json()
        console.log(data)
        if (data.status == "ok") {
            // alert("Visit http://localhost:3001/resetpassword?email=" + email + "&token=" + data.pswd_reset_token + " to reset your password.")
            sendResetPassMail(email, data.pswd_reset_token)
        } else {
            alert("Reset password token generation failed!")
        }
    }


    return (
        <div className='login_container p-5 m-5 bg-dark'>
            <h1 className='text-center p-3'>Forgot Password</h1>
            <Form onSubmit={getresetpasstoken}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="text" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    );

}

export default ForgotPassword
