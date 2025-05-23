import React from "react";
import { Nav, NavItem, NavLink } from "reactstrap"
import { NavLink as RouterNavLink } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";


const BottomNav = () => {

    const {
        isAuthenticated,
    } = useAuth0();

    const location = useLocation();
    if (isAuthenticated) {
        return (
            <Nav id="bottom-nav" className="md:hidden fixed bottom-0 left-0 z-20 w-full h-16 bg-white  dark:bg-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <NavItem className="mb-0 w-1/3">
                    <NavLink
                        className='mb-0 w-full p-0 h-full'
                        tag={RouterNavLink}
                        to="/export"
                    >
                        <button type="button" className='focus:outline-none inline-flex h-full flex-col items-center justify-center px-5 group w-full'>
                            <svg className="w-6 h-6 mb-1 " fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
                            </svg>
                            <span className="text-sm">Export</span>
                        </button>
                    </NavLink>
                </NavItem>
                <NavItem className="mb-0 w-1/3 ">
                    <NavLink
                        className='mb-0 w-full p-0 h-full focus-visible:outline-none focus:border-0'
                        tag={RouterNavLink}
                        to="/dashboard"
                    >
                        <button type="button" className='focus:border-0 focus:outline-none inline-flex h-full flex-col items-center justify-center px-5 group w-full'>
                            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                            </svg>
                            <span className="text-sm ">Dashboard</span>
                        </button>
                    </NavLink>
                </NavItem>
                <NavItem className="mb-0 w-1/3">
                    <NavLink
                        className='mb-0 w-full p-0 h-full'
                        tag={RouterNavLink}
                        to="/profile"
                    >
                        <button type="button" className="focus:outline-none inline-flex flex-col items-center justify-center px-5 h-full mx-auto w-full">
                            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path clipRule="evenodd" fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"></path>
                            </svg>
                            <span className="text-sm ">Profile</span>
                        </button>
                    </NavLink>
                </NavItem>
            </Nav>
        )
    } else {
        return (
            <div>
                
            </div>
        )
    }

}

export default BottomNav