import { useState } from 'react'
import './style.css'

function App() {

	const [qrurl, setqrurl] = useState("");

	async function enablemytwofa(event) {
		event.preventDefault()
		console.log("enablemytwofa function called")
		const response = await fetch('http://localhost:3000/api/enable2FA', {
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
				{qrurl && <button type='submit' onClick={() => window.location.href='/verifytwofa'} className='button-84'>Verify 2FA Activation</button>}
			</div>

		</>
	)
}

export default App