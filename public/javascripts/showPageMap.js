//Load mapbox map
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

//Add controls to the map (also specified on the docs)
map.addControl(new mapboxgl.NavigationControl());

//Set marker, according to the docs
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    //Popup when user clicks
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`  
        )
    )
    .addTo(map)