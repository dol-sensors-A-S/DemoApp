import React from "react";
import GoBack from "./GoBack";
import { useLocation } from "react-router-dom";



const Header = ({ title, subtitle }) => {
    const location = useLocation();
    console.log(location.pathname)

    return (
        <header className="flex flex-col items-center justify-center align-middle text-4xl text-dol-blue font-medium p-4">
            <div>
                <div className="relative flex justify-center items-end">
                    {location.pathname !== "/dashboard" && location.pathname !== "/export" && (
                        <GoBack></GoBack>
                    )
                    }
                    <h1 className="text-2xl font-bold">{title}</h1>
                </div>
            </div>
            {subtitle &&
                <h2 className="text-xl">{subtitle}</h2>
            }
        </header>
    )
};

export default Header;