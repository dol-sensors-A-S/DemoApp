import React, { Fragment, useEffect } from "react";
import Hero from "../components/Hero";
import Content from "../components/Content";
import Dashboard from "./Dashboard";
import { useAuth0 } from "@auth0/auth0-react";
import EmailVerify from "../components/EmailVerify";

const Home = () => {
  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout
  } = useAuth0();
  useEffect(() => {
    const wasOnEmailVerify = sessionStorage.getItem("email_verification_page");

    if (wasOnEmailVerify && isAuthenticated) {
      console.log("User refreshed on EmailVerify, logging out...");
      setTimeout(() => {
        sessionStorage.removeItem("email_verification_page");
        logout({
          logoutParams: {
            returnTo: window.location.origin,
          }
        });
      },10000);
    }
  }, [isAuthenticated, logout]);
  if (isAuthenticated && !user.email_verified) {
    return(
        <Fragment>
          <EmailVerify></EmailVerify>
        </Fragment>
    )
  } else if (isAuthenticated) {
    return (
        <Fragment>

          <Dashboard />
        </Fragment>
    )
  } else {
    return (
        <Fragment>
          <div className="flex flex-col w-full items-center">
            <div className="flex justify-center w-1/2">
              <button
                  onClick={() => loginWithRedirect()}
                  className="mt-4 w-1/2 shadow bg-dol-green focus:shadow-outline focus:outline-none text-white font-bold py-3 px-4 rounded-xl"
              >
                Log in
              </button>
            </div>
          </div>

        </Fragment>
    )
  }
};

export default Home;
