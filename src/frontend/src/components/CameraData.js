import React, { Fragment, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import GraphCamera from "../components/GraphCamera";

//Get the current date - 5 * 24h
const fiveDaysAgo = new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString();

const CameraData = (props) => {
    /* State */
    const [loading, setLoading] = useState(true);
    const [sensorData, setSensorData] = useState(undefined);
    const [activeType, setActiveType] = useState(undefined)

    useEffect(() => {
        if (sensorData !== undefined) {
            // console.log(sensorData.sensorData[0])
            setActiveType(sensorData.sensorData[0].type)
            console.log(sensorData)
        }
    }, [sensorData])


    const {
        getAccessTokenSilently
    } = useAuth0();

    useEffect(() => {
        const fetchSensorData = async () => {
            const apiURL = `/api/data/${props.mac}/?startTime=${fiveDaysAgo}`
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json();
                if (response.status === 200) {
                    setLoading(false);
                    setSensorData(data.sensorData[0]);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error occured: ' + error)
            }

        };
        fetchSensorData();
    }, [])


    //const sensorDataList = sensorData.sensorData;

    return (
        <div className='flex items-center justify-center min-h-0 md:items-normal w-full pb-24'>
            <div className='w-full py-8 mx-auto bg-white rounded-lg shadow-xl md:w-1/2 my-2'>
                <div className='max-w-sm px-4 mx-auto space-y-2 md:max-w-xl'>
                    <div className="flex justify-between">
                        <h2 className="text-2xl font-bold text-dol-blue">Camera data</h2>
                    </div>
                    <div className="flex justify-between">

                        {sensorData !== undefined &&
                            <select
                                value={activeType}
                                onChange={e => setActiveType(e.target.value)}>

                                {sensorData.sensorData.map((data, i) => (
                                    <option key={data.type} value={data.type}>{data.type}</option>))
                                }

                            </select>
                        }
                    </div>

                    <div className="flex justify-around">
                        {sensorData !== undefined && sensorData.sensorData.length > 0 &&
                            <div className="w-full">
                                <GraphCamera value={sensorData} active={activeType}></GraphCamera>
                            </div>
                        }
                        {loading &&
                            <Loading></Loading>
                        }
                        {(sensorData === undefined || sensorData?.sensorData?.length === 0) && (
                            <div>
                                <p>No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    )
}

export default CameraData;