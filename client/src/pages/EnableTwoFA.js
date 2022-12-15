import { useState } from 'react'
// import '../App.css'
import { isExpired, decodeToken } from "react-jwt";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './style.css'
import anim from './Union.png'
import logo from './logo.png'

function App() {


	const [qrurl, setqrurl] = useState("");

	async function enablemytwofa(event) {
		event.preventDefault()
		console.log("enablemytwofa function called")
		const response = await fetch('http://localhost:3000/api/enable2fa', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		const data = await response.json()
		setqrurl(data.qr)
	}

	return (
		<>
			<div>
				<form onSubmit={enablemytwofa}>
					<h1 style={{ textAlign: "center" }}><b>Enable 2FA</b></h1>
					<button type='submit' className='button-84'>Done</button>
				</form>
				<img id="qrcodeimg" src={qrurl} alt="QR Code"></img>
				{/* add a button to navigate to /verify2fa */}

				{qrurl && <button type='submit' className='button-84'>Verify 2FA Activation</button>}
			</div>

		</>
	)
}

export default App