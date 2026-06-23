import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import moment from "moment";
import "chartjs-adapter-moment";

const TideChart = ({ tideInfo }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (!tideInfo?.extremes?.length || !chartRef.current) return undefined;

    const ctx = chartRef.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, "rgba(0, 212, 255, 0.32)");
    gradient.addColorStop(0.48, "rgba(0, 229, 160, 0.12)");
    gradient.addColorStop(1, "rgba(0, 212, 255, 0)");

    const glowPlugin = {
      id: "glowLine",
      beforeDatasetsDraw(chart) {
        const { ctx: canvasCtx } = chart;
        canvasCtx.save();
        canvasCtx.shadowColor = "rgba(0, 212, 255, 0.75)";
        canvasCtx.shadowBlur = 18;
        canvasCtx.shadowOffsetX = 0;
        canvasCtx.shadowOffsetY = 0;
      },
      afterDatasetsDraw(chart) {
        chart.ctx.restore();
      },
    };

    const data = tideInfo.extremes.map((event) => ({
      x: moment.unix(event.dt).format(),
      y: event.height,
    }));

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Tide Height",
            data,
            borderColor: "#00D4FF",
            backgroundColor: gradient,
            pointBackgroundColor: "#00E5A0",
            pointBorderColor: "#040D1A",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            borderWidth: 3,
            fill: true,
            tension: 0.42,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(4, 13, 26, 0.92)",
            borderColor: "rgba(0, 212, 255, 0.35)",
            borderWidth: 1,
            titleColor: "#E6F7FF",
            bodyColor: "#A7F3D0",
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => ` ${context.parsed.y.toFixed(2)} m`,
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: { unit: "hour" },
            grid: {
              color: "rgba(148, 163, 184, 0.12)",
              drawBorder: false,
            },
            ticks: {
              color: "rgba(203, 213, 225, 0.72)",
              maxRotation: 0,
            },
          },
          y: {
            grid: {
              color: "rgba(148, 163, 184, 0.12)",
              drawBorder: false,
            },
            ticks: {
              color: "rgba(203, 213, 225, 0.72)",
              callback: (value) => `${value}m`,
            },
          },
        },
      },
      plugins: [glowPlugin],
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [tideInfo]);

  return (
    <div className="h-[320px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default TideChart;
