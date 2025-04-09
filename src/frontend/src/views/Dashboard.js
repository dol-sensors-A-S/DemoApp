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
import DeviceList from "../components/DeviceList";

const Dashboard = () => {

    //const [details, setDetails] = useState([]);
    const { details } = useSelector(state => state.details);
    const { loading } = useSelector(state => state.details);
    //const { devices } = useSelector(state => state.devices);
    const [devices, setDevices] = useState(null);
    const [fetching, setFetching] = useState(true);

    /*
    Set document's title
    */
    useDocumentTitle("Dashboard");

    const {
        getAccessTokenSilently
    } = useAuth0();

    useEffect(() => {
        /* 
        Check if details is an array.
        Only then fetching is finshed
        */
        if (Array.isArray(devices)) {
            setFetching(false)
        } else {
            setFetching(true)
        }
    }, [details, devices, loading]);
    useEffect(() => {
        //Fetch devices
        const getDevices = async () => {
            const apiURL = `/api/devices?page=1`
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(apiURL, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json();
                if (response.status === 200) {
                    setDevices(data);
                }
            } catch (error) {
                console.error('Error occured: ' + error)
            }
        };
        getDevices();
    }, [])




    return (
        <Fragment>
            <Container>
                <Row>
                    <Col>
                        <Header title="Dashboard" />
                        {/* <Device devices={details} loading={fetching} /> */}
                        <DeviceList devices={devices} loading={fetching}></DeviceList>
                    </Col>
                </Row>

            </Container>
        </Fragment>
    )

}


export default Dashboard;
