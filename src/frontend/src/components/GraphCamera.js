import React, { Fragment, useEffect, useState } from "react";
import Chart from 'react-apexcharts'




const GraphCamera = (props) => {

    const [sensorData, setSensorData] = useState([]);
    const [dataName, setDataName] = useState('')
    /* 
    Loop through values received from the sensor
    */
    const mapThroughValues = () => {
        //Stored prop value so it's easier later
        const valueProps = props.value.sensorData.find((element) => element.type == props.active)
        if (valueProps == undefined)
            return;
        
            //Empty array to store data values
        const tempArray = [];
        //Empty array to store timestamps
        const timeArray = [];
        

        //Map through data and push to arrays
        valueProps.measurements.map((item) => {
            const timeStore = new Date(item.timestamp);
            //Push time and values to their arrays
            tempArray.push(item.value);
            timeArray.push(timeStore.getTime());
        })
        /* 
        Push only values to a new array and update
        the component's state and Chart options state
        */
        setSensorData(tempArray);
        setDataName(valueProps.type);
        setChartData({
            ...chartData,
            series: [
                {
                    name: valueProps.unit,
                    data: tempArray
                }
            ],
            options: {
                yaxis: {
                    title: {
                        text: valueProps.unit
                    }
                },
                xaxis: {
                    categories: timeArray,
                    tickAmount: 6 // Limit the number of labels shown
                },
                title: {
                    text: valueProps.type
                }

            }
        })
    }

    /* 
    Run the loop when props is updated
    */
    useEffect(() => {
        mapThroughValues();
    }, [props]);



    const [chartData, setChartData] = useState({
        series: [
            {
                name: 'Camera Data',
                data: sensorData, // Sample data points
            },
        ],
        options: {
            chart: {
                height: 350,
                type: 'line',
                toolbar: {
                    show: false
                }
            },
            stroke: {
                width: 4,
                curve: 'smooth',
            },

            grid: {
                show: true,
                strokeDashArray: 4,
                padding: {
                    left: 2,
                    right: 2,
                    top: 0
                },
            },
            title: {
                text: 'Camera data',
                align: 'center',
            },
            tooltip: {
                x: {
                  format: 'dd/MM HH:mm'
                }
            },
            xaxis: {
                type: 'datetime',
                categories: [], // Labels for the X-axis
                labels: {
                    format: 'd/MM HH:mm'
                },
                title: {
                    text: 'Time',
                },
            },
            yaxis: {
                title: {
                    text: 'Time.',
                },
            },
            colors: ['#004077']
        },
    })

    return (
        <Fragment>
            <Chart
                options={chartData.options}
                series={chartData.series}
                height={350}
            />
        </Fragment>

    )
}

export default GraphCamera;




