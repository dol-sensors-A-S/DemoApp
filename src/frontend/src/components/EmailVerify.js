import React, { Fragment, useEffect } from "react";

const EmailVerify = () => {
    useEffect(() => {
        sessionStorage.setItem("email_verification_page", "true");
    }, []);

    return (
        <Fragment>
            <div className="flex items-center justify-center  bg-gray-100">
                <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
                    {/* Email Icon */}
                    <div className="flex justify-center mb-4">
                        <svg
                            className="w-16 h-16 text-dol-green"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M20.94 4.94H3.06c-1.2 0-2.06.86-2.06 2.06v10c0 1.2.86 2.06 2.06 2.06h17.88c1.2 0 2.06-.86 2.06-2.06v-10c0-1.2-.86-2.06-2.06-2.06zM12 12.65L3.92 7.06h16.16L12 12.65zm-7.88 6.16v-9.9l7.4 5.03c.17.12.38.18.58.18s.41-.06.58-.18l7.4-5.03v9.9H4.12z"></path>
                        </svg>
                    </div>

                    {/* Message Text */}
                    <h2 className="text-xl font-semibold text-gray-800">
                        Please verify your email address
                    </h2>
                    <p className="mt-2 text-gray-600">
                        We've sent a confirmation email. Please check your inbox and follow
                        the instructions to verify your account.
                    </p>
                </div>
            </div>
        </Fragment>
    )
}
export default EmailVerify;
