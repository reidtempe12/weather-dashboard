# Marietta Weather Intelligence

A real-time weather dashboard for Marietta, Georgia, built with modern front-end technologies and live weather APIs. Designed for portfolio demonstration with a polished, dark-themed UI and interactive radar visualization.

## ✨ Features

- **Real-Time Weather Data**: Fetches current conditions (temperature, wind, condition) from Open-Meteo API (no API key required)
- **Live Radar Overlay**: Interactive precipitation radar powered by RainViewer with intensity color legend
- **Dark-Themed Map**: Leaflet.js map with Carto dark tiles for a premium dashboard aesthetic
- **Animated Weather Icons**: Custom SVG icons with smooth, contextual animations
- **Draggable Radar Panel**: Floating weather radar panel with smooth drag-and-dock animation back to grid
- **Responsive Design**: Adapts seamlessly from desktop to mobile viewports
- **Portfolio-Ready**: Clean, professional UI with glass-morphism effects and subtle micro-interactions

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (ES6+), vanilla JavaScript
- **APIs**: 
  - [Open-Meteo](https://open-meteo.com/) — Weather data (free, no key required)
  - [RainViewer](https://www.rainviewer.com/) — Live precipitation radar
- **Libraries**: 
  - [Leaflet.js](https://leafletjs.com/) — Interactive mapping
  - [Carto Tiles](https://carto.com/) — Dark map tiles
- **Design**: CSS Grid, Flexbox, Glass-morphism, Keyframe animations

## 🚀 Quick Start

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/marietta-weather-dashboard.git
   cd marietta-weather-dashboard
   ```

2. Open in your browser:
   ```bash
   # Simply open index.html or use a local server:
   python -m http.server 8000  # then visit http://localhost:8000
   ```

No build process or dependencies required — vanilla JavaScript and CDN libraries only.

## 📁 Project Structure

```
.
├── index.html           # Main page structure
├── main.css             # Styling and animations
├── main.js              # API integration and map initialization
├── README.md            # Project documentation
├── icons/               # SVG weather icons
│   ├── clear.svg
│   ├── partly_cloudy.svg
│   ├── cloudy.svg
│   ├── rain.svg
│   ├── snow.svg
│   ├── fog.svg
│   └── thunder.svg
└── .gitignore           # Git exclusions
```

## 🌐 Live Deployment

### GitHub Pages

1. Push to your GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch and `/root` directory
4. Your dashboard is live at `https://YOUR-USERNAME.github.io/marietta-weather-dashboard`

## 🎨 Design Features

- **Dark Color Palette**: Subtle green background with glassmorphic annotation cards
- **Animated Weather Icons**: Sun rotation, cloud drift, rain cascade, snow float, thunder flash, and fog shimmer
- **Precipitation Legend**: Color-coded rain intensity scale
  - 🟨 **Extreme** (yellow)
  - 🟨 **Heavy** (yellow)
  - 🟣 **Moderate** (purple)
  - 🔵 **Light** (blue)
- **Interactive Radar**: Drag-and-dock map panel with persistent positioning
- **Pulsing Glow Effects**: Subtle micro-animations on caption and controls
- **Touch-Friendly**: Works seamlessly on desktop and mobile devices

## 📊 Data & Coverage

- **Location**: Marietta, Georgia (33.9526°N, 84.5499°W)
- **Weather Source**: Open-Meteo API (no registration required)
- **Radar Source**: RainViewer (free tier)
- **Units**: Fahrenheit, Miles Per Hour
- **Refresh Rate**: Every 60 seconds

## 🗺️ Map Interactions

- **Drag**: Click the hamburger handle (≡) to reposition the radar panel
- **Dock**: Click the dock arrow (⤒) to snap the map back into the grid
- **Persistent**: Browser localStorage remembers your panel position
- **Responsive**: Leaflet handles zoom and pan naturally

## 💡 Code Highlights

- **No Build Tools**: Pure vanilla JavaScript — runs directly in the browser
- **No API Keys**: Open-Meteo requires no authentication
- **Clean Architecture**: Modular functions for weather fetching, rendering, and map management
- **Error Handling**: Graceful fallbacks and error logging
- **Performance**: Optimized animations and event delegation

## 🎯 Future Enhancements

- [ ] Multi-location weather search
- [ ] Hourly forecast timeline
- [ ] Severe weather alerts integration
- [ ] Dark/Light theme toggle
- [ ] 7-day forecast view
- [ ] Temperature unit toggle (°F / °C)

## 📝 License

MIT License — feel free to fork and modify for your own projects.

## 👨‍💻 Author

Built by **Tempa Reid**

---

**Note**: This project is designed for portfolio demonstration. All data is fetched client-side from free, public APIs with no backend required.
