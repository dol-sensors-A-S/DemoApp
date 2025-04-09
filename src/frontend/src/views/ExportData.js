import React, { Fragment, useEffect, useState } from "react";
import { Button, Container, Row, Col, Table } from "reactstrap";
import Header from "../components/Header";
import Device from "../components/Device";
import { useFetchDevices } from "../components/FetchDevices";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { fetchDevices } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import useDocumentTitle from "../utils/documentTitle";
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import Spinner from '../utils/Spinner'



const Title = () => {
    return (
        <div className="w-full h-32 flex flex-col  justify-start items-center">
            <div className="">
                <svg className="w-full h-16 text-dol-blue" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 3v4a1 1 0 0 1-1 1H5m4 10v-2m3 2v-6m3 6v-3m4-11v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z" />
                </svg>
            </div>
            <div className="text-dol-blue font-semibold">
                You can export sensor data to a CSV file
            </div>
        </div>
    )

}

const Error = ({ closeValidation }) => {
    return (
        <div>
            <div id="alert-1" className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-blue-50 dark:bg-red-100 dark:text-red-600" role="alert">
                <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div className="ms-3 text-sm font-medium">
                    Please choose a device
                </div>
                <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8 dark:bg-red-100 dark:text-red-600 dark:hover:bg-red-100" data-dismiss-target="#alert-1" aria-label="Close">
                    <span className="sr-only">Close</span>
                    <svg className="w-3 h-3" onClick={() => closeValidation()} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                </button>
            </div>
        </div>
    )
}


const DatePicker = ({ submitted, handleLoading }) => {
    const [value, setValue] = useState([new Date(), new Date()]);
    const [deviceMac, setDeviceMac] = useState('');
    const [sensorEui, setSensorEui] = useState('all');
    const [error, setError] = useState(null);
    const [nonValid, setNonValid] = useState(false);
    const [exportAll, setExportAll] = useState(false);

    /* Get a bearer token */
    const {
        getAccessTokenSilently
    } = useAuth0();

    /* Close error called from Error component */
    const closeValidation = () => {
        setNonValid(false)
    }

    //Method called from DevicePicker to get mac address and update current state
    const updateMac = (mac) => {
        setDeviceMac(mac);
    }
    //Method called from DevicePicker to get selected sensor's devEui and update current state
    const updateDevEui = (devEui) => {
        setSensorEui(devEui)
    }

    const handleExportAll = () => {
        setExportAll(!exportAll)
    }

    useEffect(() => {
        const exportDataApi = async () => {
            if (deviceMac !== "" || exportAll) {
                console.log(value)
                const token = await getAccessTokenSilently();
                let apiURL = '';
                //If checkbox is checked - export all data
                if (!exportAll && sensorEui === "all") {
                    console.log("I am getting a Device")
                    apiURL = `/api/data/${deviceMac}/export`
                } else if (sensorEui !== null && sensorEui !== "all") {
                    apiURL = `/api/data/${deviceMac}/${sensorEui}/export`
                    console.log("I am getting a Sensor")
                } else {
                    console.log("I am getting all")
                    apiURL = `/api/data/export`
                }
                fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'text/csv',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "startTime": new Date(value[0].setHours(0, 0, 0, 0)).toISOString(),
                        "endTime": value[1].toISOString()
                    })
                })
                    .then(response => {
                        //Continue only if response was 200
                        if (response.status === 200) {
                            //Get the file name
                            const contentDisposition = response.headers.get('Content-Disposition');
                            let filename = `${deviceMac}.csv`;//Fallback in case filename isn't provided
                            if (contentDisposition && contentDisposition.includes('filename')) {
                                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                                if (filenameMatch && filenameMatch[1]) {
                                    filename = filenameMatch[1].replace(/['"]/g, ''); // Clean quotes
                                }
                            }
                            return response.blob().then(blob => ({blob, filename}));
                        } else {
                            throw new Error(`Error ${response.status}`);
                        }
                    }) //Handle response as blob
                    .then(({blob, filename}) => {
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute('download', filename);
                        document.body.appendChild(link);
                        link.click();
                        //clean up
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        link.remove();
                    })
                    .catch((error) => {
                        console.error("Error fetching the file:", error);
                        setError(error.message);
                        handleLoading(false);
                    })
                    .finally(() => {
                        console.log('finally')
                        handleLoading(false, false);
                    })
            } else {
                const newDate = new Date(value[0].setHours(0, 0, 0, 0));
                setNonValid(true);
                console.log(value)
                handleLoading(false);
            }

        }
        if (submitted) {
            exportDataApi()
        }
    }, [submitted, handleLoading])

    return (
        <div className="w-full flex flex-col justify-center items-center justify-items-center">
            <DateRangePicker format="dd-MM-y" clearIcon={null} calendarProps={{ calendarType: "iso8601" }} onChange={setValue} value={value} className={"font-semibold bg-white border-0 max-w-md w-full min-w-40 p-3 shadow-[0_3px_10px_rgb(0,0,0,0.2)] rounded-xl"} />
            <DevicePicker onUpdateDevEui={updateDevEui} onUpdateMac={updateMac} handleExportAll={handleExportAll}></DevicePicker>
            {nonValid &&
                <Error closeValidation={closeValidation} />
            }
        </div>
    )
}

