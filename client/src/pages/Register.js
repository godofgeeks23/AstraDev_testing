import { useState } from 'react'
import '../App.css'
import { useNavigate } from 'react-router-dom'

function App() {

	const [fname, setfname] = useState('')
	const [mname, setmname] = useState('')
	const [lname, setlname] = useState('')
	const [username, setusername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isAdmin, setisAdmin] = useState(false)

	const navigate = useNavigate()

	async function registerUser(event) {
		event.preventDefault()

		const response = await fetch('http://3.6.39.205:1337/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				fname, mname, lname, username, email, password, isAdmin,
			})
		})
		const data = await response.json()

		console.log(data)

		if (data.status === 'ok') {
			navigate('/login')
		}

	}

	return (
		<div className='register_container'>
			<div className='heading1'><h1>Register</h1></div>
			<form onSubmit={registerUser}>
				<input
					value={fname}
					onChange={(e) => setfname(e.target.value)}
					type="text"
					placeholder="First Name"
				/>
				<br />
				<input
					value={mname}
					onChange={(e) => setmname(e.target.value)}
					type="text"
					placeholder="Middle Name"
				/>
				<br />
				<input
					value={lname}
					onChange={(e) => setlname(e.target.value)}
					type="text"
					placeholder="Last Name"
				/>
				<br />
				<input
					value={username}
					onChange={(e) => setusername(e.target.value)}
					type="text"
					placeholder="User Name"
				/>
				<br />
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type="email"
					placeholder="Email"
				/>
				<br />
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					placeholder="Password"
				/>
				<br />

				<input id="admincheckbox" type="checkbox" onChange={(e) => setisAdmin(e.target.checked)} />
				<label for="admincheckbox"> {isAdmin ? 'Admin' : 'Not Admin'}</label>
				<br />

				<input type="submit" value="Register" />
			</form>
		</div>
	)
}

export default App