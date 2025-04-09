import React from 'react';
import { useLocation } from 'react-router-dom';

const CurrentRoute = () => {
  const location = useLocation();

  return (
    <div>
      <h2>Current Route:</h2>
      <p>Pathname: {location.pathname}</p>
    </div>
  );
};

export default CurrentRoute;