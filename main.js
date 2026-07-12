// Real-time weather annotations using Open-Meteo (no API key required)
(function(){
  const annotations = document.getElementById('annotations');
  const forecastEl = document.getElementById('forecast');
  const status = document.getElementById('status');
  const updateInterval = 60_000; // 60 seconds
  let latestWeather = null;

  function setStatus(t){ status.textContent = t }

  const weatherCodes = {
    0: 'Clear sky',1: 'Mainly clear',2: 'Partly cloudy',3: 'Overcast',45: 'Fog',48: 'Depositing rime fog',
    51: 'Drizzle (light)',53: 'Drizzle (moderate)',55: 'Drizzle (dense)',
    61: 'Rain (slight)',63: 'Rain (moderate)',65: 'Rain (heavy)',
    71: 'Snow (slight)',73: 'Snow (moderate)',75: 'Snow (heavy)',
    80: 'Rain showers (slight)',81: 'Rain showers (moderate)',82: 'Rain showers (violent)',
    95: 'Thunderstorm',96: 'Thunderstorm with slight hail',99: 'Thunderstorm with heavy hail'
  };

  function codeLabel(code){ return 'Mostly clear' }

  function clearAnnotations(){ annotations.innerHTML = '' }

  function addAnnotation(title, text){
    const d = document.createElement('div'); d.className = 'annotation';
    const label = document.createElement('div'); label.className = 'label'; label.textContent = title;
    const val = document.createElement('div'); val.className = 'value'; val.textContent = text;
    d.appendChild(label); d.appendChild(val); annotations.appendChild(d);
  }

  async function loadSVG(iconName){
    try{
      const res = await fetch(`icons/${iconName}.svg`);
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const svg = doc.documentElement;
      svg.setAttribute('width','40'); svg.setAttribute('height','40');
      const wrap = document.createElement('div'); wrap.className = 'weather-icon icon-' + iconName;
      wrap.appendChild(svg);
      return wrap;
    }catch(e){
      const img = document.createElement('img'); img.src = `icons/${iconName}.svg`; img.className = 'weather-icon icon-' + iconName; return img;
    }
  }

  async function render(cw){
    clearAnnotations();
    addAnnotation('Location', 'Marietta, GA');
    addAnnotation('Temperature', `${cw.temperature} °F`);
    addAnnotation('Wind', `${cw.windspeed} mph @ ${cw.winddirection}°`);
    // Condition with animated SVG icon (inlined)
    const iconName = codeToIcon(cw.weathercode);
    const condContainer = document.createElement('div'); condContainer.className = 'value';
    const svgEl = await loadSVG(iconName);
    svgEl.setAttribute ? svgEl.setAttribute('role','img') : svgEl.setAttribute && svgEl.setAttribute('role','img');
    condContainer.appendChild(svgEl);
    condContainer.appendChild(document.createTextNode(codeLabel(cw.weathercode)));
    const label = document.createElement('div'); label.className = 'label'; label.textContent = 'Condition';
    const wrap = document.createElement('div'); wrap.className = 'annotation';
    wrap.appendChild(label); wrap.appendChild(condContainer); annotations.appendChild(wrap);
    addAnnotation('Observed', new Date(cw.time).toLocaleString());
  }

  function clearForecast(){ if(forecastEl) forecastEl.innerHTML = '' }
  function formatDay(dateString){ return new Date(dateString).toLocaleDateString('en-US',{weekday:'short'}) }

  async function renderForecast(daily){
    if(!forecastEl) return;
    clearForecast();
    if(!daily || !daily.time || !daily.time.length) return;

    const days = daily.time.slice(0,7);
    const cards = await Promise.all(days.map(async (dateStr, index) => {
      const card = document.createElement('div'); card.className = 'forecast-card';
      const dayName = document.createElement('div'); dayName.className = 'forecast-day'; dayName.textContent = formatDay(dateStr);
      const iconWrapper = document.createElement('div'); iconWrapper.className = 'forecast-icon';
      const iconName = codeToIcon((daily.weathercode || [])[index] ?? 0);
      const svgEl = await loadSVG(iconName);
      svgEl.setAttribute ? svgEl.setAttribute('role','img') : svgEl.setAttribute && svgEl.setAttribute('role','img');
      iconWrapper.appendChild(svgEl);
      const temps = document.createElement('div'); temps.className = 'forecast-temps';
      const high = document.createElement('div'); high.className = 'forecast-high'; high.textContent = `H ${Math.round((daily.temperature_2m_max || [])[index] ?? 0)}°`;
      const low = document.createElement('div'); low.className = 'forecast-low'; low.textContent = `L ${Math.round((daily.temperature_2m_min || [])[index] ?? 0)}°`;
      temps.appendChild(high); temps.appendChild(low);
      card.appendChild(dayName);
      card.appendChild(iconWrapper);
      card.appendChild(temps);
      return card;
    }));

    cards.forEach(card => forecastEl.appendChild(card));
  }

  function codeToIcon(code){
    if(code === 0 || code === 1) return 'clear';
    if(code === 2) return 'partly_cloudy';
    if(code === 3) return 'cloudy';
    if((code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return 'rain';
    if((code >= 71 && code <= 75)) return 'snow';
    if(code >= 95) return 'thunder';
    if(code === 45 || code === 48) return 'fog';
    return 'cloudy';
  }

  async function fetchWeather(lat, lon){
    try{
      setStatus('Fetching weather…');
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
      const res = await fetch(url);
      if(!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      if(json.current_weather){ latestWeather = json.current_weather; await render(json.current_weather); await renderForecast(json.daily); setStatus('Last update: ' + new Date(json.current_weather.time).toLocaleTimeString()); }
      else setStatus('No current weather returned');
    }catch(err){ console.error(err); setStatus('Weather fetch error'); }
  }

  function useFallback(){ const f = {lat:33.9526, lon:-84.5499}; fetchWeather(f.lat,f.lon); initPrecipMap(f.lat,f.lon); setInterval(()=>fetchWeather(f.lat,f.lon), updateInterval); setStatus('Showing weather for Marietta, GA'); }

  // Force Marietta, GA weather as the primary display.
  useFallback();

  // Initialize precipitation map using Leaflet and RainViewer tiles
  function initPrecipMap(lat, lon){
    const mapEl = document.getElementById('precip-map');
    if(!mapEl || typeof L === 'undefined') return;
    // remove any existing Leaflet instance before resetting the container
    try{ if(mapEl._leafletMap){ mapEl._leafletMap.remove(); mapEl._leafletMap = null; } }catch(e){ console.warn('Failed to remove existing Leaflet map', e); }
    // clear previous contents
    mapEl.innerHTML = '';
    const maxMapZoom = 12;
    const startZoom = 6;
    const map = L.map(mapEl, {
      attributionControl:false,
      minZoom:3,
      maxZoom:maxMapZoom,
      zoomControl:false,
      touchZoom:true,
      tap:true,
      doubleClickZoom:true,
      worldCopyJump:true
    }).setView([lat, lon], startZoom);
    // expose map on element for later invalidateSize calls
    mapEl._leafletMap = map;
    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
      maxZoom:maxMapZoom,
      subdomains:['a','b','c'],
      maxNativeZoom:maxMapZoom
    }).addTo(map);
    // add clearly visible zoom controls and tap support for mobile
    const zoomControl = L.control.zoom({position:'bottomright'}).addTo(map);
    zoomControl.getContainer().classList.add('map-zoom-control');
    map.on('click', function(e){
      const currentZoom = map.getZoom();
      const maxZoom = map.getMaxZoom() || maxMapZoom;
      const nextZoom = Math.min(maxZoom, currentZoom + 1);
      if (currentZoom < maxZoom) {
        map.setView(e.latlng, nextZoom, {animate:true});
      } else {
        map.panTo(e.latlng, {animate:true});
      }
      const weatherSummary = latestWeather ? `${codeLabel(latestWeather.weathercode)} · ${Math.round(latestWeather.temperature)}°F` : 'Loading weather...';
      L.popup({closeButton:true,autoClose:true,closeOnClick:true,autoPan:true})
        .setLatLng(e.latlng)
        .setContent(`<strong>Tap zoom</strong><br>${weatherSummary}<br>Radar overlay visible`)
        .openOn(map);
    });

    // add a small handle for dragging
    const handle = document.createElement('div'); handle.className = 'map-handle'; handle.innerHTML = '≡'; mapEl.appendChild(handle);
    // add a dock button to snap back into the grid
    const dock = document.createElement('button'); dock.className = 'map-dock'; dock.title = 'Dock map'; dock.innerHTML = '⤒'; mapEl.appendChild(dock);
    // ensure visible size
    map.whenReady(() => {
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 250);
    });

    async function loadRainViewer(){
      try{
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if(!res.ok) throw new Error('RainViewer json error');
        const json = await res.json();
        const radar = json && json.radar ? json.radar : {};
        const forecastFrames = radar.forecast || radar.nowcast || [];
        const fallbackFrames = radar.past || [];
        const frames = forecastFrames.length ? forecastFrames : fallbackFrames;
        if(frames.length === 0) return;
        const frame = frames[frames.length - 1];
        const tilePath = frame.path || `/v2/radar/${frame.time}`;
        const url = `${json.host || 'https://tilecache.rainviewer.com'}${tilePath}/256/{z}/{x}/{y}/2/1_0.png`;
        if(map._rainLayer) map.removeLayer(map._rainLayer);
        const rainLayer = L.tileLayer(url, {
          opacity:0.52,
          zIndex:10,
          className:'rain-overlay',
          minZoom:3,
          maxZoom:maxMapZoom,
          maxNativeZoom:maxMapZoom,
          noWrap:true
        });
        rainLayer.addTo(map);
        map._rainLayer = rainLayer;
      }catch(e){ console.warn('RainViewer load failed', e); }
    }

    // initial load and periodic refresh
    loadRainViewer();
    setInterval(loadRainViewer, 5 * 60_000);

    // enable dragging via the handle
    initMapDraggable(mapEl, handle);
    // docking behavior
    dock.addEventListener('click', ()=>{ dockMap(mapEl); });
  }

  // Make the precipitation panel draggable via a handle (works with touch)
  function initMapDraggable(mapEl, handle){
    if(!mapEl || !handle) return;
    let dragging = false, startX=0, startY=0, origX=0, origY=0;
    function onPointerDown(e){
      e.preventDefault();
      dragging = true; mapEl.classList.add('precip-floating'); document.body.classList.add('map-dragging');
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
      const rect = mapEl.getBoundingClientRect(); origX = rect.left; origY = rect.top;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
    function onPointerMove(e){
      if(!dragging) return;
      const cx = e.clientX || (e.touches && e.touches[0].clientX);
      const cy = e.clientY || (e.touches && e.touches[0].clientY);
      const dx = cx - startX, dy = cy - startY;
      const left = Math.max(8, Math.min(window.innerWidth - mapEl.offsetWidth - 8, origX + dx));
      const top = Math.max(8, Math.min(window.innerHeight - mapEl.offsetHeight - 8, origY + dy));
      mapEl.style.left = left + 'px'; mapEl.style.top = top + 'px';
      mapEl.style.right = 'auto'; mapEl.style.bottom = 'auto';
    }
    function onPointerUp(){
      if(!dragging) return; dragging = false; mapEl.classList.remove('map-dragging'); document.body.classList.remove('map-dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      // ensure leaflet map resizes
      setTimeout(()=>{ if(mapEl._leafletMap) mapEl._leafletMap.invalidateSize(); }, 300);
      // store position
      try{ localStorage.setItem('precipPos', JSON.stringify({left:mapEl.style.left, top:mapEl.style.top})); }catch(e){}
    }
    handle.addEventListener('pointerdown', onPointerDown);
    // load saved position
    try{
      const pos = JSON.parse(localStorage.getItem('precipPos'));
      if(pos && pos.left && pos.top){ mapEl.classList.add('precip-floating'); mapEl.style.left = pos.left; mapEl.style.top = pos.top; mapEl.style.right='auto'; mapEl.style.bottom='auto'; }
    }catch(e){}
  }

  function dockMap(mapEl){
    if(!mapEl) return;
    // if not floating, nothing to do besides clearing saved position
    if(!mapEl.classList.contains('precip-floating')){
      try{ localStorage.removeItem('precipPos'); }catch(e){}
      return;
    }
    const dashboard = document.getElementById('dashboard');
    const startRect = mapEl.getBoundingClientRect();
    // create a placeholder in the grid to compute the target position
    const placeholder = document.createElement('div');
    placeholder.style.width = startRect.width + 'px';
    placeholder.style.height = startRect.height + 'px';
    // decide grid column based on current grid template
    try{
      const cols = window.getComputedStyle(dashboard).gridTemplateColumns || '';
      const colCount = cols.split(' ').filter(Boolean).length;
      placeholder.style.gridColumn = (colCount > 1) ? '2' : '1 / -1';
    }catch(e){ placeholder.style.gridColumn = '2' }
    placeholder.style.visibility = 'hidden';
    // insert placeholder at end (grid will place it into column 2 as requested)
    dashboard.appendChild(placeholder);
    // force layout and get target rect
    const targetRect = placeholder.getBoundingClientRect();

    const dx = targetRect.left - startRect.left;
    const dy = targetRect.top - startRect.top;

    // animate using transform
    mapEl.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
    mapEl.style.transform = `translate(${dx}px, ${dy}px)`;

    function finishDock(){
      mapEl.removeEventListener('transitionend', finishDock);
      // cleanup transform and floating state so CSS grid places it
      mapEl.style.transition = '';
      mapEl.style.transform = '';
      mapEl.classList.remove('precip-floating');
      mapEl.style.left = '';
      mapEl.style.top = '';
      mapEl.style.right = '';
      mapEl.style.bottom = '';
      // remove stored pos
      try{ localStorage.removeItem('precipPos'); }catch(e){}
      // remove placeholder
      try{ placeholder.remove(); }catch(e){}
      // ensure leaflet map resizes and is visible
      try{ if(mapEl._leafletMap) mapEl._leafletMap.invalidateSize(); }catch(e){}
    }

    mapEl.addEventListener('transitionend', finishDock);
  }
  
})();
