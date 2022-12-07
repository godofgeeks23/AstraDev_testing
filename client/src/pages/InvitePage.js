import React, { useEffect, useState } from 'react'
import '../App.css'
import Cookies from 'js-cookie';
import Access_denied from './components/AccessDenied';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const InvitePage = (props) => {

    const [hasAccess, setHasAccess] = useState(null);
    
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    
    async function chkAccess() {

        const res = await fetch('http://localhost:3000/api/profile', {
            "headers": { "cookies": Cookies.get('auth') }
        })
        const data = await res.json();
        if (data.isAuth)
            if (props.allowedRoles.includes(data.role_name))
                return true;
        return false;

    }
    useEffect(() => {
        chkAccess().then((result) => {
            setHasAccess(!!result);
        });
    }, []);

    console.log(props.allowedRoles[0])
    if (hasAccess === null) return (<div>Loading</div>);
    if (!hasAccess) {
        return <Access_denied />;
    }



	async function inviteUser(event) {

		event.preventDefault()

        const req_body = {
                email  : email,
                role_id : role,
                invited_by : "63762ddbb7e0efa6b95168cd",
                validity: "24"
        }
		const response = await fetch('http://localhost:3000/api/create_pending_user', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req_body)
		})
		const data = await response.json()
		console.log(data)

		if (data.status == "ok") {
			alert("Invite Sent Successfully!\nVisit http://localhost:3001/activateuser?token=" + data.pending_user_id + " to activate the user!")
		} else {
			alert("Invitation Failed!")
		}

		// console.log(data)
	}

    if (hasAccess)
        return (
            <div className='login_container p-5 m-5 bg-dark'>
			<h1 className='text-center p-3'>Invite User</h1>
			<Form onSubmit={inviteUser}>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control type="text" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicRole">
					<Form.Label>Role</Form.Label>
					<Form.Control type="text" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
			</Form>

		</div>
        );

}

export default InvitePage
