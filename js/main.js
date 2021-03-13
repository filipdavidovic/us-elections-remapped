// Constants
let presidentialCandidates = {
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
let storyline = $('#storyline');
let shortTermRow = $('#short-term-row');
let longTermRow = $('#long-term-row');

$('#year-selector').on('change', function() {
    let selected = $('select option:selected').text();

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
    let year = $('select option:selected').text();
    let factorType = $('#factor-selector label.active').find('input');

    if (year === 'Choose election year') {
        storyline.html('<h2 class="text-center">Select an election year from the dropdown.</h2>');
    } else if (factorType.length === 0) {
        storyline.html('<h2 class="text-center">Select a factor type from <span class="teal">teal</span> buttons on the top.</h2>');
    } else if (factorType.val() === 'electoral-college') {
        let html = '<p>Electoral college BLA BLA BLA.</p>';

        storyline.html(html);

        // TODO: Update the map
    } else if (factorType.val() === 'long-term') {
        let factor = $('#long-term-row label.active').find('input');
        let html;

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
        let factor = $('#short-term-row label.active').find('input');
        let html;

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
let map = d3.select('#map'),
    layer = map.append('g')
        .attr('id', 'layer'),
    // .attr('transform', 'translate(' + [-38, 32] + ')' + 'scale(' + 0.94 + ')'),
    states = layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
let tooltip = $('#tooltip');


// Prepare cartogram letiables
let proj = d3.geo.albersUsa();  // Map projection, scale and center will be defined later
let topology,
    geometries,
    dataByState,
    carto = d3.cartogram()
        .projection(proj)
        .properties(function(d) {
            let stateName = d.properties.name;

            if (stateName in dataByState) {
                return {
                    name: stateName,
                    winnerParty: dataByState[stateName]['winner_party'],
                    electoralVotes: dataByState[stateName]['electoral_college_votes'],
                };
            } else {
                return {
                    excluded: true,
                }
            }
        });

d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json', function(topo) {

    topology = topo;
    geometries = topology.objects.states.geometries;

    d3.json('data/indexed_pres.json', function(data)
    {
        dataByState = data;

        initMap();
    });
});


function initMap() {

    // Deform cartogram according to the data
    // let scale = d3.scale.linear()
    //     .domain([1, 14])
    //     .range([1, 1000]);
    // carto.value((d) => scale(getValue(d.properties.name)));

    // Create the cartogram features
    let features = carto.features(topology, geometries);
    let path = d3.geo.path().projection(proj);

    // Put the features on the map
    states = states.data(features)
        .enter().append('path')
        .filter((d) => 'name' in d.properties)
        .attr('id', (d) => d.properties.name)
        .attr('d', path)
        .attr('class', function(d) {
            if (d.properties.winnerParty === 'DEM') {
                return 'state democrat-f';
            } else if (d.properties.winnerParty === 'REP') {
                return 'state republican-f'
            } else {
                throw Error(`Unrecognized winner party "${d.properties.winnerParty}"`)
            }
        });

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