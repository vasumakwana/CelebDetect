import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import './Registration.css';

const Registration = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    const navigate = useNavigate();

    const handleRegistration = async (e) => {
        e.preventDefault();

        // Check if any required field is empty
        if (!name || !email || !password || !gender || !city || !country) {
            setRegistrationStatus('Please enter all required fields!');
            return;
        }

        try {
            // Register user
            const registrationResponse = await axios.post(process.env.REACT_APP_PRODLINK + '/register', {
                email: email,
                password: password,
                given_name: name,
            });

            const { statusCode, message } = registrationResponse.data;
            if (statusCode === 200 && message === 'User needs to be confirmed') {
                setRegistrationStatus(message);
                setShowVerificationModal(true);
            } else {
                setRegistrationStatus('User registration failed');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();

        try {
            // Verify user and store details
            const verificationResponse = await axios.post(process.env.REACT_APP_PRODLINK + '/verifycode', {
                email: email,
                verification_code: verificationCode,
                name: name,
                city: city,
                gender: gender,
                country: country,
            });

            const { statusCode, message } = verificationResponse.data;
            if (statusCode === 200 && message === 'User confirmed and details stored in DynamoDB') {
                setShowVerificationModal(false);
                navigate('/');
            } else {
                setRegistrationStatus('User verification failed');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container">
            <h2 className="title">Registration</h2>
            <form className="registration-form" onSubmit={handleRegistration}>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <input type="text" placeholder="Enter your gender" value={gender} onChange={(e) => setGender(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>City</label>
                    <input type="text" placeholder="Enter your city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Country</label>
                    <input type="text" placeholder="Enter your country" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <button type="submit" className="submit-button">
                    Register
                </button>
            </form>
            {registrationStatus && <p>{registrationStatus}</p>}
            {showVerificationModal && (
                <div className="verification-modal">
                    <div className="modal-content">
                        <h3>Verification Code</h3>
                        <form onSubmit={handleVerificationSubmit}>
                            <input
                                type="text"
                                placeholder="Enter verification code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}
            <p>
                Already have an account? <Link to="/">Log In</Link>
            </p>
        </div>
    );
};

export default Registration;
