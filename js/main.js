// Constants
var presidentialCandidates = {
    '2012': {
        'democrats': {
            'name': 'Barack Obama',
            'profile': 'https://images-na.ssl-images-amazon.com/images/I/51NuSfifT-L._AC_.jpg'
        },
        'republicans': {
            'name': 'Mitt Romney',
            'profile': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Mitt_Romney_Circle.png'
        }
    },
    '2016': {
        'democrats': {
            'name': 'Hillary Clinton',
            'profile': 'https://pngimg.com/uploads/hillary_clinton/hillary_clinton_PNG26.png'
        },
        'republicans': {
            'name': 'Donald Trump',
            'profile': 'https://paaia.org/wp-content/uploads/2020/02/Donald-Trump-circle-1024x1024.png'
        }
    },
    '2020': {
        'democrats': {
            'name': 'Joe Biden',
            'profile': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Biden_Circle.png'
        },
        'republicans': {
            'name': 'Donald Trump',
            'profile': 'https://paaia.org/wp-content/uploads/2020/02/Donald-Trump-circle-1024x1024.png'
        }
    }
}

// Select and configure elements related to pagination
var storyline = $('#storyline');
var shortTermRow = $('#short-term-row');
var longTermRow = $('#long-term-row');

$('#year-selector').on('change', function() {
    var selected = $('select option:selected').text();

    // Update profile images and related text
    $('#democrat-profile').attr('src', presidentialCandidates[selected].democrats.profile);
    $('#republican-profile').attr('src', presidentialCandidates[selected].republicans.profile);
    $('#democrat-name').text(presidentialCandidates[selected].democrats.name);
    $('#republican-name').text(presidentialCandidates[selected].republicans.name);

    // TODO: Update results indicator using election data

    $('#election-results-row').removeClass('hidden');

    setContent();
})

$('#electoral-college-select').on('click', function() {
    shortTermRow.addClass('hidden');
    longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$('#long-term-select').on('click', function() {
    shortTermRow.addClass('hidden');
    longTermRow.removeClass('hidden');

    resetContentChangers();
    setContent();
});

$('#short-term-select').on('click', function() {
    shortTermRow.removeClass('hidden');
    longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$('.content-changer').on('click', function() {
    setContent();
});

function setContent() {
    var year = $('select option:selected').text();
    var factorType = $('#factor-selector label.active').find('input');

    if (year === 'Choose election year') {
        storyline.html('<h2 class="text-center">Select an election year from the dropdown.</h2>');
    } else if (factorType.length === 0) {
        storyline.html('<h2 class="text-center">Select a factor type from <span class="teal">teal</span> buttons on the top.</h2>');
    } else if (factorType.val() === 'electoral-college') {
        var html = '<p>Electoral college BLA BLA BLA.</p>';

        storyline.html(html);

        // TODO: Update the map
    } else if (factorType.val() === 'long-term') {
        var factor = $('#long-term-row label.active').find('input');
        var html;

        if (factor.length === 0) {
            html = '<h2 class="text-center">Select a long term factor from <span class="green">green</span> buttons.</h2>';
        } else if (factor.val() === 'social-class') {
            html = '<p>Social class BLA BLA BLA.</p>';

            // TODO: Update the map
        } else if (factor.val() === 'race') {
            html = '<p>Race BLA BLA BLA.</p>';

            // TODO: Update the map
        } else if (factor.val() === 'age') {
            html = '<p>Age BLA BLA BLA.</p>';

            // TODO: Update the map
        } else {
            throw Error('Unexpected value for long term factor: ' + factor.val());
        }

        storyline.html(html);
    } else if (factorType.val() === 'short-term') {
        var factor = $('#short-term-row label.active').find('input');
        var html;

        if (factor.length === 0) {
            html = '<h2 class="text-center">Select a short term factor from <span class="green">green</span> buttons.</h2>';
        } else if (factor.val() === 'coronavirus') {
            html = '<p>Coronavirus BLA BLA BLA.</p>';

            // TODO: Update the map
        } else if (factor.val() === 'voter-turnout') {
            html = '<p>Voter turnout BLA BLA BLA.</p>';

            // TODO: Update the map
        } else {
            throw Error('Unexpected value for short term factor: ' + factor.val());
        }

        storyline.html(html);
    } else {
        throw Error('Unexpected value for factor type: ' + factorType.val());
    }
}

setContent();

function resetContentChangers() {
    $('#subnav-container label').removeClass('active');
    $('#subnav-container input').prop('checked', false);
}

// Select the elements needed for the map, and set their children and attributes
var map = d3.select('#map'),
    layer = map.append('g')
        .attr('id', 'layer'),
    // .attr('transform', 'translate(' + [-38, 32] + ')' + 'scale(' + 0.94 + ')'),
    states = layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
var tooltip = $('#tooltip');

// Prepare cartogram variables
var proj = d3.geo.albersUsa();  // Map projection, scale and center will be defined later
var topology,
    geometries,
    carto = d3.cartogram()
        .projection(proj)
        .properties(function(d) {

            var stateName = d.properties.name;

            return {
                name: stateName,
                population: getPopulation(stateName),
                electoralVotes: '',
            }

            // return dataById[d.properties.name];
        });


function getPopulation(stateName){

    //TODO:  Parse the data and make it easily accessible by state ID

    d3.json('./js/indexed_pres.json', function(d)
    {
        console.log(d[stateName]);
        return d[stateName];
    });

}

d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json', function(topo) {

    topology = topo;
    geometries = topology.objects.states.geometries;
    initMap();
});


function initMap() {

    // Deform cartogram according to the data
    // var scale = d3.scale.linear()
    //     .domain([1, 14])
    //     .range([1, 1000]);
    // carto.value((d) => scale(getValue(d.properties.name)));

    const colors = ['white', 'blue', 'red'];

    // Create the cartogram features

    var features = carto.features(topology, geometries);
    var path = d3.geo.path().projection(proj);

    // Put the features on the map
    states = states.data(features)
        .enter().append('path')
        .attr('class', 'state')
        .attr('id', (d) => d.properties.name)
        .attr('d', path)
        .style('fill', () => colors[Math.floor(Math.random() *2) + 1]);

    console.log(features[0].properties)

    states
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip);
}

/**
 * Show the tooltip for a state.
 *
 * @param d {Feature} - The feature
 * @param id {Number} - ID of the feature
 * @param data
 */
function showTooltip(d, id, data) {


    //get context (i.e electoral college)


    if (true) {
        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/electoral_college.tooltip.html', {

                // set those according to what you want to see with the tooltip.
                // let us first implement the electoral_college case

                stateName: d.properties.name,
                population: d.properties.population,
                electoralVotes: 'waiting for value...'
            });
    }
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