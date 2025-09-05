import React from 'react';

const LocationInfo = ({ tideStationName, onClearLocation }) => {
    return (
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700">Your Location</h2>
            <p className="text-lg text-gray-600 mt-2">Nearest Coast: <span className="font-semibold text-blue-600">{tideStationName || 'Finding...'}</span></p>
            {tideStationName && (
                <button
                    onClick={onClearLocation}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                    Clear Location
                </button>
            )}
        </div>
    );
};

export default LocationInfo;