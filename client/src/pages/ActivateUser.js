import React, { useEffect, useState } from 'react'
import '../App.css'
import Cookies from 'js-cookie';
import Access_denied from './components/AccessDenied';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom'

const ActivateUserPage = () => {

    const search = useLocation().search;
    const token = new URLSearchParams(search).get("token");

    const navigate = useNavigate()

    async function validateUser() {
        
        const req_body = { pending_user_id: token }
        const response = await fetch('http://localhost:3000/api/validate_pending_user', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req_body)
        })
        const data = await response.json()
        if (data.status == "ok") {
            localStorage.setItem('validated_email', data.user.email)
            localStorage.setItem('validated_role_id', data.user.role_id)
            localStorage.setItem('validated_invitor', data.user.invited_by)
            alert("User Activation Successful! Move on to fill your details...")
            navigate('/register')
        } else { alert("Activation Failed!") }

    }

    validateUser();

    return (
        <div className='register_container'>

        </div>
    );

}

export default ActivateUserPage
