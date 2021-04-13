// Constants
const electionYears = ['2012', '2016', '2020'];

const mapColors = {
    EMPTY: 'empty',
    ELECTION_RESULTS: 'election-results',
    SEX: 'sex',
    SOCIAL_CLASS: 'social-class',
    RACE: 'race',
    COVID: 'covid',
    INTERNET_USAGE: 'internet-usage',
};

const programStates = {
    DEFAULT: 'default',
    ELECTORAL_COLLEGE: 'electoral-college',
    MID: 'mid',
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

const STORY_STEP_TIMEOUT = 15000; // 15,000 ms == 15s

/**
 * Event handling
 */
let currentProgramState = programStates.DEFAULT;
let $yearSelector = $('#year-selector'),
    $normalMapSelect = $('#normal-map-select'),
    $electoralCollegeSelect = $('#electoral-college-select'),
    $longTermSelect = $('#long-term-select'),
    $shortTermSelect = $('#short-term-select'),
    $normalMapSelectLabel = $('#normal-map-select-label'),
    $electoralCollegeSelectLabel = $('#electoral-college-select-label'),
    $longTermSelectLabel = $('#long-term-select-label'),
    $shortTermSelectLabel = $('#short-term-select-label'),
    $storyline = $('#storyline'),
    $shortTermRow = $('#short-term-row'),
    $longTermRow = $('#long-term-row'),
    $electionResultsBar = $('#election-results-bar');
$('[data-toggle="tooltip"]').tooltip(); // Enable Bootstrap tooltips

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

$normalMapSelect.on('click', function() {
    $shortTermRow.addClass('hidden');
    $longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$electoralCollegeSelect.on('click', function() {
    $shortTermRow.addClass('hidden');
    $longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$longTermSelect.on('click', function() {
    $shortTermRow.addClass('hidden');
    $longTermRow.removeClass('hidden');

    resetContentChangers();
    setContent();
});

$shortTermSelect.on('click', function() {
    $shortTermRow.removeClass('hidden');
    $longTermRow.addClass('hidden');

    resetContentChangers();
    setContent();
});

$('.content-changer').on('click', function() {
    setContent();
});

$('#story-start').on('click', function() {
    storyStart();
});

$('#story-toggle').on('click', function() {
    storyToggle();
});

$('#story-stop').on('click', function() {
    storyStop();
});

/**
 * Functions to change content. These functions update the map shape, color and accompanying text.
 */
function setContent() {
    let year = $('select option:selected').val();
    let factorType = $('#factor-selector label.active').find('input');

    if (year === 'default') {
        $storyline.html('<h2 class="text-center">Select an election year from the dropdown.</h2>');

        currentProgramState = programStates.DEFAULT;
    } else if (factorType.length === 0) {
        $storyline.html('<h2 class="text-center">Select a factor type from <span class="teal">teal</span> buttons on the top.</h2>');

        currentProgramState = programStates.DEFAULT;
    } else if (factorType.val() === 'normal-map') {
        $storyline.loadTemplate('templates/storyline/normal_map.html');

        resetMap();
        updateMapColors(mapColors.ELECTION_RESULTS);

        currentProgramState = programStates.DEFAULT;
    } else if (factorType.val() === 'electoral-college') {
        $storyline.loadTemplate('templates/storyline/electoral_college.html');

        updateMap(programStates.ELECTORAL_COLLEGE);
        updateMapColors(mapColors.ELECTION_RESULTS);

        currentProgramState = programStates.ELECTORAL_COLLEGE;
    } else if (factorType.val() === 'long-term') {
        let factor = $('#long-term-row label.active').find('input');

        if (factor.length === 0) {
            $storyline.html('<h2 class="text-center">Select a long term factor from <span class="green">green</span> buttons.</h2>');

            currentProgramState = programStates.MID;
        } else if (factor.val() === 'social-class') {
            $storyline.loadTemplate('templates/storyline/long_term_social_class.html');

            updateMap(programStates.LONG_TERM.SOCIAL_CLASS);
            updateMapColors(mapColors.SOCIAL_CLASS);

            currentProgramState = programStates.LONG_TERM.SOCIAL_CLASS;
        } else if (factor.val() === 'race') {
            $storyline.loadTemplate('templates/storyline/long_term_race.html');

            resetMap();
            updateMapColors(mapColors.RACE);

            currentProgramState = programStates.LONG_TERM.RACE;
        } else if (factor.val() === 'sex') {
            $storyline.loadTemplate('templates/storyline/long_term_sex.html');

            resetMap();
            updateMapColors(mapColors.SEX);

            currentProgramState = programStates.LONG_TERM.SEX;
        } else {
            throw Error('Unexpected value for long term factor: ' + factor.val());
        }
    } else if (factorType.val() === 'short-term') {
        let factor = $('#short-term-row label.active').find('input');
        let html;

        if (factor.length === 0) {
            html = '<h2 class="text-center">Select a short term factor from <span class="green">green</span> buttons.</h2>';

            currentProgramState = programStates.MID;
        } else if (factor.val() === 'special') {
            resetMap();

            if (year === '2020') {
                $storyline.loadTemplate('templates/storyline/short_term_2020_corona.html');

                updateMapColors(mapColors.COVID);
            } else if (year === '2016') {
                $storyline.loadTemplate('templates/storyline/short_term_2016.html');

                updateMapColors(mapColors.INTERNET_USAGE);
            } else if (year === '2012') {
                $storyline.loadTemplate('templates/storyline/short_term_2012.html');

                updateMapColors(mapColors.INTERNET_USAGE);
            }


            currentProgramState = programStates.SHORT_TERM.SPECIFIC;
        } else if (factor.val() === 'voter-turnout') {
            $storyline.loadTemplate('templates/storyline/short_term_voterturnout.html');

            updateMap(programStates.SHORT_TERM.VOTER_TURNOUT);
            updateMapColors(mapColors.ELECTION_RESULTS);

            currentProgramState = programStates.SHORT_TERM.VOTER_TURNOUT;
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

/**
 * Select the elements needed for the map, and set their children and attributes
 */
let $map = d3.select('#map'),
    $layer = $map.append('g')
        .attr('id', 'layer'),
    $states = $layer.append('g')
        .attr('id', 'states')
        .selectAll('path'),
    $legend = d3.select('#legend')
        .append('g');
let tooltip = $('#tooltip'),
    $stateModal = $('#stateModal');
let numberFormat = new Intl.NumberFormat('en-NL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }),
    percentageFormat = new Intl.NumberFormat('en-NL', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

/**
 * Cartogram-related variables
 */
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
                        voterTurnout: dataByState[stateName]['election_results']['2012']['turnout'],
                        internetUsage: dataByState[stateName]['election_results']['2012']['internet_usage'],
                    },
                    '2016': {
                        winnerParty: dataByState[stateName]['election_results']['2016']['winner_party'],
                        winnerPercentage: dataByState[stateName]['election_results']['2016']['winner_percentage'],
                        voterTurnout: dataByState[stateName]['election_results']['2016']['turnout'],
                        internetUsage: dataByState[stateName]['election_results']['2016']['internet_usage'],
                    },
                    '2020': {
                        winnerParty: dataByState[stateName]['election_results']['2020']['winner_party'],
                        winnerPercentage: dataByState[stateName]['election_results']['2020']['winner_percentage'],
                        voterTurnout: dataByState[stateName]['election_results']['2020']['turnout'],
                        covidImpact: dataByState[stateName]['election_results']['2020']['covid_impact'],
                    },
                },
                electoralVotes: dataByState[stateName]['electoral_college_votes'],
                totalPopulation: dataByState[stateName]['total_population'],
                womenPercentage: dataByState[stateName]['women_percentage'],
                menPercentage: 1 - dataByState[stateName]['women_percentage'],
                socialClass: {
                    score: dataByState[stateName]['social_class']['score'],
                    impact: dataByState[stateName]['social_class']['impact'],
                },
                race: {
                    white: dataByState[stateName]['race']['white'],
                    black: dataByState[stateName]['race']['black'],
                    asian: dataByState[stateName]['race']['asian'],
                    hispanic: dataByState[stateName]['race']['hispanic'],
                    native: dataByState[stateName]['race']['native'],
                },
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
    $states = $layer.append('g')
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
    let transition = $states.transition()
        .delay(750);  // Wait for the map warping to finish

    /**
     * Enable smooth transitions with complex program states. Complex program states use special SVG coloring which
     * cannot smoothly be transitioned from.
     * If last state was complex then don't have a transition but just change the colors immediately.
     */
    if (!specialColorProgramStates.includes(currentProgramState)) {
        transition
            .duration(750)
            .ease('linear');
    } else {
        transition
            .duration(0);
    }

    // Remove legend (specific palettes will add it if needed)
    $legend.selectAll('*').remove(); // https://webkid.io/blog/replacing-jquery-with-d3/#empty

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

        // Update legend
        let scale = d3.scale.ordinal()
            .domain(['DEM', 'REP'])
            .range(['rgb(26, 106, 255)', 'rgb(255, 74, 67)']);
        let legendOrdinal = d3.legend.color()
            .shapeWidth(70)
            .orient('horizontal')
            .scale(scale);
        $legend.call(legendOrdinal);
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

        // Update legend
        let scale = d3.scale.ordinal()
            .domain(['Female', 'Male'])
            .range(['rgb(255,182,193)', 'rgb(135,206,250)']);
        let legendOrdinal = d3.legend.color()
            .shapeWidth(70)
            .orient('horizontal')
            .scale(scale);
        $legend.call(legendOrdinal);
    } else if (palette === mapColors.SOCIAL_CLASS) {
        let values = $states.data()
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

        // Update legend
        let legendLinear = d3.legend.color()
            .shapeWidth(40)
            .labelFormat(d3.format(".2f"))
            .orient('horizontal')
            .scale(scale);
        $legend.call(legendLinear);
    } else if (palette === mapColors.RACE) {
        let white = [253, 231, 214];
        let black = [59, 45, 52];
        let asian = [245, 211, 101];
        let hispanic = [149, 91, 69];
        let native = [134, 49, 45];

        // Function which combines the colors for all races. It assumes that the percentages sum up to 1
        let scale = function (d) {
            let red = d.properties.race.white * white[0] + d.properties.race.black * black[0]
                + d.properties.race.asian * asian[0] + d.properties.race.hispanic * hispanic[0]
                + d.properties.race.native * native[0];
            let green = d.properties.race.white * white[1] + d.properties.race.black * black[1]
                + d.properties.race.asian * asian[1] + d.properties.race.hispanic * hispanic[1]
                + d.properties.race.native * native[1];
            let blue = d.properties.race.white * white[2] + d.properties.race.black * black[2]
                + d.properties.race.asian * asian[2] + d.properties.race.hispanic * hispanic[2]
                + d.properties.race.native * native[2];

            return `rgb(${red}, ${green}, ${blue})`;
        }

        transition.attr('fill', function(d) {
            return scale(d);
        });

        let ord = d3.scale.ordinal()
            .domain(['White', 'Black', 'Asian', 'Hispanic', 'Native'])
            .range([`rgb(${white.join(',')})`, `rgb(${black.join(',')})`, `rgb(${asian.join(',')})`, `rgb(${hispanic.join(',')})`, `rgb(${native.join(',')})`]);
        let legendOrdinal = d3.legend.color()
            .shapeWidth(70)
            .orient('horizontal')
            .scale(ord);
        $legend.call(legendOrdinal);
    } else if (palette === mapColors.COVID) {
        let values = $states.data()
            .map((d) => d.properties.electionResults['2020'].covidImpact)
            .filter((n) => !isNaN(n))
            .sort(d3.ascending)
        let lo = values[0];
        let hi = values[values.length - 1];

        let scale = d3.scale.linear()
            .domain([lo, hi])
            .range(['#ffe5e5', '#ff6666']);

        transition.attr('fill', function(d) {
            return scale(d.properties.electionResults['2020'].covidImpact);
        });

        // Update legend
        let legendLinear = d3.legend.color()
            .shapeWidth(40)
            .labelFormat(d3.format(".2f"))
            .orient('horizontal')
            .scale(scale);
        $legend.call(legendLinear);
    } else if (palette === mapColors.INTERNET_USAGE) {
        let year = $yearSelector.val();

        let values = $states.data()
            .map((d) => d.properties.electionResults[year].internetUsage)
            .filter((n) => !isNaN(n))
            .sort(d3.ascending)
        let lo = values[0];
        let hi = values[values.length - 1];

        let scale = d3.scale.linear()
            .domain([lo, hi])
            .range(['#d6eaf8', '#2e86c1']);

        transition.attr('fill', function(d) {
            return scale(d.properties.electionResults[year].internetUsage);
        });

        // Update legend
        let legendLinear = d3.legend.color()
            .shapeWidth(40)
            .labelFormat(d3.format(".2f"))
            .orient('horizontal')
            .scale(scale);
        $legend.call(legendLinear);
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
    $states = $states.data(features)
        .enter().append('path')
        .attr('id', (d) => d.properties.name)
        .attr('d', path)
        .attr('class', 'state')
        .attr('fill', '#fafafa');

    $states
        .on('mousemove', showTooltip)
        .on('mouseout', hideTooltip)
        .on('click', showStatePopup);
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

        objPath = `properties.electionResults.${year}.voterTurnout`;
    } else if (programState === programStates.LONG_TERM.SOCIAL_CLASS) {
        objPath = 'properties.socialClass.impact';
    } else {
        throw Error(`Map updates are not supported for program state "${programState}"`);
    }

    let values = $states.data()
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

    $states.data(features);
    $states.transition()
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

    $states.data(features);
    $states.transition()
        .duration(750)
        .ease('linear')
        .attr('d', path);
}

/* Popup variables and functions */
let $modalFlagImg = $('#modalFlagImg');
let $modalStateName = $('#modalStateName');
let $modalElectoralVotes = $('#modalElectoralVotes');
let $modalPopulation = $('#modalPopulation');
let $modalSocialClassScore = $('#modalSocialClassScore');
let $modalSocialClassImpact = $('#modalSocialClassImpact');
let $modalWhitePercentage = $('#modalWhitePercentage');
let $modalBlackPercentage = $('#modalBlackPercentage');
let $modalAsianPercentage = $('#modalAsianPercentage');
let $modalHispanicPercentage = $('#modalHispanicPercentage');
let $modalNativePercentage = $('#modalNativePercentage');
let $modalWomenPercentage = $('#modalWomenPercentage');
let $modalMenPercentage = $('#modalMenPercentage');
let $modalVoterTurnout2012 = $('#modalVoterTurnout2012');
let $modalVoterTurnout2012Indicator = $('#modalVoterTurnout2012Indicator');
let $modalVoterTurnout2016 = $('#modalVoterTurnout2016');
let $modalVoterTurnout2016Indicator = $('#modalVoterTurnout2016Indicator');
let $modalVoterTurnout2020 = $('#modalVoterTurnout2020');
let $modalVoterTurnout2020Indicator = $('#modalVoterTurnout2020Indicator');
let $modalInternetUsage2012 = $('#modalInternetUsage2012');
let $modalInternetUsage2016 = $('#modalInternetUsage2016');
let $modalCovidImpact = $('#modalCovidImpact');

function showStatePopup(d) {
    // Populate the modal with contents
    $modalFlagImg.attr('src', `https://www.states101.com/img/flags/svg/${d.properties.name.replace(/\s/g, '-').toLowerCase()}.svg`)
    $modalStateName.text(d.properties.name);
    $modalElectoralVotes.text(d.properties.electoralVotes);
    $modalPopulation.text(numberFormat.format(d.properties.totalPopulation));
    // Social Class
    $modalSocialClassScore.text(numberFormat.format(d.properties.socialClass.score));
    $modalSocialClassImpact.text(numberFormat.format(d.properties.socialClass.impact));
    // Race
    $modalWhitePercentage.text(percentageFormat.format(d.properties.race.white));
    $modalBlackPercentage.text(percentageFormat.format(d.properties.race.black));
    $modalAsianPercentage.text(percentageFormat.format(d.properties.race.asian));
    $modalHispanicPercentage.text(percentageFormat.format(d.properties.race.hispanic));
    $modalNativePercentage.text(percentageFormat.format(d.properties.race.native));
    // Sex
    $modalWomenPercentage.text(percentageFormat.format(d.properties.womenPercentage));
    $modalMenPercentage.text(percentageFormat.format(d.properties.menPercentage));
    // Voter Turnout
    $modalVoterTurnout2012.text(percentageFormat.format(d.properties.electionResults['2012'].voterTurnout));
    if (d.properties.electionResults['2012'].voterTurnout < dataByState.USA.turnout['2012']) {
        $modalVoterTurnout2012Indicator.attr('class', 'fa fa-arrow-down');
        $modalVoterTurnout2012Indicator.css('color', 'red');
    } else {
        $modalVoterTurnout2012Indicator.attr('class', 'fa fa-arrow-up');
        $modalVoterTurnout2012Indicator.css('color', 'green');
    }
    $modalVoterTurnout2016.text(percentageFormat.format(d.properties.electionResults['2016'].voterTurnout));
    if (d.properties.electionResults['2016'].voterTurnout < dataByState.USA.turnout['2016']) {
        $modalVoterTurnout2016Indicator.attr('class', 'fa fa-arrow-down');
        $modalVoterTurnout2016Indicator.css('color', 'red');
    } else {
        $modalVoterTurnout2016Indicator.attr('class', 'fa fa-arrow-up');
        $modalVoterTurnout2016Indicator.css('color', 'green');
    }
    $modalVoterTurnout2020.text(percentageFormat.format(d.properties.electionResults['2020'].voterTurnout));
    if (d.properties.electionResults['2020'].voterTurnout < dataByState.USA.turnout['2020']) {
        $modalVoterTurnout2020Indicator.attr('class', 'fa fa-arrow-down');
        $modalVoterTurnout2020Indicator.css('color', 'red');
    } else {
        $modalVoterTurnout2020Indicator.attr('class', 'fa fa-arrow-up');
        $modalVoterTurnout2020Indicator.css('color', 'green');
    }
    // Special short-term factor
    $modalInternetUsage2012.text(percentageFormat.format(d.properties.electionResults['2012'].internetUsage));
    $modalInternetUsage2016.text(percentageFormat.format(d.properties.electionResults['2016'].internetUsage))
    $modalCovidImpact.text(d.properties.electionResults['2020'].covidImpact);

    // Show the modal (we need to show the modal first before we can draw the map because .width() and .height() don't work for elements with style.display == none)
    $stateModal.modal();

    // Draw the state map
    let state = topojson.feature(topology, topology.objects.states).features.filter((s) => s.id === d.properties.name)[0];
    let projection = d3.geo.albers().scale(1).translate([0, 0]);
    let path = d3.geo.path().projection(projection);

    let $stateMap = $('#stateMap');
    let width = $stateMap.width(),
        height = $stateMap.height();
    let b = path.bounds(state),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s)
        .translate(t);

    $stateMap.empty();
    $stateMap = d3.select('#stateMap');  // We need to use the d3 object instead of jQuery

    $stateMap.append('path')
        .datum(state)
        .attr('class', 'state')
        .attr('d', path)
        .attr('id', 'land')
        .attr('fill', '#fafafa');

    $stateMap.append('clipPath')
        .attr('id', 'clip-land')
        .append('use')
        .attr('xlink:href', '#land');
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
        let factor = $('#short-term-row label.active').find('input').val();

        if (factor === 'voter-turnout') {
            tooltip.loadTemplate('templates/tooltip/short_term_voter_turnout.html', {
                    stateName: d.properties.name,
                    voterTurnout: percentageFormat.format(d.properties.electionResults[year].voterTurnout),
                });
        } else if (factor === 'special') {
            let partyIndicatorClass = null;

            if (d.properties.electionResults[year].winnerParty === 'DEM') {
                partyIndicatorClass = 'tooltip-party-indicator democrat-b';
            } else if (d.properties.electionResults[year].winnerParty === 'REP') {
                partyIndicatorClass = 'tooltip-party-indicator republican-b';
            } else {
                throw Error(`Unrecognized winner party "${d.properties.winnerParty}"`);
            }

            if (year === '2020') {
                tooltip.loadTemplate('templates/tooltip/short_term_covid.html', {
                    stateName: d.properties.name,
                    covidImpact: numberFormat.format(d.properties.electionResults['2020'].covidImpact),
                    partyIndicatorClass: partyIndicatorClass,
                });
            } else if (year === '2016' || year === '2012') {
                tooltip.loadTemplate('templates/tooltip/short_term_internet_usage.html', {
                    stateName: d.properties.name,
                    internetUsage: percentageFormat.format(d.properties.electionResults[year].internetUsage),
                    partyIndicatorClass: partyIndicatorClass,
                });
            }
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
            tooltip.loadTemplate('templates/tooltip/long_term_race.html', {
                stateName: d.properties.name,
                partyIndicatorClass: partyIndicatorClass,
                population: numberFormat.format(d.properties.totalPopulation),
                whitePercentage: percentageFormat.format(d.properties.race.white),
                blackPercentage: percentageFormat.format(d.properties.race.black),
                asianPercentage: percentageFormat.format(d.properties.race.asian),
                hispanicPercentage: percentageFormat.format(d.properties.race.hispanic),
                nativePercentage: percentageFormat.format(d.properties.race.native),
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
 */
function hideTooltip(d) {
    // Remove highlight around the state
    $(this).css('stroke-width', '1.5');

    tooltip.addClass('hidden');
}

/**
 * Functions related to controlling the story feature
 */
let storyTimerHandle;
let $storyStoppedGroup = $('#story-stopped-group');
let $storyPlayingGroup = $('#story-playing-group');
let $storyToggleButtonIcon = $('#story-toggle span');

function Timer(callback, delay) {
    let id, started, remaining = delay, running;

    this.start = function() {
        running = true;

        started = new Date();

        let self = this;
        id = setTimeout(function() {
            callback();
            self.restart();
        }, remaining);
    }

    this.pause = function() {
        running = false;
        remaining -= new Date() - started;

        clearTimeout(id);
    }

    this.restart = function() {
        remaining = delay;

        this.start();
    }

    this.isRunning = function() {
        return running;
    }

    this.start();
}

/**
 * When called jumps to the next story step. Currently displayed step is read from the lastProgramState variable.
 *
 * The steps are:
 * 1. 2012 Normal
 * 2. 2016 Normal
 * 3. 2020 Normal
 * 4. 2020 Electoral Votes
 * 5. 2020 Social Class
 * 6. 2020 Race
 * 7. 2020 Sex
 * 8. 2012 Special
 * 9. 2016 Special
 * 10. 2020 Special (Coronavirus)
 * 11. 2016 Voter Turnout
 * 12. 2012 Voter Turnout
 * 13. 2020 Voter Turnout
 *
 * @return null
 */
function storyStep() {
    let year = $yearSelector.val();

    if (currentProgramState === programStates.DEFAULT && year !== '2020') {
        if (year === 'default' || year === null) {
            // 1
            console.log('1');
            $yearSelector.val('2012').trigger('change');

            $normalMapSelectLabel.trigger('click');
            $normalMapSelect.trigger('click');
        } else if (year === '2012') {
            // 2
            console.log('2');
            $yearSelector.val('2016').trigger('change');

            $normalMapSelectLabel.trigger('click');
            $normalMapSelect.trigger('click');
        } else if (year === '2016') {
            // 3
            console.log('3');
            $yearSelector.val('2020').trigger('change');

            $normalMapSelectLabel.trigger('click');
            $normalMapSelect.trigger('click');
        }
    } else if (currentProgramState === programStates.DEFAULT && year === '2020') {
        // 4
        console.log('4');
        $electoralCollegeSelectLabel.trigger('click');
        $electoralCollegeSelect.trigger('click');
    } else if (currentProgramState === programStates.ELECTORAL_COLLEGE) {
        // 5
        console.log('5');
        $longTermSelectLabel.trigger('click');
        $longTermSelect.trigger('click');

        $('#lt-social-class-label').trigger('click');
        $('#lt-social-class').trigger('click');
    } else if (currentProgramState === programStates.LONG_TERM.SOCIAL_CLASS) {
        // 6
        console.log('6');
        $longTermSelectLabel.trigger('click');
        $longTermSelect.trigger('click');

        $('#lt-race-label').trigger('click');
        $('#lt-race').trigger('click');
    } else if (currentProgramState === programStates.LONG_TERM.RACE) {
        // 7
        console.log('7');
        $longTermSelectLabel.trigger('click');
        $longTermSelect.trigger('click');

        $('#lt-sex-label').trigger('click');
        $('#lt-sex').trigger('click');
    } else if (currentProgramState === programStates.LONG_TERM.SEX) {
        // 8
        console.log('8');
        $yearSelector.val('2012').trigger('change');

        $shortTermSelectLabel.trigger('click');
        $shortTermSelect.trigger('click');

        $('#st-special-label').trigger('click');
        $('#st-special').trigger('click');
    } else if (currentProgramState === programStates.SHORT_TERM.SPECIFIC && year === '2012') {
        // 9
        console.log('9');
        $yearSelector.val('2016').trigger('change');

        $shortTermSelectLabel.trigger('click');
        $shortTermSelect.trigger('click');

        $('#st-special-label').trigger('click');
        $('#st-special').trigger('click');
    } else if (currentProgramState === programStates.SHORT_TERM.SPECIFIC && year === '2016') {
        // 10
        console.log('10');
        $yearSelector.val('2020').trigger('change');

        $shortTermSelectLabel.trigger('click');
        $shortTermSelect.trigger('click');

        $('#st-special-label').trigger('click');
        $('#st-special').trigger('click');
    } else if (currentProgramState === programStates.SHORT_TERM.SPECIFIC && year === '2020') {
        // 11
        console.log('11');
        $yearSelector.val('2012').trigger('change');

        $shortTermSelect.trigger('click');

        $('#st-voter-turnout-label').trigger('click');
        $('#st-voter-turnout').trigger('click');
    } else if (currentProgramState === programStates.SHORT_TERM.VOTER_TURNOUT && year === '2012') {
        // 12
        console.log('12');
        $yearSelector.val('2016').trigger('change');

        $shortTermSelect.trigger('click');

        $('#st-voter-turnout-label').trigger('click');
        $('#st-voter-turnout').trigger('click');
    } else if (currentProgramState === programStates.SHORT_TERM.VOTER_TURNOUT && year === '2016') {
        // 13
        console.log('13');
        $yearSelector.val('2020').trigger('change');

        $shortTermSelect.trigger('click');

        $('#st-voter-turnout-label').trigger('click');
        $('#st-voter-turnout').trigger('click');
    }
}

function storyStart() {
    $storyStoppedGroup.addClass('hidden');
    $storyPlayingGroup.removeClass('hidden');

    storyStep(); // Make the first step

    storyTimerHandle = new Timer(storyStep, STORY_STEP_TIMEOUT);
}

function storyToggle() {
    if (storyTimerHandle.isRunning()) {
        // Story is playing, pause it
        storyTimerHandle.pause();

        $storyToggleButtonIcon.removeClass('fa-pause');
        $storyToggleButtonIcon.addClass('fa-play');
    } else {
        // Story is paused, play it
        storyTimerHandle.start();

        $storyToggleButtonIcon.removeClass('fa-play');
        $storyToggleButtonIcon.addClass('fa-pause');
    }
}

function storyStop() {
    $storyStoppedGroup.removeClass('hidden');
    $storyPlayingGroup.addClass('hidden');

    storyTimerHandle.pause();
}