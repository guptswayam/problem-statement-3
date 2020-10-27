// If there is only one point on a map
/*mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VwdHN3YXlhbSIsImEiOiJjazhmODB5ajcwMDlsM21sNTR6OGNmMzd0In0.CzXmbwG8fDpKq05re607ug';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/guptswayam/ck8f87qyl18z21invez6nssds',
scrollZoom: false,
center:[77.1202,28.6878],
zoom: 16
});

map.addControl(new mapboxgl.NavigationControl());

const bounds = new mapboxgl.LngLatBounds();

const el=document.createElement("div");
el.className="marker";

new mapboxgl.Marker({
    element: el,
    anchor: "bottom"
}).setLngLat([77.1202,28.6878]).addTo(map);*/






//If there is multiple points on a map
export const displaymap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VwdHN3YXlhbSIsImEiOiJjazhmODB5ajcwMDlsM21sNTR6OGNmMzd0In0.CzXmbwG8fDpKq05re607ug';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/guptswayam/ck8f87qyl18z21invez6nssds',
        scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl());

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        //create marker
        const el = document.createElement("div");
        el.className = "marker";

        //Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);

        //add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>${loc.description}</p>`).addTo(map);

        //extend map bound to include current location
        bounds.extend(loc.coordinates);
    });


    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100
        }
    });
}