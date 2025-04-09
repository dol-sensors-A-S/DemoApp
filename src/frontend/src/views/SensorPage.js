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
      console.log(sensorData);
    }
  }, [sensorData]);

  /*
     - Toggle between different data outputs
     - Set active class on a clicked button
    */
  const toggleUnit = (data) => {
    setActiveUnit(data);
  };

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchSensorData = async () => {
      const apiURL = `/api/data/${props.mac}/${props.sensor.devEui}?startTime=${yesterday}`;
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(apiURL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(response.status);
        const data = await response.json();
        if (response.status === 200) {
          setLoading(false);
          setSensorData(data);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error occured: " + error);
      }
    };
    fetchSensorData();
  }, []);

  //const sensorDataList = sensorData.sensorData;

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

/* Show the status of a claim - popup */
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

  /* Refs */
  const newDeviceNameRef = React.useRef();
  const newName = newDeviceNameRef;
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

  /* Trigger PUT changing name on Accept button click */
  const changeName = async () => {
    //Try to fetch only if new name is not empty
    if (newName.current.value !== "") {
      setLoading(true);
      console.log(newName.current.value);
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`/api/sensors/${deviceMac}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DevEui: devEui,
            Name: newName.current.value.toString(),
          }),
        });
        const result = await response.json();

        if (response.status === 200) {
          toggleModal();
          updateName(newName.current.value.toString());
        }
      } catch (error) {
        console.error("Error editting the name " + error);
        setError(true);
        setErrorText(error);
      } finally {
        setLoading(false);
        dispatch(fetchDevicesSuccess());
      }
    }
  };

  const changeSample = async () => {
    //Try to fetch only if new sampling rate is not empty
    if (newSampleRate.current.value !== "") {
      setLoading(true);
      const sampleRate = newSampleRate.current.value * 60;
      console.log(sampleRate);
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`/api/sensors/${deviceMac}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DevEui: devEui,
            SampleRate: sampleRate,
          }),
        });
        const result = await response.json();

        if (response.status === 200) {
          toggleModal();
          updateSample(newSampleRate.current.value);
        } else if (!response.ok) {
          setError(true);
          setErrorText("Sample rate must be between 0 and 15 min");
        }
      } catch (error) {
        console.error("Error changing the sample rate " + error);
        setError(true);
        setErrorText(error);
      } finally {
        setLoading(false);
        dispatch(fetchDevicesSuccess());
      }
    }
  };

  /*
    Close the popup on click of an X button or cancel button
    And set states to false
    */
  const toggleModal = () => {
    setModalOpen(false);
    toggleEdit(false);
    setError(false); //If there is any error - reset
  };

  const deleteSensor = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/sensors/${deviceMac}/${devEui}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setModalOpen(false);
        toggleEdit(false);
        setError(false); //If there is any error - reset
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      dispatch(fetchDevicesSuccess());
      navigate("/dashboard");
    }
  };

  if (modalOpen) {
    //Change name
    if (!remove && status && !sampleRate) {
      return (
          <div key={"modal"}>
            <div
                id="modalOverlay"
                className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
            >
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                <button
                    onClick={() => toggleModal()}
                    className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-dol-blue">
                  Edit sensor
                </h2>
                <div className="mb-4">
                  <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="fname"
                  >
                    New sensor name:
                  </label>
                  <input
                      ref={newDeviceNameRef}
                      placeholder="Enter sensor name"
                      className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      id="fname"
                      name="fname"
                  ></input>
                </div>
                {error && <ModalError errorText={errorText}></ModalError>}

                <div className="flex flex-wrap w-full justify-end">
                  <button
                      onClick={() => changeName()}
                      className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                  >
                    {!loading ? "Accept" : <Spinner />}
                  </button>
                  <button
                      onClick={() => toggleModal()}
                      className="ml-2 bg-red-500 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
      );
      //Change sampling rate
    } else if (!remove && status && sampleRate) {
      return (
          <div key={"modal"}>
            <div
                id="modalOverlay"
                className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
            >
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                <button
                    onClick={() => toggleModal()}
                    className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-dol-blue">
                  Edit sensor
                </h2>
                <div className="mb-4">
                  <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="fname"
                  >
                    Change sampling rate:
                  </label>
                  <input
                      ref={newSampleRateRef}
                      placeholder="Enter new sampling rate in minutes"
                      className="shadow appearance-none border rounded-xl w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="number"
                      min={"1"}
                      max={"15"}
                      id="fname"
                      name="fname"
                  ></input>
                </div>
                {error && <ModalError errorText={errorText}></ModalError>}

                <div className="flex flex-wrap w-full justify-end">
                  <button
                      onClick={() => changeSample()}
                      className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                  >
                    {!loading ? "Accept" : <Spinner />}
                  </button>
                  <button
                      onClick={() => toggleModal()}
                      className="ml-2 bg-red-500 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
      );
    } else {
      return (
          <div key={"modal"}>
            <div
                id="modalOverlay"
                className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
            >
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full mx-3 relative">
                <button
                    onClick={() => toggleModal()}
                    className="absolute top-3 right-6 text-gray-600 hover:text-gray-900 text-xl font-bold"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-dol-blue">
                  Delete sensor
                </h2>
                <div className="mb-4">
                  {!loading ? (
                      <p>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-dol-blue">
                      {sensorName}{" "}
                    </span>
                        sensor?
                      </p>
                  ) : (
                      <p>Removing your {sensorName}</p>
                  )}
                </div>
                {error && <ModalError errorText={errorText}></ModalError>}
                {!loading ? (
                    <div className="flex flex-wrap w-full justify-end">
                      <button
                          onClick={() => deleteSensor()}
                          className="bg-red-500 inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                      >
                        Delete
                      </button>
                      <button
                          onClick={() => toggleModal()}
                          className="ml-2 bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                      >
                        Cancel
                      </button>
                    </div>
                ) : (
                    <Loading></Loading>
                )}
              </div>
            </div>
          </div>
      );
    }
  }
};

