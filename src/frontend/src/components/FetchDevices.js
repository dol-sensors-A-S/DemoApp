import React, { useEffect, useState } from 'react';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export function useFetchDevices(apiURL) {
  const {
    getAccessTokenSilently
  } = useAuth0();

  //const apiURL = "/api/devices?page=1"
  const [data, setData] = useState(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(apiURL, {
          headers: { Authorization: `Bearer ${token}` }
        })
        //.then(resp => resp.json())
        // .then(json => setData(json))
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, [getAccessTokenSilently, apiURL]);
  return data;
}
