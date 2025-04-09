import React, { Fragment, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Sensor from "../components/Sensor";
import { Link } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import useDocumentTitle from "../utils/documentTitle";
import Header from "../components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faCamera, faCogs, faCehck } from "@fortawesome/free-solid-svg-icons";
import { useAuth0 } from "@auth0/auth0-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDevicesRequest, fetchDevicesSuccess } from "../redux/actions";
import Loading from "../components/Loading";
import { motion, AnimatePresence } from 'framer-motion';
import CameraData from "../components/CameraData";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const TitleDevice = (device) => {
    return (
        <Fragment>
            <div className="text-center text-dol-blue">
                <h2 className=" text-2xl font-semibold">{device.device.deviceName}</h2>
                <h3>{device.device.deviceType}</h3>
            </div>
        </Fragment>
    )
}

const ModalError = (props) => {
    return (
        <div>
            <div className="bg-red-400 px-3 py-2 mb-2 rounded-xl w-full text-gray-700 border-solid border-2 border-red-500">
                An Error Occured {props.errorText.message}
            </div>
        </div>
    )
}

/* Show the status of a claim - popup */
const Modal = ({ status, toggleEdit, deviceMac, updateName, remove, deviceName }) => {
    /* State */
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('')

    /* Refs */
    const newDeviceNameRef = React.useRef();
    const newName = newDeviceNameRef;

    //Dispatch runs a method from Redux actions
    const dispatch = useDispatch();
    //React router redirection
    const navigate = useNavigate();

    const {
        getAccessTokenSilently
    } = useAuth0();

    //Open the popup if status changes
    useEffect(() => {
        if (status) {
            setModalOpen(true)
        }
    }, [status]);

    /* Trigger PUT changing name on Accept button click */
    const changeName = async () => {
        //Try to fetch only if new name is not empty
        if (newName.current.value !== "") {
            setLoading(true)
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`/api/devices/${deviceMac}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "deviceName": newName.current.value.toString() })
                })
                const result = await response.json();

                if (response.status === 200) {
                    toggleModal();
                    updateName(newName.current.value.toString());
                }

            } catch (error) {
                console.error("Error editting the name " + error);
                setError(true);
                setErrorText(error)
            } finally {
                dispatch(fetchDevicesSuccess());
            }
        }
    }

    /*
    Close the popup on click of an X button or cancel button
    And set states to false
    */
    const toggleModal = () => {
        setModalOpen(false)
        toggleEdit(false)
        setError(false) //If there is any error - reset
    }

    const deleteDevice = async () => {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`/api/devices/claim/${deviceMac}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                setModalOpen(false)
                toggleEdit(false)
                setError(false) //If there is any error - reset
            }

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
            dispatch(fetchDevicesSuccess());
            navigate("/dashboard")
        }
    }

    if (modalOpen) {
        if (!remove) {
            return (
                <div key={'modal'}>
                    <div id="modalOverlay" className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                            <button onClick={() => toggleModal()} className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold">&times;</button>
                            <h2 className="text-2xl font-semibold mb-4 text-dol-blue">Edit device</h2>
                            <div className="mb-4">

                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fname">
                                    New device name:
                                </label>
                                <input
                                    ref={newDeviceNameRef}
                                    placeholder="Enter device name" className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" id="fname" name="fname"></input>
                            </div>
                            {error &&
                                <ModalError errorText={errorText}></ModalError>
                            }

                            <div className="flex flex-wrap w-full justify-end">
                                <button onClick={() => changeName()} className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">Accept</button>
                                <button onClick={() => toggleModal()} className="ml-2 bg-red-500 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div key={'modal'}>
                    <div id="modalOverlay" className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                            <button onClick={() => toggleModal()} className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold">&times;</button>
                            <h2 className="text-2xl font-semibold mb-4 text-dol-blue">Delete device</h2>
                            <div className="mb-4">
                                {!loading ?
                                    <p>
                                        Are you sure you want to delete <span className="font-semibold text-dol-blue">{deviceName} </span>device?
                                    </p>
                                    :
                                    <p>Removing your device: {deviceName}</p>
                                }

                            </div>
                            {error &&
                                <ModalError errorText={errorText}></ModalError>
                            }
                            {!loading ?
                                <div className="flex flex-wrap w-full justify-end">
                                    <button onClick={() => deleteDevice()} className="bg-red-500 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">Delete</button>
                                    <button onClick={() => toggleModal()} className="ml-2 bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">Cancel</button>
                                </div>
                                :
                                <Loading></Loading>
                            }

                        </div>
                    </div>
                </div>
            )
        }

    }
}

