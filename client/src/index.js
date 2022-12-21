import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import "../node_modules/react-bootstrap/dist/react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

// // For GET requests
// axios.interceptors.request.use(
//   (req) => {
//      // Add configurations here
//      return req;
//   },
//   (err) => {
//      return Promise.reject(err);
//   }
// );

// // For POST requests
// axios.interceptors.response.use(
//   (res) => {
//      // Add configurations here
//      if (res.status === 201) {
//         console.log('Posted Successfully');
//      }
//      return res;
//   },
//   (err) => {
//      return Promise.reject(err);
//   }
// );

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

