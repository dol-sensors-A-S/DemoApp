import React, { Fragment, useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Submit from "./Submit";
import { motion, AnimatePresence } from 'framer-motion';
import QR from "./QR";
import { fetchDevicesRequest, fetchDevicesSuccess } from "../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Row, Col, Table } from "reactstrap";
import { Link, redirect, useNavigate } from "react-router-dom";


{/*
    {"macAddress":"000ecd02c138", "key":"QotLPSNd", "deviceType":"IDOL64"}
    */}

//Animation for a component mount (switch between manual and qr code)
const animateManual = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
}

const fadeInDown = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.5 }
};

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
};

const pageVariants = {
    initial: {
        opacity: 0,
        x: "-50px"
    },
    in: {
        opacity: 1,
        x: 0
    },
    out: {
        opacity: 0,
        x: "50px"
    }
};



function Buttons(handler) {
    return (
        <div className="flex justify-between mb-4 mt-1 max-w-lg md:px-4 sm:w-full text-dol-blue font-semibold mx-auto">
            <button className={`grow py-2 ${handler.handler.isQR === "Manual" ? 'border-b-4 border-dol-green' : ''}`} onClick={() => handler.handler.changeScreen("Manual")}> Enter manually</button>
            <button className={`grow py-2 ${handler.handler.isQR === "QR" ? 'border-b-4 border-dol-green' : ''}`} onClick={() => handler.handler.changeScreen("QR")}>Scan QR code</button>
        </div>

    )
}

function Form() {

    //Dispatch runs a method from Redux actions
    const dispatch = useDispatch();

    //Handle route redirection
    const navigate = useNavigate();

    const {
        getAccessTokenSilently
    } = useAuth0();

    /*State */
    const [open, setOpen] = useState(false);
    const [message, setMesssage] = useState('');
    const [response, setResponse] = useState();
    const [resMessage, setResMessage] = useState();
    const [errorMes, setErrorMes] = useState(null);
    const [errors, setErrors] = useState({ name: null, key: null, mac: null });
    const [loading, setLoading] = useState(false)

    //Refs
    const deviceNameRef = React.useRef();
    const keyRef = React.useRef();
    const deviceTypeRef = React.useRef();
    const macAddressRef = React.useRef();

    //Close an error
    const closeError = () => {
        setResMessage(null)
    }

    //Close validation box
    const closeValidation = (button) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            [button]: ""
        }));
        setErrorMes(null)
    }

    const handleValidation = (name, key, mac) => {
        //Set new object for errors
        let newErrors = {};
        //Set error messages for each field
        if (name.length < 5) {
            newErrors.name = 'Name should be minimum 5 characters long';
        }
        if (key === "") {
            newErrors.key = "Key cannot be empty"
        }
        if (mac === "") {
            newErrors.mac = "Mac address cannot be empty"
        }

        setErrors(newErrors);
        // True if no errors
        return Object.keys(newErrors).length === 0;
    }

    //Check if value is an object because some errors are sent in a different way
    const checkObject = (value) => {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }


    const handleSubmit = async (event) => {

        event.preventDefault();

        const deviceName = deviceNameRef.current.value;
        const key = keyRef.current.value
        const deviceType = deviceTypeRef.current.value
        const macAddress = macAddressRef.current.value

        const formData = {
            "DeviceType": deviceType,
            "Key": key,
            "MacAddress": macAddress,
            "DeviceName": deviceName
        }
        //Validate form on frontend. Prevent fetching if fields are empty
        const formValid = handleValidation(deviceName, key, macAddress);

        if (formValid) {
            setLoading(true);
            try {
                const token = await getAccessTokenSilently();

                const response = await fetch('/api/devices/claim', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                })
                const result = await response.json();
                if (response.status === 200) {
                    /*
                    Dispatch so it refetches in the background so
                    sensors are immidiately shown on the dashboard
                     */
                    //dispatch(fetchDevicesSuccess());
                    setResponse(response.status);
                    //Redirect to the details page
                    navigate(`/devices/${macAddress}`);
                }
                else {
                    setOpen(false);
                    setResponse(response.status);
                    setLoading(false);
                    setResMessage(result)
                    console.log(result)
                }
            } catch (error) {
                console.error('Error: ', error)
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false)
        }
    }

    return (
        <Fragment>
            <form onSubmit={handleSubmit} className="bg-white px-4 pt-6 pb-14 mb-4">
                <div className="mb-4">
                    {resMessage &&
                        <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
                            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div className="ms-3 text-sm font-medium">
                                {/* {!errorMes ? resMessage : resMessage.errors.MacAddress[0].toString()} */}
                                {checkObject(resMessage) ? resMessage.errors.MacAddress[0].toString() : resMessage}
                            </div>
                            <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                                <span className="sr-only">Close</span>
                                <svg className="w-3 h-3" onClick={() => closeError()} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                    }
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="device-name">
                        Device name
                    </label>
                    <input
                        ref={deviceNameRef}
                        className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="device-name" type="text" placeholder="Enter device name"
                        onFocus={() => closeValidation("name")}
                    />
                    {errors.name &&
                        <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
                            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div className="ms-3 text-sm font-medium">
                                {errors.name}
                            </div>
                            <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                                <span className="sr-only">Close</span>
                                <svg className="w-3 h-3" onClick={() => closeValidation("name")} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                    }
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="device-key">
                        Key
                    </label>
                    <input
                        ref={keyRef}
                        className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="device-key" type="text" placeholder="Enter device key"
                        onFocus={() => closeValidation("key")}
                    />
                    {errors.key &&
                        <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
                            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div className="ms-3 text-sm font-medium">
                                {errors.key}
                            </div>
                            <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                                <span className="sr-only">Close</span>
                                <svg className="w-3 h-3" onClick={() => closeValidation("key")} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                    }
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="device-type">
                        Device type
                    </label>
                    <div className="relative">
                        <select
                            ref={deviceTypeRef}
                            className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="device-type" type="text" placeholder="Choose device type">
                            <option value={"IDOL64"}>iDOL64</option>
                            <option value={"IDOL65"}>iDOL 65</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center py-2 px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mac-address">
                        Mac address
                    </label>
                    <input
                        ref={macAddressRef}
                        className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="mac-address" type="text" placeholder="Enter mac address"
                        onFocus={() => closeValidation("mac")}
                    />
                    {errors.mac &&
                        <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
                            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div className="ms-3 text-sm font-medium">
                                {errors.mac}
                            </div>
                            <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                                <span className="sr-only"  >Close</span>
                                <svg className="w-3 h-3" onClick={() => closeValidation("mac")} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                    }
                </div>

                <Submit loading={loading} />
            </form>
            <Modal open={open} status={response} />
        </Fragment>
    )
}