const DevicePicker = ({ onUpdateMac, handleExportAll, onUpdateDevEui }) => {
    /* 
    Get available devices
    */
    const { devices } = useSelector(state => state.devices);
    const { details } = useSelector(state => state.details);
    const [selectedDevice, setSelectedDevice] = useState(undefined);
    const [chosenDevice, setChosenDevice] = useState(null);
    const [checkedAll, setCheckedAll] = useState(false);

    console.log(details)

    /* 
    Get value from a dropdown and udpate parent's (DatePicker) state
    */
    const handleChange = (event) => {
        setSelectedDevice(event.target.value);
        onUpdateMac(event.target.value);
        if (event.target.value) {
            findDevice(event.target.value)
        }
    }
    //Sensor dropdown
    const handleSensorSelect = (event) => {
        console.log(event.target.value)
        onUpdateDevEui(event.target.value)
    }

    const findDevice = (macAddress) => {
        const device = details.find((device) => device.mac === macAddress);
        setChosenDevice(device);
        //Reset chosen sensor when new device is selected
        onUpdateDevEui("all");
    }

    const exportAll = () => {
        handleExportAll();
        setCheckedAll(!checkedAll);
    }



    return (
        <div className="w-full flex flex-col justify-center items-center mt-4">
            <p className="text-dol-blue font-medium p-2">
                Device
            </p>
            {devices &&
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-md relative inline-block text-dol-blue font-semibold">
                        <select value={selectedDevice} onChange={handleChange} disabled={checkedAll} className="block appearance-none w-full p-3 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                            <option value="">Choose a device</option>
                            {devices.map((device, index) => (
                                <option
                                    key={index}
                                    value={device.macAddress}
                                >
                                    {device.name}
                                </option>
                            ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dol-blue ">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM135 241c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l87 87 87-87c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 345c-9.4 9.4-24.6 9.4-33.9 0L135 241z"></path>
                            </svg>
                        </div>
                    </div>
                    {selectedDevice &&
                        <div className="w-full flex flex-col">
                            <div className="flex justify-center pt-4">
                                <p className="text-dol-blue font-medium p-2">Sensor</p>
                            </div>
                            <div className="mx-auto w-full max-w-md relative inline-block text-dol-blue font-semibold">
                                <select onChange={handleSensorSelect} disabled={checkedAll} className="block appearance-none w-full p-3 rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                                    <option value="all">All sensors</option>
                                    {chosenDevice.sensors && chosenDevice.sensors.map((device, index) => (
                                        <option key={index} value={device.devEui}>
                                            {device.name}
                                        </option>
                                    ))}
                                    {chosenDevice.wiredSensors && chosenDevice.wiredSensors.map((sensor, index) => (
                                        <option
                                            key={"wired-sensor-" + index}
                                            value={"wired-sensor-" + sensor.port}
                                        >
                                            {sensor.wiredSensorType}-Port:{sensor.port}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dol-blue ">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM135 241c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l87 87 87-87c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 345c-9.4 9.4-24.6 9.4-33.9 0L135 241z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    }

                    <div className="flex items-center mb-4 justify-end p-4">
                        <input id="default-checkbox" onChange={() => exportAll()} checked={checkedAll} type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="default-checkbox" className="ms-2 mb-0 text-sm font-medium text-gray-900 ">Export all data</label>
                    </div>
                </div>
            }
        </div>
    )
}


const ExportData = () => {
    /*
    Set document's title
    */
    useDocumentTitle("Export Data");

    /* State */
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    //Handle export button
    const exportClick = () => {
        setSubmitted(true);
        setLoading(true);
    }

    //Change loading state, sent to the DatePicker
    const handleLoading = (status, fetched) => {
        setLoading(status);
        //Reset the submit status so users can download multiple files
        if (!fetched) {
            setSubmitted(false);
        }
    }

    return (
        <Fragment>
            <Container>
                <Row>
                    <Col>
                        <Header title="Export data" />
                        <Title></Title>
                        <DatePicker submitted={submitted} handleLoading={handleLoading}></DatePicker>
                        <div className="flex justify-center pt-8 max-w-sm mx-auto">
                            <button onClick={() => exportClick()} className="flex justify-center w-1/2 bg-dol-green rounded-2xl px-6 pb-3 pt-3 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">
                                {!loading ? "Export" : <Spinner></Spinner>}
                            </button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Fragment>
    )
}


export default ExportData;
