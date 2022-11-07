import React, { useEffect, useState } from 'react'
import { isExpired, decodeToken } from "react-jwt";
import { useNavigate } from 'react-router-dom';
import '../App.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Cookies from 'js-cookie';


async function logout() {
  const res = await fetch('http://localhost:3000/api/logout', {
    "headers": {
      // "cookies":"eyJhbGciOiJIUzI1NiJ9.NjM2NmFiMmU2YTcwZmMwYTEwMTQ1NDQy.YCU80QSzCkkC6KlsIpq4HRL2wSek6C2vGbTAfZs3Im4"
      "cookies": Cookies.get('auth')
    }
  })
  localStorage.removeItem('token');
  Cookies.remove('auth')
  alert("Logged out! Redirecting to Login page...")
  window.location.href = '/login'
};

const Dashboard = () => {

  const navigate = useNavigate()

  const [quote, setQuote] = useState('')

  async function populateQuote() {

    const res = await fetch('http://localhost:3000/api/profile', {
      "headers": {
        // "cookies":"eyJhbGciOiJIUzI1NiJ9.NjM2NmFiMmU2YTcwZmMwYTEwMTQ1NDQy.YCU80QSzCkkC6KlsIpq4HRL2wSek6C2vGbTAfZs3Im4"
        "cookies": Cookies.get('auth')
      }
    })
    const data = await res.json();

    if (data.isAuth) {
      setQuote(data.name)
    }
    else {
      // alert(data.error)
      alert("You are not logged in... Navigating to /login")

      window.location.href = '/login'
    }

  }
  
  populateQuote()

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
