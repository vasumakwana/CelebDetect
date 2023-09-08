import React, { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [showSubmit, setShowSubmit] = useState(false);
    const [tempImage, setTempImage] = useState(null); // Separate state for temporary image storage
    const token = localStorage.getItem('token');
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [tokenVerificationError, setTokenVerificationError] = useState('');
    const navigate = useNavigate();
    const [data, setData] = useState({});
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        setTempImage(file);
        setShowSubmit(true);
    };

    const handleFileUpload = (e) => {
        setIsDataFetched(false)
        const file = e.target.files[0];
        const imageFiles = file.type.startsWith('image/');

        if (!imageFiles) {
            setErrorMessage('Only image files are allowed.');
            setShowSubmit(false);
        } else {
            setErrorMessage('');
            setTempImage(file);
            setShowSubmit(true);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(process.env.REACT_APP_PRODLINK + '/logout', {
                token,
            });
            const { statusCode, message } = response.data;
            if (statusCode === 200 && message === 'Logout successful') {
                localStorage.removeItem('token');
                navigate('/');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!tempImage) {
            return; // No file to upload
        }
        setIsUploading(true);
        const reader = new FileReader();

        reader.onloadend = async () => {
            // Image is read successfully, now make the API call
            try {
                const image_data = reader.result.split(',')[1]; // Extract base64-encoded image data
                const image_name = tempImage.name;

                const requestBody = {
                    image_data,
                    image_name,
                };
                console.log("Request body:" + requestBody);
                if (requestBody != null) {
                    await axios.post(
                        process.env.REACT_APP_PRODLINK + '/upload',
                        requestBody
                    ).then(response => {
                        console.log(response.data.body);
                        const responseData = JSON.parse(response.data.body); // Parse the JSON string
                        setData(responseData);
                        setIsDataFetched(true);
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsUploading(false); // Reset the upload state
            }
        };
        reader.readAsDataURL(tempImage);

        // Hide the submit button
        setShowSubmit(false);
    };

    useEffect(() => {
        document.body.style.overflowY = 'hidden';
        const token = localStorage.getItem('token');

        // Function to verify the token when the component mounts
        const verifyToken = async () => {
            if(!token) {
                navigate('/')
            }
            try {
                const response = await axios.post(process.env.REACT_APP_PRODLINK + '/verifytoken', {
                    token,
                });

                const { statusCode, message } = response.data;
                if (statusCode === 200 && message === 'Token verified successfully') {
                    setIsTokenValid(true);
                } else {
                    setIsTokenValid(false);
                    setTokenVerificationError('Token verification failed');
                }
            } catch (error) {
                console.error(error);
                setIsTokenValid(false);
                setTokenVerificationError('Error verifying token');
            }
        };

        verifyToken().then();

        return () => {
            document.body.style.overflowY = 'auto';
        };
    });

    return (
        <div className="dashboard">
            <div className="header">
                <div className="header-shade">
                    <h2 className="header-text">CelebDetect</h2>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            {!isTokenValid && <p className="error-message">{tokenVerificationError}</p>}
            {isTokenValid && (
            <div className="upload-area" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                <p className="upload-text">Drag and drop files here</p>
                <input type="file" id="file-upload" className="file-upload" onChange={handleFileUpload} accept="image/*" />
                <label htmlFor="file-upload" className="upload-button">
                    Upload File
                </label>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {tempImage && (
                    <div className="uploaded-image-wrapper">
                        <div className="uploaded-image-card">
                            <img src={URL.createObjectURL(tempImage)} alt="Uploaded" className="uploaded-image" />
                            {isDataFetched && (
                                <p className="uploaded-image-text">The image is of {data.NameFromResponse}</p>
                            )}
                        </div>
                    </div>
                )}
                {showSubmit && (
                    <button className="submit-button" onClick={handleUploadSubmit}>
                        Submit
                    </button>
                )}
            </div>
            )}
            <div className="footer">
                <p className="footer-text">CelebDetect</p>
                <p className="copyright">
                    &copy; {new Date().getFullYear()} All rights reserved. CelebDetect.
                </p>
            </div>
        </div>
    );
};

export default Home;
