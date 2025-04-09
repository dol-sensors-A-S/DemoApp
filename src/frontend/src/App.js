import React, { useEffect, useState, useRef } from "react";
import { Router, Route, Routes, useLocation } from "react-router-dom";
import { Container } from "reactstrap";



import { AnimatePresence, motion } from 'framer-motion';

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Dashboard from "./views/Dashboard"
import Home from "./views/Home";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import { useAuth0 } from "@auth0/auth0-react";
import DevicePage from "./views/DevicePage";
import SensorPage from "./views/SensorPage";
import AddDevice from "./views/AddDevice/AddDevice";
import AddSensor from "./views/AddSensor/AddSensor";
import WiredSensorPage from "./views/WiredSensor/WiredSensorPage";
import NavBarDesktop from "./components/NavBarDesktop";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { fetchDevices } from "./redux/actions";
import ExportData from "./views/ExportData";

initFontAwesome();

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 200 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -200 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}


const App = () => {
  /*
    Fetching global device data
  */
  const {
    getAccessTokenSilently,
    user,
    isAuthenticated
  } = useAuth0();

  const dispatch = useDispatch();
  const { devices, loading } = useSelector(state => state.devices);
  // Local state to track if we're currently fetching devices
  const [isFetching, setIsFetching] = useState(false);


  useEffect(() => {
    async function getDevices() {

      const token = await getAccessTokenSilently();

      if (!loading && !isFetching) {
        console.log("fetching from App")
        setIsFetching(true);  // Set fetching flag to true before fetching

        // Dispatch the fetch to get devices
        await dispatch(fetchDevices(token));

        setIsFetching(false); // Reset fetching flag after fetch is complete
      }
    }

    getDevices();
  }, [dispatch, devices, loading, getAccessTokenSilently]);

  const location = useLocation();



  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }



  return (

    <div id="app" className="d-flex flex-column bg-slate-100 h-100 overflow-y-auto pb-10 md:pb-0">
      <div className="block md:hidden">
        <NavBar />
      </div>
      <div className="mx-0 mt-0 p-0 flex grow flex-col md:flex-row h-auto">
        {isAuthenticated && user.email_verified &&
          <aside className="hidden md:block" >
            <NavBarDesktop />
          </aside>
        }
        <Routes location={location} key={location.pathname}>
          <Route path="/" exact element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/external-api" element={<ExternalApi />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="devices/:mac/sensors/:deveui" element={<SensorPage />} />
          <Route path="add/devices/" element={<AddDevice />} />
          <Route path="add/sensor/:slug" element={<AddSensor />} />
          <Route path="add/wiredsensors/:slug" element={<WiredSensorPage />} />
          <Route path="/export" element={<ExportData />} />
          <Route path="/devices/:mac" element={<DevicePage />} />
        </Routes>
      </div>
      {isAuthenticated && user.email_verified &&
        <Footer />
      }
    </div>
  );
};

export default App;
