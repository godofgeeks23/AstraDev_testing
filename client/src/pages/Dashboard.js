import React, { useEffect, useState } from 'react'
import { isExpired, decodeToken } from "react-jwt";
import { useNavigate } from 'react-router-dom';
import '../App.css'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';


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

    return (<div className='dashboardbody end-0 start-0 top-0 position-absolute'>

<Navbar bg="dark" variant="dark" expand="lg" className=''>
      <Container>
        <Navbar.Brand href="#home">Astra</Navbar.Brand>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
        {/* <Navbar.Collapse id="basic-navbar-nav"> */}
          <Nav className="me-auto">
            <Nav.Link href="#home">Welcome, {quote}</Nav.Link>
            <Nav.Link href="#home">Assets</Nav.Link>
            <Nav.Link href="#link">Team</Nav.Link>
            <Nav.Link href="#link">Invite</Nav.Link>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        {/* </Navbar.Collapse> */}
      </Container>
    </Navbar>

        {/* <button onClickCapture={logout}>logout user</button> */}
    </div>)
}

export default Dashboard
