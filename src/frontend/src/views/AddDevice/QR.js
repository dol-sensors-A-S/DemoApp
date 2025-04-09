import React, { Fragment, useEffect, useRef, useState } from "react";
import { useZxing } from "react-zxing";
import { motion, AnimatePresence } from 'framer-motion';
import Loading from "../../components/Loading";
import Popup from "./Popup";


const QR = (page) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deviceFetched, setDeviceFetched] = useState(null);

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
    if (page.page == "Manual") {
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
            /* Create an object from the parsed data */
            const deviceData = {
                "DeviceType": resultParsed.deviceType,
                "Key": resultParsed.key,
                "MacAddress": resultParsed.macAddress,
                "DeviceName": ""
            }
            /* 
            Set a state with a received object
             */
            setDeviceFetched(deviceData);
            console.log(deviceData);
        }

    }, [result])

    return (
        <>
            <div className="">
                {deviceFetched === null &&
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
                    (<div className="h-full z-10 top-0 bottom-0 left-0 right-0 flex justify-center items-center">
                        <Loading />
                    </div>)
                    :
                    null
                }
            </div>
            {deviceFetched !== null &&
                <div className="h-100">
                    <Popup device={deviceFetched} />
                </div>
            }
        </>
    );
}


export default QR