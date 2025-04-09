import React, { Fragment, useEffect, useState } from "react";
import {
    useParams,
    useLocation,
    useSearchParams,
    useNavigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import Graph from "../components/Graph";
import { useDispatch, useSelector } from "react-redux";
import useDocumentTitle from "../utils/documentTitle";
import { fetchDevicesRequest, fetchDevicesSuccess } from "../redux/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Col, Container, Row } from "reactstrap";
import Spinner from "../utils/Spinner";
import SensorPage from "./SensorPage";

//Animation for a component mount
const animateManual = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
};

//Get the current date - 24h
const yesterday = new Date(
    new Date().getTime() - 24 * 60 * 60 * 1000
).toISOString();

//Go to the previous page button component
const GoBack = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div
            className="absolute flex items-center cursor-pointer -left-10 mt-1"
            onClick={() => handleBackClick()}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                />
            </svg>
        </div>
    );
};

const SensorData = (props) => {
    /* State */

    const [loading, setLoading] = useState(true);
    const [sensorData, setSensorData] = useState(undefined);
    const [activeUnit, setActiveUnit] = useState(0);

    useEffect(() => {
        if (sensorData !== undefined) {
            // console.log(sensorData.sensorData[0])
            sensorData.sensorData[0].measurements.map((item) => {
                //console.log(item.value)
            });
        }
    }, [sensorData]);
    const toggleUnit = (data) => {
        setActiveUnit(data);
    };
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchSensorData = async () => {
            const apiURL = `/api/data/${props.mac}/wired-sensor-${props.sensor.port}?startTime=${yesterday}`;
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(apiURL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (response.status === 200) {
                    setLoading(false);
                    console.log("Sensor data", data);
                    setSensorData(data);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error occured: " + error);
            }
        };
        fetchSensorData()
    },[]);
    return (
        <div className="flex items-center justify-center min-h-0 mb-4 md:w-2/5 md:p-2 md:items-normal">
            <div className="w-full py-8 mx-auto bg-white rounded-lg shadow-xl md:w-full md:h-full">
                <div className="max-w-sm px-4 mx-auto space-y-2 md:max-w-xl">
                    <div className="flex justify-between">
                        <h2 className="text-2xl font-bold text-dol-blue">Sensor data</h2>
                    </div>

                    <div className="flex">
                        {sensorData !== undefined &&
                            sensorData.sensorData.map((data, i) => (
                                <div key={i}>
                                    <button
                                        value={data.unit}
                                        onClick={() => toggleUnit(i)}
                                        className={`${
                                            activeUnit === i ? "bg-dol-green" : "bg-dol-blue"
                                        } text-white focus:outline-none font-small rounded-full text-sm px-2 py-1 min-w-10 text-center me-2 mb-2`}
                                    >
                                        {data.type}
                                    </button>
                                </div>
                            ))}
                        {sensorData === undefined && !loading && (
                            <div>
                                <p>
                                    No data. Please check if sensor is properly connected and
                                    active.
                                </p>
                                <p>Or check in few minutes</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-around">
                        {sensorData !== undefined && (
                            <div className="w-full">
                                <Graph value={sensorData} active={activeUnit}></Graph>
                            </div>
                        )}

                        {sensorData === undefined && loading && <Loading></Loading>}
                    </div>
                </div>
            </div>
        </div>
    );
};
const ModalError = (props) => {
    return (
        <div>
            <div className="bg-red-400 px-3 py-2 mb-2 rounded-xl w-full text-gray-700 border-solid border-2 border-red-500">
                {"An Error Occured: "}
                {props.errorText.message && <span>{props.errorText.message}</span>}
                {!props.errorText.message && props.errorText && (
                    <span>{props.errorText}</span>
                )}
            </div>
        </div>
    );
};

const Modal = ({
                   status,
                   toggleEdit,
                   deviceMac,
                   updateName,
                   updateSample,
                   remove,
                   sensorName,
                   devEui,
                   sampleRate,
               }) => {
    /* State */
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState("");


    const newSampleRateRef = React.useRef();
    const newSampleRate = newSampleRateRef;

    //Dispatch runs a method from Redux actions
    const dispatch = useDispatch();
    //React router redirection
    const navigate = useNavigate();

    const { getAccessTokenSilently } = useAuth0();

    //Open the popup if status changes
    useEffect(() => {
        if (status) {
            setModalOpen(true);
        }
    }, [status]);

};

const DetailsSensor = ({ sensor, isOnline, onDelete }) => {

    return (
        <Fragment>
            <div className="flex items-center justify-center min-h-0 mb-4 md:w-2/5 w-full md:p-2 md:items-stretch">
                <div className="w-full py-8 mx-auto bg-white rounded-lg shadow-xl md:w-full">
                    <div className="max-w-sm px-4 mx-auto space-y-2">
                        <div>
                            <h2 className="text-2xl font-bold text-dol-blue">Details</h2>
                        </div>
                        <div className="space-y-2">
                            <ul className="">
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Sensor name:</p>
                                    <p className="">wired-sensor-{sensor.port}</p>
                                </li>
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Sensor type:</p>
                                    <p className="">{sensor.wiredSensorType}</p>
                                </li>
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Port:</p>
                                    <p>{sensor.port}</p>
                                </li>
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Sample rate:</p>
                                    <p>
                                        {sensor.samplingRate / 60} min
                                    </p>
                                </li>
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Sensor status:</p>
                                    <p>
                                        {isOnline === true ? (
                                            <span className="text-dol-green font-medium">Active</span>
                                        ) : (
                                            <span className="text-red-500 font-medium">
                        Not active
                      </span>
                                        )}
                                    </p>
                                </li>
                                <li className="flex">
                                    <p className="w-5/12 font-medium">Latest data:</p>
                                    <p>
                                        {new Date(sensor.lastSent).toLocaleString(
                                            "en-CA",
                                            { hour12: false }
                                        )}
                                    </p>
                                </li>
                            </ul>
                            <div className="flex justify-end pt-3 max-w-sm mx-auto">
                                <button
                                    disabled={!isOnline}
                                    onClick={onDelete}
                                    className="bg-transparent border-2 border-red-500 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-red-500 shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                                >
                                    Delete
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        style={{ marginLeft: "8px" }}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

const SensorName = (props) => {
    //Change document title
    useEffect(() => {
        if (props.sensor && props.sensor.port) {
            document.title = "wired-sensor-" + props.sensor.port + " " + props.sensor.wiredSensorType;
        }
    }, [props]);
    return (
        <Fragment>
            <div className="text-center text-dol-blue md:w-full">
                <h2 className="text-2xl font-semibold inline-block align-middle relative">
          <span>
            <GoBack></GoBack>
          </span>
                    wired-sensor-{props.sensor.port}
                </h2>
                <h3>{props.sensor.wiredSensorType}</h3>
            </div>
        </Fragment>
    );
};

const WiredSensorChartPage = (props) => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { mac, port } = useParams();
    const { details } = useSelector((state) => state.details);
    const [device, setDevice] = useState();
    const [sensor, setSensor] = useState(null);
    const [stateName, setStateName] = useState("");
    const [status, setStatus] = useState(false);
    const [deviceStatus, setDeviceStatus] = useState(null);
    const [sampleRate, setSampleRate] = useState("");
    const navigate = useNavigate();
    // Match mac address with the one from fetched details
    //and create an object that will be later sent to the other components
    const findDevice = (mac, eui) => {
        //const device = details.find((device) => device.mac === mac)
        //setDevice(device);
        const sensorId = device.wiredSensors.find(
            (sensor) => "wired-sensor-" + sensor.port === eui.toLowerCase()
        );
        setSensor(sensorId);
    };
    useEffect(() => {
        const fetchDevice = async () => {
            const apiURL = `/api/devices/${mac}`;
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(apiURL, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (response.status === 200) {
                    setDevice(data);
                }
            } catch (error) {
                console.error("Error occured: " + error);
            }
        };
        fetchDevice();
    }, []);
    const handleDeleteSensor = async () => {
        try {
            const token = await getAccessTokenSilently();

            const updatedSensors = device.wiredSensors.filter((s) => s.name !== port);
            const response = await fetch(`/api/sensors/${mac}/wired`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sensors: updatedSensors }),
            });

            const result = await response.json();
            if (response.status === 200) {
                navigate(`/devices/${mac}`);
            } else {
                console.log(result);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    };
    const updateNameInstantly = (name) => {
        if (name) {
            setStateName(name);
            //Update name in the state
            setSensor((prevState) => ({
                ...prevState,
                name: name,
            }));
        }
    };
    const updateSampleRateInstantly = (sampleRate) => {
        if (sampleRate) {
            setSensor((prevState) => ({
                ...prevState,
                sampleRate: sampleRate * 60,
            }));
        }
    };

    //Get a correct sensor from the list
    useEffect(() => {
        if (device !== undefined) {
            findDevice(mac, port);
        }
    }, [device]);

    const item = location.state || null;

    const { getAccessTokenSilently } = useAuth0();
    useEffect(() => {
        if (!item) {
            getSensorStatus();
        }
    }, []);

    const getSensorStatus = async () => {
        console.log("fired getsensorsstaturs");
        try {
            const token = await getAccessTokenSilently();
            const statusUrl = `/api/devices/${mac}/status`;
            const statusResponse = await fetch(statusUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const statusData = await statusResponse.json();

            console.log("Status response:", statusData);
            if (statusResponse.status === 200) {
                if (
                    statusData &&
                    statusData.sensorsInactive.inactiveSensors.some(
                        (s) => s.port == port
                    )
                ) {
                    setStatus(false);
                } else {
                    setStatus(true);
                }
            }
        } catch (error) {
            console.error("Error occured: " + error);
        }
    };
    useEffect(() => {
        console.log("Weird",item);
        //If device status is unavailable from state (NavBardesktop) fetch it
        //Check inactive sensor array and find current deveui in it
        //Set state accordingly
        if (item === null || (item && item.deviceStatus === null)) {
            getSensorStatus();
        } else if (
            item.deviceStatus.sensorsInactive &&
            item.deviceStatus.sensorsInactive.inactiveSensors.some(
                (s) => s.port == item.item.port
            )
        ) {
            setStatus(false);
        } else {
            setStatus(true);
        }
    }, [item]);

    useEffect(() => {
        // If item is still null and location.state is available later, update the item
        if (!sensor && location.state) {
            setSensor(location.state.item);
        }
    }, [location.state, item]);

    if (!location) {
        return <p>Item not found</p>;
    }

    return (
        <Fragment>
            <Container>
                <Row>
                    <Col>
                        {sensor && device && (
                            <div className="flex flex-col w-full flex-wrap">
                                <SensorName sensor={sensor} />
                                <div className="w-full flex justify-center flex-col md:flex-row">
                                    <DetailsSensor
                                        sensor={sensor}
                                        mac={mac}
                                        isOnline={device.isOnline}
                                        onDelete={handleDeleteSensor}
                                        updateName={updateNameInstantly}
                                        updateSample={updateSampleRateInstantly}
                                        sensorStatus={status}
                                    ></DetailsSensor>
                                    <SensorData sensor={sensor} mac={mac}></SensorData>
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </Fragment>
    );
}
export default WiredSensorChartPage;