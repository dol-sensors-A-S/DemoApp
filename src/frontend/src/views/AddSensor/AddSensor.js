import React, { Fragment, useState, useEffect } from "react";
import { useParams, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import SubmitSensor from "./SubmitSensor";
import { motion, AnimatePresence } from 'framer-motion';
import QRsensor from "./QRsensor";
import { Link, useNavigate } from "react-router-dom";
import { fetchDevicesSuccess } from "../../redux/actions";
import { useDispatch } from "react-redux";
import sensorTypes from "./sensorTypes";


{/* DevEUI
    Name
    SensorType - dropdown
    Samplerate?
    MacAddress - Coming from the device
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
        <div className="flex justify-between mb-4 mt-1 max-w-lg md:px-4 w-full text-dol-blue font-semibold">
            <button className={`grow py-2 ${handler.handler.isQR === "Manual" ? 'border-b-4 border-dol-green' : ''}`} onClick={() => handler.handler.changeScreen("Manual")}> Enter manually</button>
            <button className={`grow py-2 ${handler.handler.isQR === "QR" ? 'border-b-4 border-dol-green' : ''}`} onClick={() => handler.handler.changeScreen("QR")}>Scan QR code</button>
        </div>

    )
}



function Form({ mac }) {
    //Get authentication token
    const {
        getAccessTokenSilently
    } = useAuth0();

    const dispatch = useDispatch();

    const navigate = useNavigate();


    /* State */
    const [errors, setErrors] = useState({ name: null, eui: null });
    const [loading, setLoading] = useState(false);
    const [resMessage, setResMessage] = useState();
    const [open, setOpen] = useState(false)

    //Refs
    const sensorNameRef = React.useRef();
    const devEuiRef = React.useRef();
    const sensorTypeRef = React.useRef();
    const macAddressRef = React.useRef();

    const handleValidation = (name, eui) => {
        setLoading(true);
        //Set new object for errors
        let newErrors = {};
        //Set error messages for each field
        if (name.length <= 3) {
            newErrors.name = 'Name should be minimum 3 characters long';
        }
        if (eui === "") {
            newErrors.eui = "DevEui cannot be empty"
        }
        setErrors(newErrors);
        // True if no errors
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const sensorName = sensorNameRef.current.value;
        const devEui = devEuiRef.current.value
        const sensorType = sensorTypeRef.current.value
        const macAddress = macAddressRef.current.value

        const formData = {
            "DevEui": devEui,
            "Name": sensorName,
            "SensorType": sensorType,
            "SampleRate": 300
        }
        //frontend form validation
        const formValid = handleValidation(sensorName, devEui);
        console.log(macAddress)
        if (formValid) {
            setLoading(true)
            try {
                const token = await getAccessTokenSilently();

                const response = await fetch(`/api/sensors/${macAddress}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                })
                const result = await response.json();
                if (response.status === 200) {
                    dispatch(fetchDevicesSuccess());
                    setOpen(true);
                    navigate(`/devices/${macAddress}/sensors/${devEui}`)
                } else {
                    setLoading(false);
                    setOpen(false);
                    console.log(result)
                    if (result === '') {
                        setResMessage("There was an error")
                    } else {
                        setResMessage(result);
                    }

                }
            } catch (error) {
                console.error('Error: ', error)
                setResMessage("There was an error")
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }

    }

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
    }

    return (
        <Fragment>
            <form onSubmit={handleSubmit} className="bg-white px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    {resMessage &&
                        <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
                            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div className="ms-3 text-sm font-medium">
                                {resMessage}
                            </div>
                            <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                                <span className="sr-only">Close</span>
                                <svg className="w-3 h-3" onClick={() => closeError()} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                    }
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sensor-name">
                        Sensor name
                    </label>
                    <input
                        ref={sensorNameRef}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="device-name" type="text" placeholder="Enter sensor name"
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
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sensor-deveui">
                        devEui
                    </label>
                    <input
                        ref={devEuiRef}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="device-key" type="text" placeholder="Enter devEUI"
                        onFocus={() => closeValidation("eui")}
                    />
                    {errors.eui &&
                        <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
                            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div className="ms-3 text-sm font-medium">
                                {errors.eui}
                            </div>
                            <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                                <span className="sr-only">Close</span>
                                <svg className="w-3 h-3" onClick={() => closeValidation("eui")} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                    }
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sensor-type">
                        Sensor type
                    </label>
                    <div className="relative">
                        <select
                            ref={sensorTypeRef}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="device-type" type="text" placeholder="Choose device type">
                            {sensorTypes.map((sensor, index) => (
                                <option value={sensor.type} key={index}>{sensor.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center py-2 px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <input
                        hidden
                        disabled
                        value={mac}
                        ref={macAddressRef}
                    />
                </div>
                <SubmitSensor loading={loading} />
            </form>
            <Modal open={open}></Modal>
        </Fragment>
    )
}

const CheckmarkIcon = ({ size = 24, color = "green", className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 9l-4.5 4.5L8 11" />
    </svg>
);

/* Show the status of a claim - popup */
const Modal = ({ open }) => {
    /* State */
    const [modalOpen, setModalOpen] = useState(false);
    useEffect(() => {
        if (open) {
            setModalOpen(true)
        }
    }, [open])

    const toggleModal = () => {
        setModalOpen(false)
    }

    if (modalOpen) {
        return (
            <div key={'modal'}>
                <div id="modalOverlay" className="fixed w-screen inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                        <button onClick={() => toggleModal()} className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold">&times;</button>
                        <h2 className="text-2xl font-semibold mb-4">Success </h2>
                        <div className="flex">
                            <p className="mb-4 mr-4">Sensor added Succesfully </p>
                            <CheckmarkIcon></CheckmarkIcon>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}


const AddSensor = ({ }) => {

    const [isQR, setQR] = useState("Manual");

    function changeScreen(x) {
        setQR(x);
    }

    const { slug } = useParams();

    return (
        <Fragment>
            <div className="w-full flex flex-col items-center ">
                <Buttons className="w-full" handler={{ changeScreen, isQR }} />
                <div className="max-w-lg w-full px-2 md:p-0">
                    <div className="text-center pb-4">
                        <h1 className="text-dol-blue font-semibold text-xl">Add your sensor</h1>
                        <h2 className="text-dol-blue">
                            {isQR === "Manual" ?
                                "Enter data from a device's sticker"
                                :
                                "Scan a QR code placed on your device"
                            }
                        </h2>
                    </div>
                    <AnimatePresence mode="wait">
                        {isQR === "Manual" &&
                            (<motion.div layout
                                         variants={pageVariants} key="Manual"
                                         transition={pageTransition}
                                         initial="initial"
                                         animate="in"
                                         exit="out"
                                >
                                    <Form mac={slug} />
                                </motion.div>
                            )
                        }

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
                                    <QRsensor page={isQR} mac={slug} />
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                </div>
            </div>
        </Fragment>
    )




}


export default AddSensor;

