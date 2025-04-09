import React from 'react';
import { useNavigate } from 'react-router-dom';

const GoBack = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate("/dashboard");
    };

    return (
        <div className="absolute -left-10 flex items-center cursor-pointer" onClick={() => handleBackClick()}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
        </div>
    );
};

export default GoBack;