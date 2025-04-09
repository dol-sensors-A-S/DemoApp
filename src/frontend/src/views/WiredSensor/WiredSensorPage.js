import React, { useState, useEffect, Fragment } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { fetchDevicesSuccess } from "../../redux/actions";
import { useDispatch } from "react-redux";
import { Col, Container, Row } from "reactstrap";
import wiredSensorTypes from "./wiredSensorTypes";
import Graph from "../../components/Graph";
import Loading from "../../components/Loading";

import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SensorForm({ mac }) {
  const { getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false);
  const [selectedPort, setSelectedPort] = useState(1);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null)

  useEffect(() => {
    setLoading(true);

    const fetchSensors = async () => {
      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(`/api/devices/${mac}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch sensors");
        }
        const data = await response.json();

        let sensors = populateWithDisabledSensors(data.wiredSensors);

        console.log(sensors);
        setSensors(sensors);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  const populateWithDisabledSensors = (wiredSensors) => {
    let sensor1 = wiredSensors.find((e) => e.port == 1);
    if (sensor1) {
      sensor1.enabled = true;
    }

    let sensor2 = wiredSensors.find((e) => e.port == 2);
    if (sensor2) {
      sensor2.enabled = true;
    }

    let sensor3 = wiredSensors.find((e) => e.port == 3);
    if (sensor3) {
      sensor3.enabled = true;
    }

    let sensor4 = wiredSensors.find((e) => e.port == 4);
    if (sensor4) {
      sensor4.enabled = true;
    }

    sensor1 =
        sensor1 === undefined
            ? {
              port: 1,
              wiredSensorType: "DOL139",
              samplingRate: 300,
              enabled: false,
            }
            : sensor1;
    sensor2 =
        sensor2 === undefined
            ? {
              port: 2,
              wiredSensorType: "DOL139",
              samplingRate: 300,
              enabled: false,
            }
            : sensor2;
    sensor3 =
        sensor3 === undefined
            ? {
              port: 3,
              wiredSensorType: "DOL139",
              samplingRate: 300,
              enabled: false,
            }
            : sensor3;
    sensor4 =
        sensor4 === undefined
            ? {
              port: 4,
              wiredSensorType: "DOL139",
              samplingRate: 300,
              enabled: false,
            }
            : sensor4;

    return [sensor1, sensor2, sensor3, sensor4];
  };

  const handleChange = (sensor, event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;

    // Update the state with the new array of sensors
    setSensors((prevSensors) => {
      return prevSensors.map((s) => {
        if (name === "samplingRate") {
          // Apply sample rate change to all sensors
          return { ...s, samplingRate: newValue };
        } else if (s.port === sensor.port) {
          // Apply other changes only to the specific sensor
          return { ...s, [name]: newValue };
        }
        return s;
      });
    });
  };
  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }
  const showSensorData = async (e, port) => {
    e.preventDefault();
    setShowData(false);
    await new Promise((r) => setTimeout(r, 2));

    setSelectedPort(port);
    setShowData(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`/api/sensors/${mac}/wired`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sensors: sensors.filter((s) => s.enabled) }),
      });
      const result = await response.json();
      if (response.status === 200) {
        setValidationError(null);
        setConfirmationMessage(`Sensors updated`);
        toast.success("Sensors updated", {position: "top-center", autoClose: 500});
        await timeout(1000);
        navigate(`/devices/${mac}`);
      }

      else if (response.status === 400){
        console.log("invalid input");
        setValidationError("Sampling rate must be between 60 and 900 and divisible by 60");
        toast.error("Sampling rate must be between 60 and 900 and divisible by 60");
      }

      else {
        console.log("result is:" ,result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
      <Fragment>
        <ToastContainer/>
        <Container>
          <Row>
            <Col>
              {sensors.length > 0 && (
                  <form onSubmit={handleSubmit}>
                    {sensors.map((sensor, index) => (
                        <div
                            key={index}
                            className="sensor-row bg-white rounded-lg shadow-xl mb-2 p-2 px-4 pb-3"
                        >
                          <div className="w-full flex justify-between">
                            <label className="text-dol-blue font-bold">
                              {"Port: "}
                              <input
                                  type="number"
                                  name="port"
                                  min="1"
                                  max="4"
                                  value={sensor.port}
                                  disabled={true}
                              />
                            </label>
                            <label className="flex">
                              <p className="font-bold text-dol-blue">Enabled: </p>
                              <input
                                  className="ml-1"
                                  type="checkbox"
                                  name="enabled"
                                  checked={sensor.enabled}
                                  onChange={(e) => handleChange(sensor, e)}
                              />
                            </label>
                          </div>
                          <div>
                            <label>
                              {"Sample Rate (s): "}
                              <input
                                  className="bg-white w-32 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  type="number"
                                  name="samplingRate"
                                  value={sensor.samplingRate}
                                  onChange={(e) => handleChange(sensor, e)}
                              />
                            </label>
                          </div>
                          <div>
                            <label className="relative inline-block">
                              {"Type: "}
                              <select
                                  value={sensor.wiredSensorType}
                                  className="shadow w-32 appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  type="text"
                                  name="wiredSensorType"
                                  placeholder="Choose device type"
                                  onChange={(e) => handleChange(sensor, e)}
                              >
                                {wiredSensorTypes.map((sensor, index) => (
                                    <option value={sensor.type} key={index}>
                                      {sensor.name}
                                    </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dol-blue ">
                                <svg
                                    className="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                >
                                  <path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM135 241c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l87 87 87-87c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 345c-9.4 9.4-24.6 9.4-33.9 0L135 241z"></path>
                                </svg>
                              </div>
                            </label>
                          </div>
                          <div className="w-full flex justify-end">
                            <button
                                onClick={(e) => showSensorData(e, sensor.port)}
                                className=" w-1/3 shadow bg-dol-green focus:shadow-outline focus:outline-none text-white font-medium rounded"
                            >
                              {console.log("sensor port", sensor.port)}
                              View data
                            </button>
                          </div>
                        </div>
                    ))}
                    <br />
                    <div className="flex justify-around">
                      <button
                          className="mt-4 w-1/3 shadow bg-dol-blue focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                          type="submit"
                      >
                        Update
                      </button>
                    </div>
                  </form>
              )}

              {showData && (
                  <WiredSensorData mac={mac} port={selectedPort}></WiredSensorData>
              )}
            </Col>
          </Row>
        </Container>
      </Fragment>
  );
}

const yesterday = new Date(
    new Date().getTime() - 24 * 60 * 60 * 1000
).toISOString();

const WiredSensorData = ({ mac, port }) => {
  /* State */
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState(undefined);
  const [activeUnit, setActiveUnit] = useState(0);

  useEffect(() => {
    if (sensorData !== undefined) {
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
      let s = `wired-sensor-${port}`;
      const apiURL = `/api/data/${mac}/${s}?startTime=${yesterday}`;
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

  return (
      <div className="flex items-center justify-center min-h-0 mt-2 mb-4 w-full md:w-2/5 lg:w-full md:p-2 md:items-normal">
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

const WiredSensorPage = ({}) => {
  const { slug } = useParams();

  return (
      <div className="w-full flex flex-col items-center ">
        <div className="max-w-lg w-full md:p-0">
          <div className="text-center p-4">
            <h1 className="text-dol-blue font-semibold text-xl">
              Configure wired sensors
            </h1>
          </div>
          <SensorForm mac={slug} />
        </div>
      </div>
  );
};

export default WiredSensorPage;