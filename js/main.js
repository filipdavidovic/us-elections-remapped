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
let electionResultRowBefore = $('#election-results-row::before');
let electionResultRowAfter = $('.election-results-row::after ');

$('#year-selector').on('change', function() {
    let selected = $('select option:selected').text();

    // Update profile images and related text
    $('#democrat-profile').attr('src', presidentialCandidates[selected].democrats.profile);
    $('#republican-profile').attr('src', presidentialCandidates[selected].republicans.profile);
    $('#democrat-name').text(presidentialCandidates[selected].democrats.name);
    $('#republican-name').text(presidentialCandidates[selected].republicans.name);

    // TODO: Update results indicator using election data

    console.log(electionResultRowBefore.css("width"));
    //electionResultRowAfter.css("width", "0%");

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

/** set up static HTML messages to be displayed here **/

var template_electoralCollege = '<p class="fade-in" style="padding:20px"> The United States Electoral College is the group of presidential electors required by the Constitution to form every four years for the sole purpose of electing the president and vice president. Each state appoints electors according to its legislature, equal in number to its congressional delegation (senators and representatives). '+
    '<br> <br> Hover over each state and see details such as the number of electoral votes or the population. </p>';

var template_longTerm_socialClass = '<p class="fade-in" style="padding:20px">If we sort Americans by formal educational levels, the partisan gaps are not as great. But if we focus on income, class makes more of a difference in how citizens vote now than it did fifty years ago – even with all the racial changes America has experienced. <br> <br> At a time when Americans are becoming steadily more educated, incomes are not increasing much for most people – and income gaps are growing. High earners look to Republicans, while Democrats are, more than ever, the party lower-income Americans want to represent their interests.\n' +
    '\n  <br> <h6 class="fade-in" style="font-size:10px; padding:20px;"> sources: https://scholars.org/contribution/does-class-matter-when-americans-vote <br></p>';

var template_longTerm_race = '<p class="fade-in" style="padding:20px">The demographic composition of an area does not tell the whole story. Patterns in voter registration and voter turnout vary widely by race and ethnicity, with White adults historically more likely to be registered to vote and to turn out to vote than other racial and ethnic groups. Additionally, every presidential election brings its own unique set of circumstances, from the personal characteristics of the candidates, to the economy, to historic events such as a global pandemic. Still, understanding the changing racial and ethnic composition in key states helps to provide clues for how political winds may shift over time.\n' +
    '\n' +
    ' <br> <br> Black, Hispanic and Asian registered voters historically lean Democratic\n' +
    'The ways in which these demographic shifts might shape electoral outcomes are closely linked to the distinct partisan preferences of different racial and ethnic groups. Pew Research Center survey data spanning more than two decades shows that the Democratic Party maintains a wide and long-standing advantage among Black, Hispanic and Asian American registered voters. Among White voters, the partisan balance has been generally stable over the past decade, with the Republican Party holding a slight advantage.\n' +
    '\n <br> <h6 class="fade-in" style="font-size:10px; padding:20px;"> sources: <br>  https://www.pewresearch.org/2020/09/23/the-changing-racial-and-ethnic-composition-of-the-u-s-electorate/ </p>';

var template_longTerm_age = '<p class="fade-in" style="padding:20px"> They say elections are decided by those who show up to vote.\n' +
    'Age is one of the strongest long term factors when it comes to election results. It appears that the young vote less than the old and that turnout climbs with each additional year of life, is one of the most robust findings in political science. <br> <br> There is a link between age and voting behaviour. As people age they are more likely to be at the top of their earnings so they are more likely to favour traditional Conservative policies such as lower taxation on higher earners, i.e the Republican party. In a 2017 general election in UK, 61% of voters nationally who were aged over 65-years old voted Conservative.\n' +
    '\n' +
    'Younger voters may be more concerned with issues such as greater support for education or youth unemployment. Those under 35-years of age tend not to vote for the Conservatives.\n' +
    '\n <br> <h6 class="fade-in" style="font-size:10px; padding:20px;"> sources: <br> https://www.bbc.co.uk/bitesize/guides/zd9bd6f/revision/5 <br> https://medium.com/@PollsAndVotes/age-and-voter-turnout-52962b0884ef </h6> </p>';


/** end of constants section **/

function setContent() {
    let year = $('select option:selected').text();
    let factorType = $('#factor-selector label.active').find('input');

    if (year === 'Choose election year') {
        storyline.html('<h2 class="text-center">Select an election year from the dropdown.</h2>');
    } else if (factorType.length === 0) {
        storyline.html('<h2 class="text-center">Select a factor type from <span class="teal">teal</span> buttons on the top.</h2>');
    } else if (factorType.val() === 'electoral-college') {

        storyline.html(template_electoralCollege);

        // TODO: Update the map
    } else if (factorType.val() === 'long-term') {
        let factor = $('#long-term-row label.active').find('input');
        let html;

        if (factor.length === 0) {
            html = '<h2 class="text-center">Select a long term factor from <span class="green">green</span> buttons.</h2>';
        } else if (factor.val() === 'social-class') {
            html = template_longTerm_socialClass;

        } else if (factor.val() === 'race') {
            html = template_longTerm_race;

        } else if (factor.val() === 'age') {
            html = template_longTerm_age;

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
                    population: dataByState[stateName]['total_votes'],
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

    let factorType = $('#factor-selector label.active').find('input');

    if (factorType.val() === 'electoral-college') {
        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/electoral_college.tooltip.html', {

                // set those according to what you want to see with the tooltip.
                // let us first implement the electoral_college case

                stateName: d.properties.name,
                population: d.properties.population,
                electoralVotes: d.properties.electoralVotes,
            });
    }

    else if (factorType.val() === 'short-term') {
        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/short-term.tooltip.html', {

                stateName: d.properties.name,

            });

    }

    else if (factorType.val() === 'long-term') {
        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/long-term.tooltip.html', {

                stateName: d.properties.name,

            });

    }

    else {  // context not set, display only state name
        tooltip
            .css('left', d3.event.clientX + 15)
            .css('top', d3.event.clientY + 15)
            .loadTemplate('templates/context_unset.tooltip.html', {

                stateName: d.properties.name,

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

/*

function zoomIn() {
    var GFG = document.getElementById("body");
    GFG.style.zoom = GFG.style.zoom + 10;
}

function zoomOut() {
    var GFG = document.getElementById("body");
    GFG.style.zoom = GFG.style.zoom - 1;
}

*/
