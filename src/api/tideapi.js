const MARINE_API_URL = "https://marine-api.open-meteo.com/v1/marine";

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const findTideExtremes = (times, heights) => {
  const extremes = [];

  for (let index = 1; index < heights.length - 1; index += 1) {
    const previous = heights[index - 1];
    const current = heights[index];
    const next = heights[index + 1];

    if (!isNumber(previous) || !isNumber(current) || !isNumber(next)) continue;

    const isHigh = current >= previous && current > next;
    const isLow = current <= previous && current < next;

    if (isHigh || isLow) {
      const timestamp = Number(times[index]);
      extremes.push({
        date: new Date(timestamp * 1000).toISOString(),
        dt: timestamp,
        height: current,
        type: isHigh ? "High" : "Low"
      });
    }
  }

  return extremes;
};

export const fetchTideData = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: [
      "sea_level_height_msl",
      "wave_height",
      "wave_direction",
      "wave_period",
      "swell_wave_height"
    ].join(","),
    current: [
      "sea_level_height_msl",
      "wave_height",
      "wave_direction",
      "wave_period",
      "swell_wave_height"
    ].join(","),
    forecast_days: "3",
    timeformat: "unixtime",
    timezone: "GMT"
  });

  const response = await fetch(`${MARINE_API_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo Marine request failed with status ${response.status}`);
  }

  const data = await response.json();
  const hourly = data.hourly || {};
  const times = hourly.time || [];
  const heights = hourly.sea_level_height_msl || [];

  if (!times.length || !heights.length) {
    throw new Error("No modeled tide data is available for this location");
  }

  return {
    extremes: findTideExtremes(times, heights),
    current: data.current || null,
    hourly,
    hourly_units: data.hourly_units || {},
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    provider: "Open-Meteo Marine",
    disclaimer:
      "Modeled sea-level height includes tides but is referenced to global mean sea level. Do not use it for coastal navigation."
  };
};
