import Spinner from "../../utils/Spinner";

export default function Submit({ loading }) {
    return (
        <button type="submit" className="mt-4 w-full shadow bg-dol-green focus:shadow-outline focus:outline-none text-white font-bold py-3 px-4 rounded-xl">
            {!loading ?
                <p>
                    Add device
                </p>
                :
                <div className="flex justify-center">
                    <Spinner className="w-auto"></Spinner>
                </div>
            }

        </button>
    );
}