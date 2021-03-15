// Constants
const electionYears = ['2012', '2016', '2020'];

const mapColors = {
    EMPTY: 'empty',
    ELECTION_RESULTS: 'election-results',
    SEX: 'sex',
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
        let html = '<p>Normal $map BLA BLA BLA.</p>';

        $storyline.html(html);

        resetMap();
        updateMapColors(mapColors.ELECTION_RESULTS);
    } else if (factorType.val() === 'electoral-college') {
        $storyline.loadTemplate('templates/storyline/electoral_college.html');

        updateMap();
        updateMapColors(mapColors.ELECTION_RESULTS);
    } else if (factorType.val() === 'long-term') {
        let factor = $('#long-term-row label.active').find('input');

        if (factor.length === 0) {
            $storyline.html('<h2 class="text-center">Select a long term factor from <span class="green">green</span> buttons.</h2>');
        } else if (factor.val() === 'social-class') {
            $storyline.loadTemplate('templates/storyline/long_term_social_class.html');

            resetMap();
            updateMapColors(mapColors.EMPTY);
        } else if (factor.val() === 'race') {
            $storyline.loadTemplate('templates/storyline/long_term_race.html');

            resetMap();
            updateMapColors(mapColors.EMPTY);
        } else if (factor.val() === 'sex') {
            $storyline.loadTemplate('templates/storyline/long_term_sex.html');

            resetMap();
            updateMapColors(mapColors.SEX);
        } else {
            throw Error('Unexpected value for long term factor: ' + factor.val());
        }
    } else if (factorType.val() === 'short-term') {
        let factor = $('#short-term-row label.active').find('input');
        let html;

        if (factor.length === 0) {
            html = '<h2 class="text-center">Select a short term factor from <span class="green">green</span> buttons.</h2>';
        } else if (factor.val() === 'coronavirus') {
            html = '<p>Coronavirus BLA BLA BLA.</p>';

            resetMap();
            updateMapColors(mapColors.EMPTY);
        } else if (factor.val() === 'voter-turnout') {
            html = '<p>Voter turnout BLA BLA BLA.</p>';

            resetMap();
            updateMapColors(mapColors.EMPTY);
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

// Select the elements needed for the $map, and set their children and attributes
let $map = d3.select('#map'),
    $layer = $map.append('g')
        .attr('id', 'layer'),
    states = $layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
let tooltip = $('#tooltip');
let numberFormat = new Intl.NumberFormat('en-NL'),
    percentageFormat = new Intl.NumberFormat('en-NL', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

// Prepare cartogram variables
let topology,
    geometries,
    dataByState,
    presidentialCandidates,
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
                totalPopulation: dataByState[stateName]['total_population'],
                womenPercentage: dataByState[stateName]['women_percentage'],
                menPercentage: 1 - dataByState[stateName]['women_percentage'],
            };
        });

d3.json('data/usa.topojson', function(topo) {
    d3.json('data/by_state.json', function(data) {
        dataByState = data;

        topology = topo;
        geometries = topology.objects.states.geometries
            // Use only polygons for which we have the data
            .filter((poly) => poly.id in dataByState);

        d3.json('data/presidential_candidates.json', function(candidateData) {
            presidentialCandidates = candidateData;

            initMap();
        });
    });
});

function updateElectionResultsIndicator() {
    let year = $yearSelector.val();

    if (!electionYears.includes(year)) {
        alert(`Unsupported election year selected (${year})`);
        return;
    }

    $electionResultsBar.addClass(`e-${year}`);
    for (let electionYear of electionYears) {
        if (year !== electionYear) {
            $electionResultsBar.removeClass(`e-${electionYear}`);
        }
    }

    $('#election-results-vote-counter-democrats').text(presidentialCandidates[year]['democrats']['votes']);
    $('#election-results-vote-counter-republicans').text(presidentialCandidates[year]['republicans']['votes']);
}

function clearMap() {
    $('#states').remove();
    states = $layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
}

/**
 * Initializes the $map with no colors and warping.
 */
function initMap() {
    clearMap();

    // Create the cartogram features
    let features = carto.features(topology, geometries);
    let path = d3.geo.path().projection(proj);

    // Put the features on the $map
    states = states.data(features)
        .enter().append('path')
        .attr('id', (d) => d.properties.name)
        .attr('d', path)
        .attr('class', 'state')
        .attr('fill', '#fafafa');

    states
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip);
}

function createSvgGradient(svg, id, stops) {
    let svgNS = svg.namespaceURI;
    let grad  = document.createElementNS(svgNS, 'linearGradient');

    grad.setAttribute('id', id);
    grad.setAttribute('x1', '0%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('y2', '0%');

    for (let i = 0; i < stops.length; i++) {
        let attrs = stops[i];
        let stop = document.createElementNS(svgNS, 'stop');

        for (let attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                stop.setAttribute(attr, attrs[attr]);
            }
        }

        grad.appendChild(stop);
    }

    let defs = svg.querySelector('defs') ||
        svg.insertBefore(document.createElementNS(svgNS, 'defs'), svg.firstChild);

    return defs.appendChild(grad);
}

