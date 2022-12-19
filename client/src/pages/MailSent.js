import React from 'react'
import './style.css'
import anim from './Union.png'
import logo from './logo.png'
function Link() {
    return (
        <>
            <div className='link-main-div'>
                <div className='link-content'>
                    <p className='reset-heading'><b>Link has been sent to your email address and mobile number. Follow instructions mentioned thereby.</b></p>
                <a href='/login'><button className='button-84'>Go back to Login</button></a>
                </div>
                <div><img src={anim} className="anim" alt='anim' /></div>
            </div>
        </>
    )
}
export default Link