const Message = (props) => {
    //Close message box
    const closeValidation = () => {
        props.closeMessage()
    }

    return (
        <div id="alert-1" className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-blue-50 dark:bg-green-100 dark:text-green-600" role="alert">
            <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM8.5 13.5l-3-3a1 1 0 0 1 1.4-1.4l2.1 2.1 4.6-4.6a1 1 0 0 1 1.4 1.4l-5.3 5.3a1 1 0 0 1-1.4 0Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div className="ms-3 text-sm font-medium">
                {props.message}
            </div>
            <button type="button" onClick={() => closeValidation()} className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-green-100 dark:text-green-600 dark:hover:bg-green-100" data-dismiss-target="#alert-1" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
            </button>
        </div>
    )
}

const CalibrationInfoModal = ({open, toggle, calibrationStatus}) => {
    const [calibrationInfoModal, setCalibrationInfoModal] = useState(false);

    useEffect(() => {
        setCalibrationInfoModal(open)
    }, [open]);

    const close = () => {
        toggle()
        // setCalibrationInfoModal(false)
        // open = false;
        // calibrationStatus = []
    }

    if (calibrationInfoModal) {
        return (
            <div key={'calibrationInfoModal'}>
                <div id="modalCalibrationOverlay" className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                        <h2 className="text-2xl font-semibold mb-4 text-dol-blue">Calibration info</h2>
                        <div className="mb-4">
                            {calibrationStatus.map((status, i) => (

                                <div className='p-3 my-2 bg-white rounded-lg shadow-xl' key={i}>
                                    <ul className="">
                                        <li className="flex">
                                            <p className="w-3/12 font-medium">Time: </p><p>{new Date(status.timeUtc).toLocaleString(navigator.language)}</p>
                                        </li>
                                        {status.visionStatus.calibration &&
                                            <li className="flex">
                                                <p className="w-3/12 font-medium">Status: </p><p> {status.visionStatus.calibration}</p>
                                            </li>
                                        }
                                        {status.visionStatus.calibrationUpdate &&
                                            <li className="flex">
                                                <p className="w-3/12 font-medium">Action: </p><p>{status.visionStatus.calibrationUpdate}</p>
                                            </li>
                                        }
                                        {status.visionStatus.messages != undefined && status.visionStatus.messages.length > 0 &&
                                            <li className="flex">
                                                <p className="w-3/12 font-medium">Reason: </p><p className="w-9/12">{status.visionStatus.messages != undefined && status.visionStatus.messages.length > 0 && status.visionStatus.messages[0].messageText}</p>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            ))
                            }
                        </div>

                        <div className="flex flex-wrap w-full justify-end">
                            <button onClick={() => close()} className="ml-2 bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">close</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const DetailsDevice = (props) => {
    const [edit, setEdit] = useState(false);
    const [remove, setRemove] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [calibrationMessage, setCalibrationMessage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [calibrationStatus, setCalibrationStatus] = useState(null);
    const [openCalibrationModel, setOpenCalibrationModel] = useState(false);
    const [calibrationStatusList, setCalibrationStatusList] = useState([]);
    const [imageDialogIsOpen, setImageDialogIsOpen] = useState(false);

    //Run redux actions
    const dispatch = useDispatch();

    const {
        getAccessTokenSilently
    } = useAuth0();

    const openCalibrationInformation = async (toggle) => {
        const token = await getAccessTokenSilently();
        const response = await fetch(`/api/devices/${props.devices.mac}/calibrationStatus`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        let result = await response.json();
        if (response.status === 200) {
            setCalibrationStatusList(result);
        }

        toggleCalibrationInfo();
    }

    const toggleCalibrationInfo = () => {
        setOpenCalibrationModel(!openCalibrationModel)
    }

    const editDevice = (edit, remove) => {
        setEdit(edit);
        setRemove(remove);
    }

    const getImage = async () => {
        setImageLoading(true);
        if (props.devices.mac) {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`/api/devices/${props.devices.mac}/image`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'image/png',
                    }
                });
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                setImageUrl(imageUrl);
                if (response.status === 200) {
                    setImageLoading(false);
                }

            } catch (error) {
                console.error(error)
            } finally {
            }
        }
    }

    const calibrateCamera = async () => {
        if (props.devices.mac) {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`/api/devices/${props.devices.mac}/calibrate`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                const result = await response.json();
                if (response.status === 200) {
                    setCalibrationMessage(result);
                }

            } catch (error) {
                console.error(error)
            } finally {
            }
        }
    }


    useEffect(() => {
        if (props.devices && props.devices.deviceType === "IDOL65" && props.devices.cameraStatus != null) {
            setCalibrationStatus(props.devices.cameraStatus.calibrationStatus);
        }
    }, [])

    /*
    When message is sent, fetch devices again
     */
    useEffect(() => {
        if (calibrationMessage !== null) {
            setCalibrationStatus("Started")
            const timer = setTimeout(() => {
                dispatch(fetchDevicesSuccess());
            }, 5000); // 5-second delay
            // Cleanup function to clear the timer if the component unmounts or calibrationMessage changes before the timer ends
            return () => clearTimeout(timer);
        }
    }, [calibrationMessage]);

    //Close calibration message
    const toggleMessage = () => {
        setCalibrationMessage(null);
    }

    const toggleImage = () => {
        setImageDialogIsOpen(!imageDialogIsOpen)
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-0 mb-4'>
            <div className='w-full py-8 mx-auto bg-white rounded-lg shadow-xl md:w-1/2'>
                <div className='max-w-sm px-4 mx-auto space-y-2'>
                    <div className="flex justify-between">
                        <h2 className="text-2xl font-bold text-dol-blue">Details</h2>
                        <div className="flex items-center">
                            <p className="mr-3">{props.devices.connectionState}</p>
                            <div>{props.devices.connectionState === "Connected" ? <DotDiv color={"green"} /> : <DotDiv color={"red"} />}</div>
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <ul className="">
                            <li className="flex">
                                <p className="w-5/12 font-medium">Device name:</p><p className="">
                                {props.devices.deviceName}
                                <FontAwesomeIcon
                                    className="text-dol-green"
                                    onClick={() => editDevice(true)}
                                    icon={faEdit} style={{ marginLeft: "8px" }} />
                            </p>
                            </li>
                            <li className="flex">
                                <p className="w-5/12 font-medium">Device type:</p><p className="">{props.devices.deviceType}</p>
                            </li>
                            <li className="flex">
                                <p className="w-5/12 font-medium">Key:</p><p>{props.devices.key}</p>
                            </li>
                            <li className="flex">
                                <p className="w-5/12 font-medium">Mac:</p><p>{props.devices.mac}</p>
                            </li>
                            <li className="flex">
                                <p className="w-5/12 font-medium">Firmware:</p><p>{props.devices.firmwareVersion}</p>
                            </li>
                            <li className="flex">
                                <p className="w-5/12 font-medium">Latest activity:</p><p>{new Date(props.devices.lastActivityUtc).toLocaleString("en-UK", { hour12: false })}</p>
                            </li>
                            {props.devices.deviceType === "IDOL65" && props.devices.cameraStatus != null &&
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Camera:</p>
                                    <p className={props.devices.cameraStatus.cameraDirty === "Dirty" ? 'text-red-600 font-medium' : ''}>{props.devices.cameraStatus.cameraDirty}</p>
                                </li>
                            }
                            {props.devices.deviceType === "IDOL65" && props.devices.cameraStatus != null &&
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Calibration:</p>
                                    <p className={calibrationStatus === "Required"
                                        ? 'text-red-600 font-medium'
                                        : (calibrationStatus === "Started")
                                            ? 'text-dol-blue font-medium'
                                            : (calibrationStatus === "Done")
                                                ? 'text-dol-green font-medium'
                                                : ''}>{calibrationStatus}</p>
                                    {calibrationStatus != "Done" &&
                                        <button className="underline ml-1" onClick={() => openCalibrationInformation(true)}>(see more)</button>
                                    }
                                </li>
                            }
                        </ul>
                        <div className="flex justify-end pt-3 max-w-sm mx-auto">
                            <button
                                disabled={!props.devices.isOnline && props.devices.sensors && props.devices.sensors.length > 0}
                                className="bg-transparent border-2 border-red-500 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-red-500 shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                                onClick={() => editDevice(true, true)}>
                                Delete
                                <FontAwesomeIcon icon={faTrash} style={{ marginLeft: "8px" }} />
                            </button>

                        </div>
                    </div>
                    <Modal remove={remove} status={edit} toggleEdit={editDevice} deviceMac={props.devices.mac} updateName={props.updateName} deviceName={props.devices.deviceName}></Modal>
                    <CalibrationInfoModal calibrationStatus={calibrationStatusList} toggle={toggleCalibrationInfo} open={openCalibrationModel}></CalibrationInfoModal>
                    <ToastContainer />
                </div>
            </div>
            {props.devices.deviceType === "IDOL65" &&
                <>

                    <div className='w-full py-8 mx-auto bg-white rounded-lg shadow-xl md:w-1/2 my-5'>
                        <div className='max-w-sm px-4 mx-auto space-y-2'>
                            <AnimatePresence>
                                {calibrationMessage &&
                                    (<motion.div
                                            layout
                                            variants={pageVariants} key="Manual"
                                            initial="initial"
                                            animate="in"
                                            exit="out"
                                        >
                                            <Message message={calibrationMessage} closeMessage={toggleMessage}></Message>
                                        </motion.div>
                                    )
                                }
                            </AnimatePresence>
                            <AnimatePresence>
                                {imageUrl &&
                                    (<motion.div
                                        layout
                                        variants={pageVariants} key="Manual"
                                        initial="initial"
                                        animate="in"
                                        exit="out"
                                    >
                                        <img src={imageUrl}
                                             alt="Fetched PNG from API"
                                             style={{ maxWidth: '100%' }}
                                             className="cursor-pointer"
                                             onClick={toggleImage} />

                                        {imageDialogIsOpen && (
                                            <div className="zoomed-image-container" onClick={toggleImage}>
                                                <img
                                                    className="image"
                                                    src={imageUrl}
                                                    onClick={toggleImage}
                                                    alt="no image"
                                                />
                                            </div>
                                        )}
                                    </motion.div>)
                                }
                            </AnimatePresence>
                            <div className="flex justify-center">
                                <button
                                    className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                                    onClick={() => getImage()}
                                    disabled={imageLoading}
                                >
                                    {imageLoading
                                        ?
                                        <div>Getting Image...</div>
                                        :
                                        <div className="flex items-center">
                                            <p>Get image </p>
                                            <FontAwesomeIcon icon={faCamera} style={{ marginLeft: "8px" }} />
                                        </div>
                                    }

                                </button>
                                <button
                                    className="bg-dol-green ml-2 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                                    onClick={() => {
                                        toast.info(
                                            <div className="flex flex-col">
                                                <span className="mb-2">Are you sure you want to calibrate the camera?</span>
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            calibrateCamera();
                                                            toast.dismiss();
                                                        }}
                                                        className="px-3 py-1 bg-dol-green text-white text-xs rounded hover:bg-green-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => toast.dismiss()}
                                                        className="px-3 py-1 bg-gray-300 text-gray-800 text-xs rounded hover:bg-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>,
                                            {
                                                autoClose: false,
                                                closeButton: false,
                                                position: "top-center",
                                                className: 'w-full max-w-s',
                                            }
                                        );
                                    }}
                                >
                                    Calibrate
                                    <FontAwesomeIcon icon={faCogs} style={{ marginLeft: "8px" }} />
                                </button>
                            </div>

                        </div>
                    </div>
                    {
                        <CameraData mac={props.devices.mac}></CameraData>
                    }
                </>
            }

        </div>
    )
}

