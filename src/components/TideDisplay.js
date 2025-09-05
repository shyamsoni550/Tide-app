import React from 'react';
import moment from 'moment';

const TideDisplay = ({ tideInfo }) => {
    if (!tideInfo || !tideInfo.extremes) {
        return <div className="text-center text-gray-500 py-4">No tide data available.</div>;
    }

    const now = moment();
    const nextHighTide = tideInfo.extremes.find(t => moment.unix(t.dt).isAfter(now) && t.type === 'High');
    const nextLowTide = tideInfo.extremes.find(t => moment.unix(t.dt).isAfter(now) && t.type === 'Low');

    const getTimeUntil = (tideTime) => {
        if (!tideTime) return 'N/A';
        const duration = moment.duration(moment.unix(tideTime).diff(now));
        const hours = Math.floor(duration.asHours());
        const minutes = Math.floor(duration.asMinutes() % 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-blue-700">Next High Tide:</h3>
                {nextHighTide ? (
                    <div className="mt-2">
                        <p className="text-lg font-bold text-blue-900">{moment.unix(nextHighTide.dt).format('LLL')}</p>
                        <p className="text-sm text-gray-600 mt-1">Time Until: <span className="font-medium">{getTimeUntil(nextHighTide.dt)}</span></p>
                    </div>
                ) : (
                    <p className="text-gray-500 mt-2">No high tide data available.</p>
                )}
            </div>

            <div className="bg-sky-50 p-6 rounded-lg shadow-sm border border-sky-100 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-sky-700">Next Low Tide:</h3>
                {nextLowTide ? (
                    <div className="mt-2">
                        <p className="text-lg font-bold text-sky-900">{moment.unix(nextLowTide.dt).format('LLL')}</p>
                        <p className="text-sm text-gray-600 mt-1">Time Until: <span className="font-medium">{getTimeUntil(nextLowTide.dt)}</span></p>
                    </div>
                ) : (
                    <p className="text-gray-500 mt-2">No low tide data available.</p>
                )}
            </div>
        </div>
    );
};

export default TideDisplay;