// Select the elements needed for the map, and set their children and attributes
let map = d3.select('#map'),
    layer = map.append('g')
        .attr('id', 'layer'),
        // .attr('transform', 'translate(' + [-38, 32] + ')' + 'scale(' + 0.94 + ')'),
    states = layer.append('g')
        .attr('id', 'states')
        .selectAll('path');

// Prepare cartogram variables
let proj = d3.geo.albersUsa();  // Map projection, scale and center will be defined later
let topology,
    geometries,
    dataById = {},
    carto = d3.cartogram()
        .projection(proj)
        .properties(function(d) {
            return {
                name: d.properties.name
            };

            // return dataById[d.properties.name];
        });

// Read the geometry data
// cantons.topojson
d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json', function(topo) {
    topology = topo;
    geometries = topology.objects.states.geometries;
    // geometries = topology.objects.cantons.geometries;

    // TODO: Parse the data and make it easily accessible by state ID
    // d3.json('/path/to/data', function(data) {
    //
    // });

    drawMap()
});

function drawMap() {
    // Deform cartogram according to the data
    // let scale = d3.scale.linear()
    //     .domain([1, 14])
    //     .range([1, 1000]);
    // carto.value((d) => scale(getValue(d.properties.name)));

    // Create the cartogram features
    let features = carto.features(topology, geometries),
        path = d3.geo.path().projection(proj);

    // Put the features on the map
    states = states.data(features)
        .enter().append('path')
        .attr('class', 'state')
        .attr('id', (d) => d.properties.name)
        .attr('d', path);
}

// Code to render a static US map
// let svg = d3.select('#map-container');
//
// let path = d3.geoPath();
//
// d3.json('https://d3js.org/us-10m.v1.json', function(error, us) {
//     if (error) throw error;
//
//     svg.append('g')
//         .attr('class', 'states')
//         .attr('fill', 'none')
//         .attr('stroke', '#000')
//         // .attr('stroke-linejoin', 'round')
//         // .attr('stroke-linecap', 'round')
//         .selectAll('path')
//         .data(topojson.feature(us, us.objects.states).features)  // Map data items from array to path elements
//         .enter().append('path')  // Create placeholder path elements
//         .attr('d', path);
// });