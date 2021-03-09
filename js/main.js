// Select and configure elements related to pagination
$('#electoral-college-select').on('click', function() {
    $('#short-term-row').addClass('hidden');
    $('#long-term-row').addClass('hidden');
});

$('#long-term-select').on('click', function() {
    $('#short-term-row').addClass('hidden');
    $('#long-term-row').removeClass('hidden');
});

$('#short-term-select').on('click', function() {
    $('#long-term-row').addClass('hidden');
    $('#short-term-row').removeClass('hidden');
});

// Select the elements needed for the map, and set their children and attributes
let map = d3.select('#map'),
    layer = map.append('g')
        .attr('id', 'layer'),
        // .attr('transform', 'translate(' + [-38, 32] + ')' + 'scale(' + 0.94 + ')'),
    states = layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
let tooltip = $('#tooltip');

// Prepare cartogram variables
let proj = d3.geo.albersUsa();  // Map projection, scale and center will be defined later
let topology,
    geometries,
    dataById = {},
    carto = d3.cartogram()
        .projection(proj)
        .properties(function(d) {
            return {
                name: d.properties.name,
                population: 'PLACEHOLDER',
                electoralVotes: 'PLACEHOLDER',
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

    states
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip);
}

/**
 * Show the tooltip for a state.
 *
 * @param d {Feature} - The feature
 * @param id {Number} - ID of the feature
 */
function showTooltip(d, id) {
    tooltip
        .css('left', d3.event.clientX + 15)
        .css('top', d3.event.clientY + 15)
        .html(['<strong>', d.properties.name, '</strong>',
               '<br>',
               'Population: ', d.properties.population,
               '<br>',
               'Electoral Votes: ', d.properties.electoralVotes,
               '<br>'].join(''));

    tooltip.removeClass('hidden');
}

/**
 * Hide the tooltip.
 *
 * @param d - The feature
 * @param id - ID of the feature
 */
function hideTooltip(d, id) {
    tooltip.addClass('hidden')
}