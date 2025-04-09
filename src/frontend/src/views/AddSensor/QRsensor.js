import React, { Fragment, useEffect, useRef, useState } from "react";
import { useZxing } from "react-zxing";
import { motion, AnimatePresence } from 'framer-motion';
import Loading from "../../components/Loading";
import PopupSensor from "./PopupSensor";


const QRsensor = (props) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sensorFetched, setSensorFetched] = useState(null);
    /*
     Animation for a video
     */
    const scaleUp = {
        initial: { opacity: 1 },
        animate: { opacity: loading ? 0 : 1 },
        transition: { duration: 0.5 }
    };

    /* 
    Stops camera feed when switching back to the manual page 
    */
    if (props.page == "Manual") {
        setResult(null)
    }

    /* 
    Get the QR code result and set result to state
    */
    const { ref } = useZxing({
        onDecodeResult(result) {
            setResult(result.getText());
        },
        //Stop a video stream after scanning
        paused: result !== null
    });

    /* 
    Set state if video feed is ready 
    */
    const handleVideoReady = () => {
        setLoading(false);
    }

    useEffect(() => {
        if (result !== null) {

            let resultParsed = JSON.parse(result);
            console.log("resultParsedToJson", resultParsed);
            /* Create an object from the parsed data */
            const deviceData = {
                "SensorType": resultParsed.type,
                "DevEui": resultParsed.devEui,
                "MacAddress": props.mac,
                "Name": ""
            }
            /* 
            Set a state with a received object
             */
            setSensorFetched(deviceData);
        }

    }, [result])

    return (
        <>
            <div className="">
                {!sensorFetched &&
                    <AnimatePresence>
                        <motion.div {...scaleUp}>
                            <video
                                ref={ref}
                                onCanPlay={handleVideoReady}
                                className={`${!loading ? "block" : "hidden"} mt-3`}
                            />
                        </motion.div>
                    </AnimatePresence>
                }
                {loading ?
                    (<div className="h-full z-10 top-0 bottom-0 left-0 right-0 flex justify-center items-center min-h">
                        <Loading />
                    </div>)
                    :
                    null
                }
            </div>
            <div className="pb-4">
                {sensorFetched !== null &&
                    <PopupSensor device={sensorFetched} />
                }
            </div>
        </>
    );
}


export default QRsensor