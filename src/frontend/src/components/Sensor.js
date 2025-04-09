import { faFighterJet } from "@fortawesome/free-solid-svg-icons";
import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import wiredSensorTypes from "../views/WiredSensor/wiredSensorTypes";
import sensorTypes from "../views/AddSensor/sensorTypes";

const DotDiv = ({ color }) => {
    const baseClasses = "w-4 h-4 rounded-full";
    const colorClasses = color === "green" ? " bg-dol-green" : " bg-red-700";
    return (
        <div className={baseClasses + colorClasses}></div>
    )
}

const ArrowButton = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z" clipRule="evenodd" />
        </svg>
    )
}

const Sensor = ({ items, wiredSensors, cardTitle, mac, deviceStatus, isOnline }) => {
    return (
        <Fragment>
            <div className='flex items-center justify-center min-h-0 mb-10'>
                <div className='w-full py-8 mx-auto bg-white rounded-lg shadow-xl md:w-1/2'>
                    <div className='max-w-sm px-4 mx-auto space-y-6 md:space-y-3'>
                        <h2 className="text-2xl font-bold text-dol-blue">{cardTitle}</h2>
                        {!isOnline && <p className="text-xs">To add and remove sensors, the gateway must be online</p>}

                        {/* Wireless Sensors */}
                        <h3 className="font-semibold">Wireless Sensors</h3>
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <Link
                                    to={`/devices/${mac}/sensors/${item.devEui}`}
                                    state={{ item, mac, deviceStatus }}
                                    key={index}
                                    className="flex justify-between items-center p-2 rounded-xl border-b border-gray-300"
                                >
                                    <div className="flex-[2]">{item.name}</div>
                                    <div className="flex-1">{item.sensorType}</div>
                                    <div className="flex-1 content-center flex justify-center">
                                        {deviceStatus.sensorsInactive &&
                                        deviceStatus.sensorsInactive.inactiveSensors.some(s => s.devEui == item.devEui) ?
                                            <DotDiv color={"red"} /> : <DotDiv color={"green"} />}
                                    </div>
                                    <ArrowButton className="flex-1" />
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No wireless sensors found.</p>
                        )}

                        {/* Wired Sensors */}
                        <h3 className="font-semibold mt-4">Wired Sensors</h3>
                        {wiredSensors && wiredSensors.length > 0 ? (
                            wiredSensors.map((sensor, index) => (

                                <Link
                                    to={`/devices/${mac}/wired-sensors/wired-sensor-${sensor.port}`}
                                    state={{ sensor, mac, deviceStatus }}
                                    key={index}
                                    className="flex justify-between items-center p-2 rounded-xl border-b border-gray-300"
                                >
                                    <div className="flex-[2]">{sensor.wiredSensorType} : Port {sensor.port}</div>
                                    <div className="flex-1">{sensor.wiredSensorType || "N/A"}</div>
                                    <div className="flex-1 content-center flex justify-center">
                                        {/* Check if the port is active */}
                                        {console.log("device status",deviceStatus.wiredInactivePorts)}
                                        {deviceStatus?.wiredInactivePorts?.includes(sensor.port) ?
                                            <DotDiv color={"red"} /> : <DotDiv color={"green"} />}
                                    </div>
                                    <ArrowButton className="flex-1" />
                                </Link>

                            ))
                        ) : (

                            <p className="text-gray-500 text-sm">No wired sensors found.</p>
                        )}
                    </div>
                    {console.log("wired sensors here")}
                    {console.log(wiredSensors)}
                    <div className="flex justify-end pt-8 pr-4 max-w-sm mx-auto">
                        {isOnline ?
                            <Link to={`/add/sensor/${mac}`} state={mac}>
                                <button className="inline-block rounded bg-dol-green px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:bg-primary-accent-300">+ Add</button>
                            </Link>
                            :
                            <button disabled={true} className="inline-block rounded bg-gray-400 px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white">+ Add</button>
                        }
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Sensor;