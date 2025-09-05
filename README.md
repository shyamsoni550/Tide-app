# Tide Tracker App

A responsive React web application built with Vite that provides tide information based on user location. Features include tide times, current moon phase, AI-based activity recommendations, and dark mode support.

## Features

- Fetches tide data for the user's current location using WorldTides API.
- Displays next high and low tides with detailed time and height.
- Shows current moon phase and explains its effect on tides.
- AI-based activity recommendations combining tide, weather, wind speed, moon phase, and sunlight data.
- Dark mode toggle for light and dark themes.
- Location persistence using local storage.
- Responsive and visually appealing UI using Tailwind CSS.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd tide-tracker-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser at the provided local URL.

## Configuration

- The app uses the Open-Meteo API for weather data (no API key required).
- The WorldTides API is used for tide data; ensure you have an API key configured in `src/api/tideapi.js`.

## Usage

- Click the "Get Tide Information" button to fetch tide and weather data for your current location.
- Use the dark mode toggle in the header to switch themes.
- View tide times, moon phase, and activity recommendations.

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

## License

MIT License

## Acknowledgments

- WorldTides API for tide data
- Open-Meteo API for weather data
- Tailwind CSS for styling
- React and Vite for the frontend framework and build tool