function updateMapColors(palette) {
    if (palette === mapColors.EMPTY) {
        states.transition()
            .delay(750)  // Wait for the $map warping to finish
            .duration(750)
            .ease('linear')
            .attr('fill', '#fafafa');
    } else if (palette === mapColors.ELECTION_RESULTS) {
        states.transition()
            .delay(750)  // Wait for the $map warping to finish
            .duration(750)
            .ease('linear')
            .attr('fill', function(d) {
                let year = $yearSelector.val();

                if (d.properties.electionResults[year].winnerParty === 'DEM') {
                    return 'rgb(26, 106, 255)';
                } else if (d.properties.electionResults[year].winnerParty) {
                    return 'rgb(255, 74, 67)';
                } else {
                    throw Error(`Unrecognized winner party "${d.properties.winnerParty}"`)
                }
            });
    } else if (palette === mapColors.SEX) {
        let map = $('svg#map');

        map.find('defs').empty();

        let i = 2;

        states.attr('fill', function(d) {
                // let id = 'grad' + d.properties.name.replace(/\s/g, '').toLowerCase();
                let id = `grad${i}`

                i++;

                createSvgGradient(map[0], id, [{
                    offset: '0%',
                    style: 'stop-color:rgb(255,182,193);stop-opacity:1'
                }, {
                    offset: `${Math.round(d.properties.womenPercentage * 100)}%`,
                    style: 'stop-color:rgb(255,182,193);stop-opacity:1'
                }, {
                    offset: `${Math.round(d.properties.womenPercentage * 100)}%`,
                    style: 'stop-color:rgb(135,206,250);stop-opacity:1'
                }, {
                    offset: '100%',
                    style: 'stop-color:rgb(135,206,250);stop-opacity:1'
                }]);

                return `url(#${id})`;
            });
    } else {
        throw Error(`Unrecognized map color palette "${palette}"`);
    }
}

/**
 * Update the $map with appropriate warping. Warping values are chosen by reading the dropdowns and radio buttons.
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
 * Reset the $map to the original original shape, i.e. no warping.
 */
function resetMap() {
    let features = carto.features(topology, geometries);
    let path = d3.geo.path().projection(proj);

    states.data(features);
    states.transition()
        .duration(750)
        .ease('linear')
        .attr('d', path);
}

/**
 * Show the tooltip for a state.
 *
 * @param d {Feature} - The feature
 * @param id {Number} - ID of the feature
 * @param data
 */
function showTooltip(d, id, data) {
    // Add highlight around the hovered state
    $(this).css('stroke-width', '3');

    let factorType = $('#factor-selector label.active').find('input');

    if (factorType.val() === 'electoral-college') {
        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/tooltip/electoral_college.html', {
                stateName: d.properties.name,
                population: d.properties.population,
                electoralVotes: d.properties.electoralVotes,
            });
    } else if (factorType.val() === 'short-term') {
        let factor = $('#short-term-row label.active').find('input');

        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/tooltip/short_term.html', {
                stateName: d.properties.name,
            });

    } else if (factorType.val() === 'long-term') {
        let factor = $('#long-term-row label.active').find('input');

        if (factor.val() === 'social-class') {
            tooltip
                .css('left', d3.event.clientX + 15)
                .css('top', d3.event.clientY + 15)
                .loadTemplate('templates/tooltip/long_term.html', {

                    stateName: d.properties.name,

                });
        } else if (factor.val() === 'race') {
            tooltip
                .css('left', d3.event.clientX + 15)
                .css('top', d3.event.clientY + 15)
                .loadTemplate('templates/tooltip/long_term.html', {

                    stateName: d.properties.name,

                });
        } else if (factor.val() === 'sex') {
            tooltip
                .css('left', d3.event.clientX + 15)
                .css('top', d3.event.clientY + 15)
                .loadTemplate('templates/tooltip/long_term_sex.html', {
                    stateName: d.properties.name,
                    population: numberFormat.format(d.properties.totalPopulation),
                    womenPercentage: percentageFormat.format(d.properties.womenPercentage),
                    menPercentage: percentageFormat.format(d.properties.menPercentage),
                });
        }

    } else {
        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/tooltip/context_unset.html', {

                stateName: d.properties.name,
                electoralVotes: d.properties.electoralVotes,
                population: numberFormat.format(d.properties.totalPopulation),
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
    // Remove highlight around the state
    $(this).css('stroke-width', '1.5');

    tooltip.addClass('hidden');
}

/*
function zoomIn() {

}

function zoomOut() {

}
*/
