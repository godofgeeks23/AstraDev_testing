import React, { useEffect, useState } from 'react'
import { isExpired, decodeToken } from "react-jwt";
import { useNavigate } from 'react-router-dom';
import '../App.css'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Cookies from 'js-cookie';
import Emp_header from './components/Emp_header'
import Mngr_header from './components/Mngr_header'
import Access_denied from './components/AccessDenied';


const ManagerPanel = () => {

  const navigate = useNavigate()

  async function chkAccess() {

    const res = await fetch('http://localhost:3000/api/profile', {
        "headers": {        "cookies": Cookies.get('auth')      }    })
      const data = await res.json();
      if (data.isAuth)
          if(data.role_name == "Manager")
              return true;
      return false;

  }

  chkAccess().then((result) => {
    console.log(result)
    if(result) {
        alert("Access Granted")
        return (
            <div className='login_container p-5 m-5 bg-dark'>
            <h1 className='text-center p-3'>You are seeing this page because you are a Manager</h1>
            </div>
        )
    }
    alert("Access Denied")
    return(<Access_denied />)
  })

}

export default ManagerPanel
