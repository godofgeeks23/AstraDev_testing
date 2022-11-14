import React, { useEffect, useState } from 'react'
import '../App.css'
import Cookies from 'js-cookie';
import Access_denied from './components/AccessDenied';

const ManagerPanel = (props) => {

    const [hasAccess, setHasAccess] = useState(null);

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
    if (hasAccess)
        return (
            <div className="login_container p-5 m-5 bg-dark">
                <h1 className="text-center p-3">You are seeing this page because you are a Allowed</h1>
            </div>
        );
    
}

export default ManagerPanel
