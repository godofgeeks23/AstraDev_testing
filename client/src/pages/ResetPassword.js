import React, { useEffect, useState } from 'react'
import '../App.css'
import Cookies from 'js-cookie';
import Access_denied from './components/AccessDenied';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom'

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
        const response = await fetch('http://localhost:3000/api/reset_password', {
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
        <div className='login_container p-5 m-5 bg-dark'>
            <h1 className='text-center p-3'>Reset Password</h1>
            <Form onSubmit={reset_my_password}>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword2">
                    <Form.Label>Enter again</Form.Label>
                    <Form.Control type="password" placeholder="Password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>

        </div>
    );

}

export default ResetPassword
