import React, { useEffect, useState } from 'react'
import '../App.css'
import Cookies from 'js-cookie';
import Access_denied from './components/AccessDenied';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useLocation } from "react-router-dom";

const ActivateUserPage = () => {

    const search = useLocation().search;
    const token = new URLSearchParams(search).get("token");
    // alert(token);

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
        console.log(data)

        if (data.status == "ok") {
            alert("User Activation Successful! Move on to fill your details...")
        } else { alert("Activation Failed!") }

    }
    validateUser();
    return (
        <div className='login_container p-5 m-5 bg-dark'>

        </div>
    );

}

export default ActivateUserPage
