import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';

const TideChart = ({ tideInfo }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        if (!tideInfo || !tideInfo.extremes) return;

        const ctx = chartRef.current.getContext('2d');
        const data = tideInfo.extremes.map(event => ({
            x: moment.unix(event.dt).format(),
            y: event.height,
        }));

        chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Tide Height (m)',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                    tension: 0.1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour'
                        },
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Height (m)'
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [tideInfo]);

    return <canvas ref={chartRef} />;
};

export default TideChart;