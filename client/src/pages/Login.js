import { useState } from 'react'
// import '../App.css'
import { isExpired, decodeToken } from "react-jwt";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './style.css'
import anim from './Union.png'
import logo from './logo.png'

function App() {

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	async function loginUser(event) {

		event.preventDefault()

		const response = await fetch('http://localhost:3000/api/login', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email, password,
			})
		})
		const data = await response.json()
		console.log(data)

		if (data.isAuth) {
			localStorage.setItem('token', data.isAuth)
			// console.log("token value:")
			// const token = localStorage.getItem('token')
			// const user = decodeToken(token);
			// console.log(token)
			alert("Logged in Successfully!")
			window.location.href = '/dashboard'
		} else {
			alert("please check your crendentials!")
		}

		// console.log(data)
	}

	return (
		<>

			<div className='left'>
				<div className='left-content'>
					<p className='reset-heading'><b>Company <br />
						Manager Portal</b></p>
					<div className='reset-content'><p><ul>
						<li>
							points
						</li>
						<li>
							points
						</li>
						<li>
							points
						</li>
					</ul></p></div>
				</div>
				<div><img src={anim} className="anim" alt='anim' /></div>
			</div>

			<div className='right'>
				<div className='right-content'>
					<div><h2> <img src={logo} className="logo" alt='anim' />&nbsp; Cyethack Solutions</h2></div>
					<div className='right-content-text'>

						<form onSubmit={loginUser}>
							<h1 style={{ textAlign: "center" }}><b>Log In</b></h1>
							<label for="email">Email<br />
								<input type="email" className='text-area' value={email} onChange={(e) => setEmail(e.target.value)} />
							</label><br />
							<label for="pass">Password <br />
								<input type="password" className='text-area' placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
							</label><br />
							<a href='/forgotPassword' style={{ textDecoration: "underline", color: "#000" }}>Forgot Password?</a> <br />
							<button type='submit' className='button-84'>Done</button>
						</form>

					</div>

				</div>
			</div>
		</>
	)
}

export default App