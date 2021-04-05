// Constants
const electionYears = ['2012', '2016', '2020'];

const mapColors = {
    EMPTY: 'empty',
    ELECTION_RESULTS: 'election-results',
    SEX: 'sex',
    SOCIAL_CLASS: 'social-class',
};

const programStates = {
    DEFAULT: 'default',
    NORMAL_MAP: 'normal-map',
    ELECTORAL_COLLEGE: 'electoral-college',
    LONG_TERM: {
        SOCIAL_CLASS: 'social-class',
        RACE: 'race',
        SEX: 'sex',
    },
    SHORT_TERM: {
        SPECIFIC: 'specific',
        VOTER_TURNOUT: 'voter-turnout',
    },
};

const specialColorProgramStates = [programStates.LONG_TERM.SEX];  // These program states have special colors which should not be transitioned to and from

// Set up and configure pagination
let lastProgramState = null;
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

    $('#election-results-row').removeClass('hidden');  // Show results indicator

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

        lastProgramState = programStates.DEFAULT;
    } else if (factorType.val() === 'normal-map') {

        $storyline.loadTemplate('templates/storyline/normal_map.html');
        resetMap();
        updateMapColors(mapColors.ELECTION_RESULTS);

        lastProgramState = programStates.NORMAL_MAP;
    } else if (factorType.val() === 'electoral-college') {
        $storyline.loadTemplate('templates/storyline/electoral_college.html');

        updateMap(programStates.ELECTORAL_COLLEGE);
        updateMapColors(mapColors.ELECTION_RESULTS);

        lastProgramState = programStates.ELECTORAL_COLLEGE;
    } else if (factorType.val() === 'long-term') {
        let factor = $('#long-term-row label.active').find('input');

        if (factor.length === 0) {
            $storyline.html('<h2 class="text-center">Select a long term factor from <span class="green">green</span> buttons.</h2>');
        } else if (factor.val() === 'social-class') {
            $storyline.loadTemplate('templates/storyline/long_term_social_class.html');

            updateMap(programStates.LONG_TERM.SOCIAL_CLASS);
            updateMapColors(mapColors.SOCIAL_CLASS);

            lastProgramState = programStates.LONG_TERM.SOCIAL_CLASS;
        } else if (factor.val() === 'race') {
            $storyline.loadTemplate('templates/storyline/long_term_race.html');

            resetMap();
            updateMapColors(mapColors.EMPTY);

            lastProgramState = programStates.LONG_TERM.RACE;
        } else if (factor.val() === 'sex') {
            $storyline.loadTemplate('templates/storyline/long_term_sex.html');

            resetMap();
            updateMapColors(mapColors.SEX);

            lastProgramState = programStates.LONG_TERM.SEX;
        } else {
            throw Error('Unexpected value for long term factor: ' + factor.val());
        }
    } else if (factorType.val() === 'short-term') {
        let factor = $('#short-term-row label.active').find('input');
        let html;

        if (factor.length === 0) {
            html = '<h2 class="text-center">Select a short term factor from <span class="green">green</span> buttons.</h2>';
        } else if (factor.val() === 'coronavirus' && year === '2020' ) {
            $storyline.loadTemplate('templates/storyline/short_term_2020_corona.html');

            resetMap();
            updateMapColors(mapColors.EMPTY);

            lastProgramState = programStates.SHORT_TERM.SPECIFIC;
        } else if (factor.val() === 'voter-turnout') {
            $storyline.loadTemplate('templates/storyline/short_term_voterturnout.html');

            updateMap(programStates.SHORT_TERM.VOTER_TURNOUT);
            updateMapColors(mapColors.ELECTION_RESULTS);

            lastProgramState = programStates.SHORT_TERM.VOTER_TURNOUT;
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
let $map = d3.select('#map'),
    $layer = $map.append('g')
        .attr('id', 'layer'),
    states = $layer.append('g')
        .attr('id', 'states')
        .selectAll('path');
let tooltip = $('#tooltip');
let numberFormat = new Intl.NumberFormat('en-NL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }),
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
                        voterTurnout: dataByState[stateName]['election_results']['2020']['turnout'],
                    },
                },
                electoralVotes: dataByState[stateName]['electoral_college_votes'],
                totalPopulation: dataByState[stateName]['total_population'],
                womenPercentage: dataByState[stateName]['women_percentage'],
                menPercentage: 1 - dataByState[stateName]['women_percentage'],
                socialClass: {
                    score: dataByState[stateName]['social_class']['score'],
                    impact: dataByState[stateName]['social_class']['impact'],
                }
            };
        });