const DetailsSensor = (props) => {
  //State
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  const [sampleRate, setSampleRate] = useState(false);

  //Set state for sensor name change or removal
  const editSensor = (edit, remove, sampleRate) => {
    setEdit(edit);
    setRemove(remove);
    setSampleRate(sampleRate);
    console.log(edit, remove, sampleRate);
  };

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
                    <p className="">{props.sensor.name}</p>
                    <p>
                      {props.sensorStatus && (
                          <FontAwesomeIcon
                              className="text-dol-green cursor-pointer"
                              onClick={() => editSensor(true, false, false)}
                              icon={faEdit}
                              style={{ marginLeft: "8px" }}
                          />
                      )}
                    </p>
                  </li>
                  <li className="flex">
                    <p className="w-5/12 font-medium">Sensor type:</p>
                    <p className="">{props.sensor.sensorType}</p>
                  </li>
                  <li className="flex">
                    <p className="w-5/12 font-medium">DevEui:</p>
                    <p>{props.sensor.devEui}</p>
                  </li>
                  <li className="flex">
                    <p className="w-5/12 font-medium">Sample rate:</p>
                    <p>
                      {props.sensor.sampleRate / 60} min -{" "}
                      {props.sensor.sampleRateInSync ? "in sync" : "not in sync"}
                    </p>
                    <p>
                      {props.sensorStatus && (
                          <FontAwesomeIcon
                              className="text-dol-green cursor-pointer"
                              onClick={() => editSensor(true, false, true)}
                              icon={faEdit}
                              style={{ marginLeft: "8px" }}
                          />
                      )}
                    </p>
                  </li>
                  <li className="flex">
                    <p className="w-5/12 font-medium">Sensor status:</p>
                    <p>
                      {props.sensorStatus === true ? (
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
                      {new Date(props.sensor.latestDataSentAt).toLocaleString(
                          "en-CA",
                          { hour12: false }
                      )}
                    </p>
                  </li>
                  <li className="flex">
                    <p className="w-5/12 font-medium">Battery:</p>
                    <p>
                      {props.sensor.batteryStatus != null &&
                          props.sensor.batteryStatus.value}
                    </p>
                  </li>
                </ul>
                <div className="flex justify-end pt-3 max-w-sm mx-auto">
                  <button
                      disabled={!props.isOnline}
                      onClick={() => editSensor(true, true, false)}
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
        <Modal
            remove={remove}
            sampleRate={sampleRate}
            status={edit}
            toggleEdit={editSensor}
            deviceMac={props.mac}
            updateName={props.updateName}
            updateSample={props.updateSample}
            sensorName={props.sensor.name}
            devEui={props.sensor.devEui}
        ></Modal>
      </Fragment>
  );
};

/* Display the sensor name and type on top of the page */
const SensorName = (props) => {
  console.log(props);
  //Change document title
  useEffect(() => {
    if (props.sensor && props.sensor.name) {
      document.title = props.sensor.name + " " + props.sensor.sensorType;
    }
  }, [props]);
  return (
      <Fragment>
        <div className="text-center text-dol-blue md:w-full">
          <h2 className="text-2xl font-semibold inline-block align-middle relative">
          <span>
            <GoBack></GoBack>
          </span>
            {props.sensor.name}
          </h2>
          <h3>{props.sensor.sensorType}</h3>
        </div>
      </Fragment>
  );
};

const SensorPage = (props) => {
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const { mac, deveui } = useParams();
  const { details } = useSelector((state) => state.details);
  const [device, setDevice] = useState();
  const [sensor, setSensor] = useState(null);
  const [stateName, setStateName] = useState("");
  const [status, setStatus] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [sampleRate, setSampleRate] = useState("");
  // Match mac address with the one from fetched details
  //and create an object that will be later sent to the other components
  const findDevice = (mac, eui) => {
    //const device = details.find((device) => device.mac === mac)
    //setDevice(device);
    const sensorId = device.sensors.find(
        (sensor) => sensor.devEui === eui.toLowerCase()
    );
    setSensor(sensorId);
  };

  //Fetch the device info
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

  //Displays the new name instantly
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

  //Displays the new sampling rate instantly
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
      findDevice(mac, deveui);
    }
  }, [device]);

  //Fetch sensor(item) data
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
      if (statusResponse.status === 200) {
        console.log(statusData);
        if (
            statusData &&
            statusData.sensorsInactive.inactiveSensors.some(
                (s) => s.devEui == deveui
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
    console.log(item);
    //If device status is unavailable from state (NavBardesktop) fetch it
    //Check inactive sensor array and find current deveui in it
    //Set state accordingly
    if (item === null || (item && item.deviceStatus === null)) {
      getSensorStatus();
    } else if (
        item.deviceStatus.sensorsInactive &&
        item.deviceStatus.sensorsInactive.inactiveSensors.some(
            (s) => s.devEui == item.item.devEui
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
};

export default SensorPage;
