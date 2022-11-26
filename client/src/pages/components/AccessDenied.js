import { useState } from 'react'
import { isExpired, decodeToken } from "react-jwt";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function access_denied() {
  return (
    <h1>You are not authorized for accessing this page!</h1>
  );
}

export default access_denied;