/**
 * Downloads a single image given a URL
 *
 * @param url - URL of the image
 * @param list - List to which images are added and removed once loaded
 */
function preloadImg(url, list) {
    let img = new Image();

    img.onload = function() {
        let index = list.indexOf(this);

        if (index !== -1) {
            list.splice(index, 1);  // Remove image from the array once it's loaded for memory consumption reasons
        }
    };

    img.src = url;
    list.push(img);
}

/**
 * Downloads all content for the application so there is no wait time.
 */
function preloadContent() {
    if (!preloadContent.list) {
        preloadContent.list = [];
    }

    let list = preloadContent.list;

    for (let stateName of Object.keys(dataByState)) {
        preloadImg(`https://www.states101.com/img/flags/svg/${stateName.replace(/\s/g, '-').toLowerCase()}.svg`, list);
    }

    for (let year of Object.keys(presidentialCandidates)) {
        preloadImg(presidentialCandidates[year]['democrats']['profile'], list);
        preloadImg(presidentialCandidates[year]['republicans']['profile'], list);
    }
}

d3.json('data/usa.topojson', function(topo) {
    d3.json('data/by_state.json', function(data) {
        dataByState = data;

        topology = topo;
        geometries = topology.objects.states.geometries
            // Use only polygons for which we have the data
            .filter((poly) => poly.id in dataByState);

        d3.json('data/presidential_candidates.json', function(candidateData) {
            presidentialCandidates = candidateData;

            preloadContent();  // Preload content so there is no wait time

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
 * Create an SVG linearGradient in the defs child of the given SVG.
 * https://stackoverflow.com/questions/10894377/dynamically-adding-a-svg-gradient/10894745
 *
 * @param svg - SVG element where the linear gradient will be added
 * @param id - ID of the linear gradient that will be created
 * @param stops - Array of objects representing the attributes of stop elements that will be created
 */
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
    let transition = states.transition()
        .delay(750);  // Wait for the map warping to finish

    if (!specialColorProgramStates.includes(lastProgramState)) {
        transition
            .duration(750)
            .ease('linear');
    } else {
        transition
            .duration(0);
    }

    if (palette === mapColors.EMPTY) {
        transition.attr('fill', '#fafafa');
    } else if (palette === mapColors.ELECTION_RESULTS) {
        transition.attr('fill', function(d) {
                let year = $yearSelector.val();

                if (d.properties.electionResults[year].winnerParty === 'DEM') {
                    return 'rgb(26, 106, 255)';
                } else if (d.properties.electionResults[year].winnerParty === 'REP') {
                    return 'rgb(255, 74, 67)';
                } else {
                    throw Error(`Unrecognized winner party "${d.properties.winnerParty}"`);
                }
            });
    } else if (palette === mapColors.SEX) {
        let gradients = $('svg#gradients');

        gradients.find('defs').empty();

        transition.duration(0)
            .attr('fill', function(d) {
                let id = 'grad' + d.properties.name.replace(/\s/g, '').toLowerCase();

                createSvgGradient(gradients[0], id, [{
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
    } else if (palette === mapColors.SOCIAL_CLASS) {
        let values = states.data()
            .map((d) => d.properties.socialClass.score)
            .filter((n) => !isNaN(n))
            .sort(d3.ascending)
        let lo = values[0];
        let hi = values[values.length - 1];

        let scale = d3.scale.linear()
            .domain([lo, hi])
            .range(['#efedf5', '#756bb1']);

        transition.attr('fill', function(d) {
            return scale(d.properties.socialClass.score);
        });
    } else {
        throw Error(`Unrecognized map color palette "${palette}"`);
    }
}

/**
 * Get object property given a string path.
 * https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-and-arrays-by-string-path?page=1&tab=votes
 *
 * @param o {Object} - Object to fetch the property from
 * @param s {String} - String path to the appropriate property, e.g. properties.electoralVotes for object.properties.electoralVotes
 */
Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    let a = s.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
        let k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
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
        .attr('class', 'state')
        .attr('fill', '#fafafa');

    states
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip);
}

/**
 * Update the map with appropriate warping. Warping values are chosen according to the given program state.
 *
 * @param programState - Program state for which to update the map
 */
function updateMap(programState) {
    let objPath = null;
    if (programState === programStates.ELECTORAL_COLLEGE) {
        objPath = 'properties.electoralVotes';
    } else if (programState === programStates.SHORT_TERM.VOTER_TURNOUT) {
        let year = $yearSelector.val();

        // TODO: Remove this check once voter turnout data is added for other years
        if (year !== '2020') {
            throw Error('There is no data for voter turnout other than for the year 2020');
        }

        objPath = `properties.electionResults.${year}.voterTurnout`;
    } else if (programState === programStates.LONG_TERM.SOCIAL_CLASS) {
        objPath = 'properties.socialClass.impact';
    } else {
        throw Error(`Map updates are not supported for program state "${programState}"`);
    }

    let values = states.data()
        .map((d) => Object.byString(d, objPath))
        .filter((n) => !isNaN(n))
        .sort(d3.ascending)
    let lo = values[0];
    let hi = values[values.length - 1];

    let scale = d3.scale.linear()
        .domain([lo, hi])
        .range([1, 1000]);
    carto.value((d) => scale(Object.byString(d, objPath)));

    let features = carto(topology, geometries).features;

    states.data(features);
    states.transition()
        .duration(750)
        .ease('linear')
        .attr('d', carto.path);
}

/**
 * Reset the map to the original original shape, i.e. no warping.
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
        tooltip.loadTemplate('templates/tooltip/electoral_college.html', {
                stateName: d.properties.name,
                population: d.properties.population,
                electoralVotes: d.properties.electoralVotes,
            });
    } else if (factorType.val() === 'short-term') {
        let year = $yearSelector.val();
        let factor = $('#short-term-row label.active').find('input');

        if (factor.val() === 'voter-turnout') {
            tooltip.loadTemplate('templates/tooltip/short_term_voter_turnout.html', {
                    stateName: d.properties.name,
                    voterTurnout: year === '2020' ? percentageFormat.format(d.properties.electionResults[year].voterTurnout) : 'MISSING DATA',
                });
        }
    } else if (factorType.val() === 'long-term') {
        let factor = $('#long-term-row label.active').find('input');

        let year = $yearSelector.val();
        let partyIndicatorClass = null;

        if (d.properties.electionResults[year].winnerParty === 'DEM') {
            partyIndicatorClass = 'tooltip-party-indicator democrat-b';
        } else if (d.properties.electionResults[year].winnerParty === 'REP') {
            partyIndicatorClass = 'tooltip-party-indicator republican-b';
        } else {
            throw Error(`Unrecognized winner party "${d.properties.winnerParty}"`);
        }

        if (factor.val() === 'social-class') {
            tooltip.loadTemplate('templates/tooltip/long_term_social_class.html', {
                stateName: d.properties.name,
                partyIndicatorClass: partyIndicatorClass,
                socialClassScore: numberFormat.format(d.properties.socialClass.score),
                electoralVotes: d.properties.electoralVotes,
                socialClassImpact: numberFormat.format(d.properties.socialClass.impact),
            });
        } else if (factor.val() === 'race') {
            tooltip.loadTemplate('templates/tooltip/long_term.html', {

                    stateName: d.properties.name,

                });
        } else if (factor.val() === 'sex') {
            tooltip.loadTemplate('templates/tooltip/long_term_sex.html', {
                stateName: d.properties.name,
                population: numberFormat.format(d.properties.totalPopulation),
                partyIndicatorClass: partyIndicatorClass,
                womenPercentage: percentageFormat.format(d.properties.womenPercentage),
                menPercentage: percentageFormat.format(d.properties.menPercentage),
            });
        }

    } else {
        tooltip.loadTemplate('templates/tooltip/context_unset.html', {
                stateName: d.properties.name,
                electoralVotes: d.properties.electoralVotes,
                population: numberFormat.format(d.properties.totalPopulation),
                flagImg: `https://www.states101.com/img/flags/svg/${d.properties.name.replace(/\s/g, '-').toLowerCase()}.svg`
            });
    }

    // Show the tooltip
    tooltip.removeClass('hidden');

    // Calculate the position where the tooltip should be
    let tooltipX = d3.event.clientX + 15;
    let tooltipY = d3.event.clientY + 15;

    if (tooltipY + tooltip.outerHeight() > $(window).height()) {
        tooltipY = d3.event.clientY - tooltip.outerHeight();
    }

    tooltip.css('left', tooltipX)
        .css('top', tooltipY);
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
