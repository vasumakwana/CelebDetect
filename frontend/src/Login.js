import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setErrorMessage('Please enter login and password fields!');
            return;
        }

        try {
            const response = await axios.post(process.env.REACT_APP_PRODLINK + '/login', {
                email,
                password,
            });

            const { statusCode, token } = response.data;
            if (statusCode === 200) {
                if (localStorage.getItem('token') !== null) {
                    localStorage.setItem('email', email);
                    navigate('/home');
                }
                else {
                    localStorage.setItem('token', token);
                    localStorage.setItem('email', email);
                    navigate('/home');
                }
            }
            else {
                setErrorMessage('Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('Invalid credentials');
        }
    };

    return (
        <div className="container">
            <div className="login-form">
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
                <center>{errorMessage && <p className="error-message">{errorMessage}</p>}</center>
            </div>
            <p>
                Don't have an account? <Link to="/registration">Sign Up</Link>
            </p>
        </div>
    );
};

export default Login;