const DotDiv = ({ color }) => {
    const baseClasses = "w-4 h-4 rounded-full";
    const colorClasses = color === "green" ? " bg-dol-green" : " bg-red-700";
    return (
        <div className={baseClasses + colorClasses}></div>
    )
}

const DevicePage = ({ }) => {

    //Copy from the sensor page so it uses URL parameters. To save the change immidiately after name update
    const { mac } = useParams(); //MacAddress from the URL
    const location = useLocation();
    const item = location.state || {};
    const [device, setDevice] = useState();
    const [deviceStatus, setDeviceStatus] = useState(null);
    const [stateName, setStateName] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);



    //Displays the new name instantly
    const updateNameInstantly = (name) => {
        if (name) {
            setStateName(name)
        }
    }


    /* Set document's title */
    //useDocumentTitle(device.deviceName);

    useEffect(() => {
        if(device && device.deviceName) {
            document.title = device.deviceName;
        }
    }, [device])

    useEffect(() => {
        if (stateName !== '') {
            item.deviceName = stateName
        }
    }, [stateName]);

    const {
        getAccessTokenSilently
    } = useAuth0();

    useEffect(() => {
        const getDetails = async () => {
            const apiURL = `/api/devices/${mac}`;
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(apiURL, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json();
                if (response.status === 200) {
                    setDevice(data);
                }

                const statusUrl = `/api/devices/${mac}/status`
                const statusResponse = await fetch(statusUrl, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const statusData = await statusResponse.json();
                if (statusResponse.status === 200) {
                    setDeviceStatus(statusData);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error occured: ' + error)
                setLoading(false);
            }
        };

        getDetails();
    }, [])


    return (
        <Fragment>
            <Container>
                <Row>
                    <Col>
                        {device &&
                            <div>
                                <Header title={device.deviceName} subtitle={device.deviceType} />
                                <DetailsDevice devices={device} updateName={updateNameInstantly} />
                            </div>
                        }
                        {loading &&
                            <Loading></Loading>
                        }
                        {device && device.length === 0 &&
                            <p>Item not found</p>
                        }
                        {device && deviceStatus && device.deviceType === "IDOL64" && (device.sensors.length !== 0 || device.wiredSensors.length !== 0) &&
                            <div>
                                <Sensor cardTitle="Sensors" isOnline={device.isOnline} items={device.sensors} wiredSensors={device.wiredSensors}  deviceStatus={deviceStatus ? deviceStatus : null} mac={device.mac}></Sensor>
                            </div>
                        }
                        {device && device.deviceType === "IDOL64" && device.isOnline &&
                            <div className="flex justify-center mb-4 gap-4">
                                {device.sensors.length === 0 &&
                                    <Link to={`/add/sensor/${device.mac}`}>
                                        <button className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">
                                            + Add sensor
                                        </button>
                                    </Link>}
                                <Link className="ml-2" to={`/add/wiredsensors/${device.mac}`}>
                                    <button className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">
                                        configure wired sensors
                                    </button>
                                </Link>
                            </div>
                        }
                        {device && device.deviceType === "IDOL64" && !device.isOnline &&
                            <div className="flex justify-center mb-4 gap-4">
                                {device.sensors.length === 0 &&
                                    <button disabled={true} className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">
                                        + Add sensor
                                    </button>
                                }
                                <button disabled={true} className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">
                                    configure wired sensors
                                </button>
                            </div>
                        }
                    </Col>
                </Row>
            </Container>
        </Fragment >
    )
}


export default DevicePage;