$(function() {
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

    /**
     * Initialize the cartogram and make it ready for future manipulations.
     */
    function initMap() {
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
     * Set up the map and the text panel. This function is called from all event handlers. It collects the options that
     * the user selected and updates the DOM accordingly.
     */
    function setContent() {
        let selectedYear = $('select option:selected').text();
        let $factorType = $('#factor-selector label.active').find('input');

        if (selectedYear === 'Choose election year') {
            $storyline.html('<h2 class="text-center" style="position:absolute;top:40%;">Select an election year from the dropdown.</h2>');
        } else if (!$factorType.length) {
            $storyline.html('<h2 class="text-center" style="position:absolute;top:40%;">Select a factor type from <span class="teal">teal</span> buttons on the top.</h2>');
        } else if ($factorType.val() === 'electoral-college') {
            let html = '<p>Electoral college BLA BLA BLA.</p>';

            $storyline.html(html);

            // TODO: Update the map
        } else if ($factorType.val() === 'long-term') {
            let $factor = $('#long-term-row label.active').find('input');
            let html;

            if (!$factor.length) {
                html = '<h2 class="text-center" style="position:absolute;top:40%;">Select a long term factor from <span class="green">green</span> buttons.</h2>';
            } else if ($factor.val() === 'social-class') {
                html = '<p>Social class BLA BLA BLA.</p>';

                // TODO: Update the map
            } else if ($factor.val() === 'race') {
                html = '<p>Race BLA BLA BLA.</p>';

                // TODO: Update the map
            } else if ($factor.val() === 'age') {
                html = '<p>Age BLA BLA BLA.</p>';

                // TODO: Update the map
            } else {
                throw Error('Unexpected value for long term factor: ' + $factor.val());
            }

            $storyline.html(html);
        } else if ($factorType.val() === 'short-term') {
            let $factor = $('#short-term-row label.active').find('input');
            let html;

            if (!$factor.length) {
                html = '<h2 class="text-center" style="position:absolute;top:40%;">Select a short term factor from <span class="green">green</span> buttons.</h2>';
            } else if ($factor.val() === 'coronavirus') {
                html = '<p>Coronavirus BLA BLA BLA.</p>';

                // TODO: Update the map
            } else if ($factor.val() === 'voter-turnout') {
                html = '<p>Voter turnout BLA BLA BLA.</p>';

                // TODO: Update the map
            } else {
                throw Error('Unexpected value for short term factor: ' + $factor.val());
            }

            $storyline.html(html);
        } else {
            throw Error('Unexpected value for factor type: ' + $factorType.val());
        }
    }

    /**
     * Deselects all options. This function is called whenever a factor type is chosen to reset specific factor options.
     */
    function resetContentChangers() {
        $('#subnav-container label').removeClass('active');
        $('#subnav-container input').prop('checked', false);
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

    // Configure elements related to pagination and content
    let $storyline = $('#storyline');
    let $shortTermRow = $('#short-term-row');
    let $longTermRow = $('#long-term-row');

    $('#year-selector').on('change', function() {
        let selectedYear = $('select option:selected').text();

        // Update profile images and related text
        $('#democrat-profile').attr('src', presidentialCandidates[selectedYear].democrats.profile);
        $('#republican-profile').attr('src', presidentialCandidates[selectedYear].republicans.profile);
        $('#democrat-name').text(presidentialCandidates[selectedYear].democrats.name);
        $('#republican-name').text(presidentialCandidates[selectedYear].republicans.name);

        // TODO: Update results indicator using election data

        $('#election-results-row').removeClass('hidden');

        setContent();
    })

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

    setContent();  // Initialize the content

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

    // Load the geometries for the map and accompanying data
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json', function(topo) {
        topology = topo;
        geometries = topology.objects.states.geometries;
        // geometries = topology.objects.cantons.geometries;

        // TODO: Parse the data and make it easily accessible by state ID
        // d3.json('/path/to/data', function(data) {
        //
        // });

        initMap()
    });
});