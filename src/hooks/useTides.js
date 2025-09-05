import { useState, useEffect } from 'react';
import { useGeoLocation } from './useGeoLocation';
import { useLocalStorage } from './useLocalStorage';
import { fetchTideData } from '../api/tideapi';

export const useTides = () => {
    const [tideInfo, setTideInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { location, error: geoError } = useGeoLocation();
    const [lastLocation, setLastLocation] = useLocalStorage('lastLocation', null);

    useEffect(() => {
        const getTides = async (lat, lon) => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchTideData(lat, lon);
                setTideInfo(data);
                setLastLocation({ latitude: lat, longitude: lon });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (location) {
            getTides(location.latitude, location.longitude);
        } else if (lastLocation) {
            getTides(lastLocation.latitude, lastLocation.longitude);
        } else if (!location && !lastLocation && !geoError) {
            setLoading(false);
        }
    }, [location, lastLocation, setLastLocation, geoError]);

    return { tideInfo, loading, error, location, lastLocation, clearLastLocation: () => setLastLocation(null) };
};