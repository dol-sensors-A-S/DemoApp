import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Submit from "./Submit";
import Loading from "../../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { fetchDevicesRequest, fetchDevicesSuccess } from "../../redux/actions";
import { Link, useNavigate } from "react-router-dom";

const ErrorMessage = ({ resMessage, closeError }) => {

    //Check if value of resMessage is an object because some errors are sent in a different way
    const checkObject = (value) => {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    return (
        <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div className="ms-3 text-sm font-medium">
                {checkObject(resMessage) ? resMessage.errors.DeviceName[0].toString() : resMessage}
            </div>
            <button type="button" onClick={() => closeError()} className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
            </button>
        </div>
    )
}

function Popup(device) {

    /* State */
    const [success, setSuccess] = useState(false);
    const { devices, error } = useSelector(state => state.devices); //Get devices from Redux state
    const [loading, setLoading] = useState(false);
    const [resMessage, setResMessage] = useState(null)


    /* Get a bearer token */
    const {
        getAccessTokenSilently
    } = useAuth0();

    //Handle route redirection
    const navigate = useNavigate();

    //Dispatch runs a method from Redux actions
    const dispatch = useDispatch();

    //Refs for the form
    const deviceNameRef = React.useRef();
    const keyRef = React.useRef();
    const deviceTypeRef = React.useRef();
    const macAddressRef = React.useRef();




    /* Handle form submission from a popup */
    const handleSubmit = async (event) => {
        event.preventDefault();

        /* Turn on loading right after submission */
        setSuccess("Loading");

        /* Attach value from the form and create an object */
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

        try {
            const token = await getAccessTokenSilently();
            console.log(JSON.stringify(formData))
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
                //Connect two arrays of existing sensors and a new one
                //const updatedDevices = [...devices, result]
                //Update global devices state
                //dispatch(fetchDevicesSuccess(updatedDevices));
                //Set message to success
                setSuccess(true);
                //Redirect to the details page
                navigate(`/devices/${macAddress}`);

            } else if (response.status === 400) {
                setResMessage(result)
                setSuccess(false)
            } else {
                setSuccess("Loading");
            }
        } catch (error) {
            console.error('Error: ', error)
        }
    }

    //Remove error message to close the error message
    const closeError = () => {
        setResMessage(null);
    }

    return (
        <>
            <div className="flex justify-center">
                <div className="z-20 bg-white rounded-xl shadow-xl w-[90%] max-h-max mx-auto inset-0 text-gray-600 p-4 py-8">
                    {(success === true) ?
                        <div>
                            Succesfully added a device {console.log(device)}
                            <Link to="/dashboard">
                                <button className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">
                                    Go to dashboard
                                </button>
                            </Link>
                        </div>
                        :
                        (success === false) ?
                            <div>
                                {resMessage &&
                                    <ErrorMessage resMessage={resMessage} closeError={closeError} />
                                }
                                <img></img>
                                <h2 className="text-xl mb-4">Name your <span className="font-semibold text-dol-blue">{device.device.DeviceType}</span> device</h2>
                                <div >
                                    <form onSubmit={handleSubmit}>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold" htmlFor="device-name-popup">Device name</label>
                                            <input
                                                ref={deviceNameRef}
                                                className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3" id="device-name-popup" type="text" placeholder="Enter device name" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold" htmlFor="device-macaddress">Mac address</label>
                                            <input
                                                ref={macAddressRef}
                                                value={device.device.MacAddress}
                                                disabled
                                                className="bg-transparent mb-3 appearance-none rounded-xl w-full py-3 px-3 text-gray-700 leading-tight" id="device-macaddress" type="text" placeholder={device.device.MacAddress} />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-bold" htmlFor="device-key">Key</label>
                                            <input
                                                ref={keyRef}
                                                value={device.device.Key}
                                                disabled
                                                className="bg-transparent mb-3 appearance-none rounded-xl w-full py-3 px-3 text-gray-700 leading-tight" id="device-key" type="text" placeholder={device.device.Key} />
                                        </div>
                                        <div className="hidden">
                                            <label htmlFor="device-type"></label>
                                            <input
                                                ref={deviceTypeRef}
                                                value={device.device.DeviceType}
                                                disabled
                                                hidden
                                                className="hidden" id="device-type" type="text" />
                                        </div>
                                        <Submit />
                                    </form>
                                </div>
                            </div>
                            :
                            <Loading></Loading>
                    }

                </div>
            </div>

        </>

    )
}

export default Popup