/* Show the status of a claim - popup */
const Modal = ({ open, status }) => {

    /* State */
    const [modalOpen, setModalOpen] = useState(false);

    //Open the popup if status changes
    useEffect(() => {
        if (open) {
            setModalOpen(true)
        }
    }, [open])

    //Close the popup on click of a button
    const toggleModal = () => {
        setModalOpen(false)
    }

    if (modalOpen && status === 200) {
        return (
            <div key={'modal'}>
                <div id="modalOverlay" className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                        <button onClick={() => toggleModal()} className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold">&times;</button>
                        <h2 className="text-2xl font-semibold mb-4">Success</h2>
                        <p className="mb-4">Device added Succesfully</p>
                        <div className="flex flex-wrap w-full justify-between md:w-2/3">
                            <Link to={"/add/devices"} >
                                <button id="closeModalBtn" className="px-4 py-2 bg-dol-green text-white rounded">Add device</button>
                            </Link>
                            <Link to={"/dashboard"}>
                                <button id="closeModalBtn" className="px-4 py-2 bg-dol-green text-white rounded">Dashboard</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const AddDevice = ({ }) => {

    const [isQR, setQR] = useState("Manual");

    function changeScreen(x) {
        setQR(x);
    }


    return (
        <Fragment>
            <div className="md:w-full md:flex md:flex-col items-center">
                <Buttons className="w-full" handler={{ changeScreen, isQR }} />
                <div className="max-w-lg md:w-full mx-auto">
                    <div className="text-center pb-4">
                        <h1 className="text-dol-blue font-semibold text-xl">Add your device</h1>
                        <h2 className="text-dol-blue">
                            {isQR === "Manual" ?
                                "Enter data from a device's sticker"
                                :
                                "Scan a QR code placed on your device"
                            }
                        </h2>
                    </div>
                    <AnimatePresence>
                        {isQR === "Manual" &&
                            (<motion.div
                                    layout
                                    variants={pageVariants} key="Manual"
                                    transition={pageTransition}
                                    initial="initial"
                                    animate="in"
                                    exit="out"
                                >
                                    <Form />
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                    <AnimatePresence>
                        {isQR === "QR" &&
                            (<motion.div
                                    layout
                                    variants={pageVariants}
                                    transition={pageTransition}
                                    key="QR"
                                    initial="initial"
                                    animate="in"
                                    exit="out"
                                >
                                    <QR page={isQR} />
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                </div>
            </div>
        </Fragment>
    )
}


export default AddDevice;

