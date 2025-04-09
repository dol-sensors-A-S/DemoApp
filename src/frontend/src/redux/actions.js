import {
  FETCH_DEVICES_REQUEST,
  FETCH_DEVICES_SUCCESS,
  FETCH_DEVICES_FAILURE,
  FETCH_DETAILS_REQUEST,
  FETCH_DETAILS_SUCCESS,
  FETCH_DETAILS_FAILURE
} from './actionTypes';


/* Device fetching */
export const fetchDevicesRequest = () => ({
  type: FETCH_DEVICES_REQUEST,
});

export const fetchDevicesSuccess = (devices) => ({
  type: FETCH_DEVICES_SUCCESS,
  payload: devices,
});

export const fetchDevicesFailure = (error) => ({
  type: FETCH_DEVICES_FAILURE,
  payload: error,
});


export const fetchDevices = (token) => {
  return async (dispatch) => {
    dispatch(fetchDevicesRequest()); // Start the request

    const apiURL = "/api/devices?page=1";
    try {

      const response = await fetch(apiURL, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      console.log(data)

      if (response.status === 200) {
        dispatch(fetchDevicesSuccess(data)) // Dispatch success with fetched data

        //Fetch all the device details when they are ready from the previous fetch
        if (data.length > 0) {
          dispatch(fetchDetails(token, data))
            .catch((error) => {
              console.error("Error fetching details: ", error)
            })
        }
        else {
          dispatch(fetchDetailsSuccess([]))
        }

      }
    } catch (error) {
      dispatch(fetchDevicesFailure(error.message)); // Dispatch failure if an error occurs
    }
  };
};

/* Details Fetching */
export const fetchDetailsRequest = () => ({
  type: FETCH_DETAILS_REQUEST,
});

export const fetchDetailsSuccess = (details) => ({
  type: FETCH_DETAILS_SUCCESS,
  payload: details,
});

export const fetchDetailsFailure = (error) => ({
  type: FETCH_DETAILS_FAILURE,
  payload: error,
});


export const fetchDetails = (token, devices) => {
  return async (dispatch) => {
    dispatch(fetchDetailsRequest()); // Dispatch request action

    if (devices.length !== 0) {
      console.log('Fetching device details...');

      const detailsArray = [];

      try {
        const detailsPromises = devices.map(async (device) => {
          const url = '/api/devices/' + device.macAddress;

          try {
            const response = await fetch(url, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
              const data = await response.json();
              detailsArray.push(data);
              // Dispatch each detail as soon as it's available
              console.log("data fetched")
              return data; // Return the data for the specific device
            } else {
              throw new Error(`Failed to fetch details for device ${device.macAddress}`);
            }
          } catch (error) {
            console.error('Error fetching ' + url + ': ' + error);
            throw error; // Ensure the error is caught in the outer try-catch
          } finally {
            
          }
        });
       

        // Wait for all device detail fetches to complete
        const allDetails = await Promise.all(detailsPromises);
        return allDetails; // Return the array of fetched device details

      } catch (error) {
        console.error("Error during fetchDetails: ", error);
      }
      finally {
        dispatch(fetchDetailsSuccess(detailsArray));
      }
    }
  };
};