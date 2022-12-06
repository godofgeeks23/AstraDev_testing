import { useState } from 'react'
import '../App.css'
import { useNavigate } from 'react-router-dom'

function App() {

	const [fname, setfname] = useState('')
	const [mname, setmname] = useState('')
	const [lname, setlname] = useState('')
	const [username, setusername] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()

	async function registerUser(event) {		
		
		event.preventDefault()
		const validated_email = localStorage.getItem('validated_email')
		const validated_role_id = localStorage.getItem('validated_role_id')
		const validated_invitor = localStorage.getItem('validated_invitor')
        const req_body = { 
            fname: fname,
            mname: mname,
            lname: lname,
            username: username,
            email: validated_email,
            password: password,
            password2: password,
            cust_id: "63762968b7e0efa6b95168c4",
            role_id: validated_role_id,
            invited_by: validated_invitor,
        }
		const response = await fetch('http://localhost:3000/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}, 
			body: JSON.stringify(req_body)
		})
		const data = await response.json()

		console.log(data)

		if (data.status === 'ok') {
			localStorage.removeItem('validated_email');
			localStorage.removeItem('validated_role_id');
			localStorage.removeItem('validated_invitor');
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
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type="password"
					placeholder="Password"
				/>
				<br />
				<input type="submit" value="Register" />
			</form>
		</div>
	)
}

export default App