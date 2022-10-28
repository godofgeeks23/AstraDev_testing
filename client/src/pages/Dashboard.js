import React, { useEffect, useState } from 'react'
import { isExpired, decodeToken } from "react-jwt";
import { useNavigate } from 'react-router-dom';
import '../App.css'

const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'
  };

const Dashboard = () => {

    const navigate = useNavigate()

    const [quote, setQuote] = useState('')

    async function populateQuote() {

        const res = await fetch('http://localhost:1337/api/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'xaccesstoken': localStorage.getItem('token')
            })
        })

        console.log("req sent from dashobard to api", localStorage.getItem('token'))
        const data = await res.json()
        console.log("received data from API ")

        if (data.status == 'ok') {
            setQuote(data.quote)
        }
        else {
            alert(data.error)
        }

    }

    useEffect(() => {

        const token = localStorage.getItem('token')
        if (token) {
            const user = decodeToken(token);

            if (!user) {
                localStorage.removeItem('token')

                navigate('/login')
            }
            else {
                populateQuote()
            }

        }
    }, [])

    return (<h1>
        Hello {quote} <br />
        Welcome to Dashboard of ReconAID!
        <br />
        <br />
        <button onClickCapture={logout}>logout user</button>
    </h1>)
}

export default Dashboard
