// add map
mapboxgl.accessToken = mapToken;
console.log(campground.geometry.coordinates);
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 8 // starting zoom
});


map.addControl(new mapboxgl.NavigationControl());

// add marker
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({offset: 25})
        .setHTML(
          `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    .addTo(map)