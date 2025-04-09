import React, { Fragment, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Loading from "./Loading";

//Make an API call if sensors are not available in the local storage
//Take a parameter from the url

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

const Devices = (props) => {
    if (props.devices.length === 0) {
        return (
            <div>
                You have no devices
            </div>
        )
    } else {
        return (
            <div>
                {props.devices.map((device, index) => (
                    <Link to={`/devices/${device.mac}`} state={device} key={index} className="flex justify-between items-center mt-3">
                        <div className="flex-[2]">{device.deviceName}</div>
                        <div className="flex-1">{device.deviceType}</div>
                        <div className="flex-1 content-center flex justify-center">{device.connectionState === "Connected" ? <DotDiv color={"green"} /> : <DotDiv color={"red"} />}</div>
                        <ArrowButton className="flex-1" />
                    </Link>
                ))}
            </div>

        )
    }

}


const Device = ({ devices, parentMethod, loading }) => {
    return (
        <Fragment>
            <div className='flex items-center justify-center min-h-0'>
                <div className='w-full py-8 mx-auto bg-white rounded-lg shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] md:w-3/4 lg:w-1/2'>
                    <div className='max-w-sm px-4 mx-auto space-y-6'>
                        <h2 className="text-2xl font-bold text-dol-blue">Devices</h2>
                        {loading ? <Loading /> : <Devices devices={devices} loading={loading} />}
                    </div>
                    <div className="flex justify-end pt-8 pr-4 max-w-sm mx-auto">
                        <Link to={"/add/devices/"} >
                            <button className="bg-dol-green inline-block rounded px-4 pb-[5px] pt-[6px] text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong">+ Add devices</button>
                        </Link>
                    </div>
                </div>
            </div>
        </Fragment>
    )

}


export default Device;




