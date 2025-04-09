import Spinner from "../../utils/Spinner";

function SubmitSensor({ loading }) {
    return (
        <button type="submit" className="mt-4 w-full shadow bg-dol-green focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded">
            {!loading
                ?
                <p>
                    Add sensor
                </p>
                :
                <div className="flex justify-center">
                    <Spinner className="w-auto"/>
                </div>
            }
        </button>
    );
}

export default SubmitSensor;