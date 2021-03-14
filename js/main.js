// Constants
const electionYears = new Set(['2012', '2016', '2020']);

const presidentialCandidates = {
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

const mapColors = {
    ELECTION_RESULTS: 'election-results',
};

// Select and configure elements related to pagination
let $yearSelector = $('#year-selector');
let $storyline = $('#storyline');
let $shortTermRow = $('#short-term-row');
let $longTermRow = $('#long-term-row');
let $electionResultsBar = $('#election-results-bar');

$yearSelector.on('change', function() {
    let selected = $('select option:selected').val();

    // Update profile images and related text
    $('#democrat-profile').attr('src', presidentialCandidates[selected].democrats.profile);
    $('#republican-profile').attr('src', presidentialCandidates[selected].republicans.profile);
    $('#democrat-name').text(presidentialCandidates[selected].democrats.name);
    $('#republican-name').text(presidentialCandidates[selected].republicans.name);

    // TODO: Update results indicator using election data

    $('#election-results-row').removeClass('hidden');

    updateMapColors(mapColors.ELECTION_RESULTS);
    updateElectionResultsIndicator();

    setContent();
})

$('#normal-map-select').on('click', function() {
    $shortTermRow.addClass('hidden');
    $longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$('#electoral-college-select').on('click', function() {
    $shortTermRow.addClass('hidden');
    $longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$('#long-term-select').on('click', function() {
    $shortTermRow.addClass('hidden');
    $longTermRow.removeClass('hidden');

    resetContentChangers();
    setContent();
});

$('#short-term-select').on('click', function() {
    $shortTermRow.removeClass('hidden');
    $longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$('.content-changer').on('click', function() {
    setContent();
});

function setContent() {
    let year = $('select option:selected').val();
    let factorType = $('#factor-selector label.active').find('input');

    if (year === 'default') {
        $storyline.html('<h2 class="text-center">Select an election year from the dropdown.</h2>');
    } else if (factorType.length === 0) {
        $storyline.html('<h2 class="text-center">Select a factor type from <span class="teal">teal</span> buttons on the top.</h2>');
    } else if (factorType.val() === 'normal-map') {
        let html = '<p>Normal map BLA BLA BLA.</p>';

        $storyline.html(html);

        initMap();
        updateMapColors(mapColors.ELECTION_RESULTS);
    } else if (factorType.val() === 'electoral-college') {
        let html = '<p>Electoral college BLA BLA BLA.</p>';

        $storyline.html(html);

        updateMap();
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

        $storyline.html(html);
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

        $storyline.html(html);
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
    $layer = map.append('g')
        .attr('id', 'layer'),
    states = $layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
let tooltip = $('#tooltip');


// Prepare cartogram variables
let topology,
    geometries,
    dataByState,
    proj = d3.geo.albersUsa(),
    carto = d3.cartogram()
        .projection(proj)
        .properties(function(d) {
            let stateName = d.id;

            return {
                name: stateName,
                winnerParty: dataByState[stateName]['winner_party'],
                electionResults: {
                    '2012': {
                        winnerParty: dataByState[stateName]['election_results']['2012']['winner_party'],
                        winnerPercentage: dataByState[stateName]['election_results']['2012']['winner_percentage'],
                    },
                    '2016': {
                        winnerParty: dataByState[stateName]['election_results']['2016']['winner_party'],
                        winnerPercentage: dataByState[stateName]['election_results']['2016']['winner_percentage'],
                    },
                    '2020': {
                        winnerParty: dataByState[stateName]['election_results']['2020']['winner_party'],
                        winnerPercentage: dataByState[stateName]['election_results']['2020']['winner_percentage'],
                    },
                },
                electoralVotes: dataByState[stateName]['electoral_college_votes'],
            };
        });

d3.json('data/us.topojson', function(topo) {
    d3.json('data/elections.json', function(data) {
        dataByState = data;

        topology = topo;
        geometries = topology.objects.states.geometries
            // Use only polygons for which we have the data
            .filter((poly) => poly.id in dataByState);

        initMap();
    });
});

function updateElectionResultsIndicator() {
    let year = $yearSelector.val();

    if (!electionYears.has(year)) {
        alert(`Unsupported election year selected (${year})`);
        return;
    }

    $electionResultsBar.addClass(`e-${year}`);
    for (let electionYear of electionYears) {
        if (year !== electionYear) {
            $electionResultsBar.removeClass(`e-${electionYear}`);
        }
    }
}

/**
 * Returns CSS classes for state polygons containing the fill color based on the state properties
 *
 * @param d - Polygon
 * @return {String} - Classes
 * @throws Error - if unrecognized properties are encountered
 */
function fillClass(d) {
    let year = $yearSelector.val();
    if (d.properties.electionResults[year].winnerParty === 'DEM') {
        return 'state democrat-f';
    } else if (d.properties.electionResults[year].winnerParty) {
        return 'state republican-f'
    } else {
        throw Error(`Unrecognized winner party "${d.properties.winnerParty}"`)
    }
}

function clearMap() {
    $('#states').remove();
    states = $layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
}

/**
 * Initializes the map with no colors and warping.
 */
function initMap() {
    clearMap();

    // Create the cartogram features
    let features = carto.features(topology, geometries);
    let path = d3.geo.path().projection(proj);

    // Put the features on the map
    states = states.data(features)
        .enter().append('path')
        .attr('id', (d) => d.properties.name)
        .attr('d', path)
        .attr('class', 'state init');

    states
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip);
}

function updateMapColors() {
    states.attr('class', fillClass);
}

/**
 * Update the map with colors and appropriate warping. Colors and warping values are chosen by reading the
 * dropdowns and radio buttons.
 */
function updateMap() {
    let values = states.data()
        .map((d) => d.properties.electoralVotes)
        .filter((n) => !isNaN(n))
        .sort(d3.ascending)
    let lo = values[0];
    let hi = values[values.length - 1];

    let scale = d3.scale.linear()
        .domain([lo, hi])
        .range([1, 1000]);
    carto.value((d) => scale(d.properties.electoralVotes));

    let features = carto(topology, geometries).features;

    states.data(features);
    states.transition()
        .duration(750)
        .ease('linear')
        .attr('d', carto.path);
}

/**
 * Show the tooltip for a state.
 *
 * @param d {Feature} - The feature
 * @param id {Number} - ID of the feature
 * @param data
 */
function showTooltip(d, id, data) {
    tooltip
        .css('left', d3.event.clientX + 15)
        .css('top', d3.event.clientY + 15)
        .loadTemplate('templates/electoral_college.tooltip.html', {

            // set those according to what you want to see with the tooltip.
            // let us first implement the electoral_college case

            stateName: d.properties.name,
            electoralVotes: d.properties.electoralVotes
        });

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