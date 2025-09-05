import { useState, useEffect } from 'react';

export const useGeoLocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        const handleSuccess = (position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        };

        const handleError = (err) => {
            setError(err.message);
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }, []);

    return { location, error };
};