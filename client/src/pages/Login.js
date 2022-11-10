import { useState } from 'react'
import '../App.css'
import { isExpired, decodeToken } from "react-jwt";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

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
		<div className='login_container p-5 m-5 bg-dark'>
			<h1 className='text-center p-3'>Login</h1>
			<Form onSubmit={loginUser}>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control type="text" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
			</Form>

		</div>
	)
}

export default App
