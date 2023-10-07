// url of the last 7 day's earthquake json  
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the createMap function.
function createMap(earthquakeMap) {
  // Create the tile layer that will be the background of our map.
  let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object to hold the lightmap layer.
  let baseMaps = {
    "Tile Layer": tileLayer
  };
 
  // Create an overlayMaps object to hold the earthquake layer.
  let overLayer = {
    "Earthquakes": earthquakeMap
  };

  // Create the map object with options.
  let myMap = L.map("map", {
    center: [0, 0],
    zoom: 7,
    layers: [tileLayer, earthquakeMap]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overLayer).addTo(myMap);

  // Create legend after the map is created
  createLegend(myMap);
}

// Create the createMarkers function.
function createMarkers(earthquakeData) {
  // Pull the features property from response.data.
  let features = earthquakeData.features;
  // Initialise an array to hold the earthquake markers.
  let earthquakeMarkers = [];

  // Loop through the features array.
  for (let i = 0; i < features.length; i++) {
    let feature = features[i];

    // Extract the geometric coordinates
    let [lon, lat, depth] = feature.geometry.coordinates;
    let magnitude = feature.properties.mag;

    // For each feature, create a marker, and bind a popup
    let earthquakeMarker = L.circleMarker([lat, lon], {
      radius: magnitude * 2,
      fillColor: getColorBasedOnDepth(depth),
      color: "#000",
      weight: 1,
      opacity: 0.9,
      fillOpacity: 0.8
    });

    // Add popups
    earthquakeMarker.bindPopup(`
      <strong>Magnitude:</strong> ${magnitude}<br>
      <strong>Depth:</strong> ${depth} km<br>
      <strong>Location:</strong> ${feature.properties.place}<br>
      <strong>More info:</strong> <a href="${feature.properties.url}" target="_blank">USGS Event Page</a>
    `);

    // Add the marker to the earthquakeMarkers array.
    earthquakeMarkers.push(earthquakeMarker);
  }

  // Create a layer group and pass it to the createMap function.
  let earthquakeLayerGroup = L.layerGroup(earthquakeMarkers);
  createMap(earthquakeLayerGroup);
}

// Perform an API call. Call createMarkers when it completes.
d3.json(url).then(createMarkers);

// Define the color
function getColorBasedOnDepth(depth) {
  // Define the color scale from light to dark
  let colorScale = d3.scaleLinear()
    .domain([-10, 100])
    .range(['lightblue', 'darkblue']); 

  // Use the color scale to get the color based on the depth
  return colorScale(depth);
}

// Create legend
function createLegend(map) {
  // Create a legend control
  let legend = L.control({ position: "bottomright" });

  // Add legend content
  legend.onAdd = function() {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0, 25, 50, 75, 100];

    for (let i = 0; i < grades.length - 1; i++) {
      div.innerHTML +=
        `<i style="background:${getColorBasedOnDepth(grades[i] + 1)}"></i> ` +
        `${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] : '+'}<br>`;
    }

    return div;
  };

  legend.addTo(map);
}

