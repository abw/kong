var Kong = {
    defaults: {
        width:      800,
        height:     600,
        max_wind:   10,
        font:       'Sansation'
    },
    debug: (window.console && window.console.log)
        ? function() { window.console.log.apply(window.console, arguments); }
        : function() { }
};

Raphael.fn.Kong = function (options) {
    var paper  = this,
        config = jQuery.extend({ }, Kong.defaults, options),
        width  = config.width,
        height = config.height,
        font   = paper.getFont(config.font),
        gameno = 0,
        game;

    Kong.debug('Kong %sx%s config: %o', width, height, config);

    function deg2rad(degrees) {
        return degrees * Math.PI / 180;
    };

    function random(max) {
        return Math.round( Math.random() * max );
    };

    function init_game() {
        game = {
            // game counter for stats
            no:     ++gameno,
            // wind can be up to +ve or -ve max_wind 
            wind:   random(config.max_wind * 2) - config.max_wind
        };
        Kong.debug('init_game() => %o', game);
        return game;
    };

    function draw_scene() {
        var sunx = width  * 0.8,
            suny = height * 0.1,
            sunr = height * 0.15,
            rayd = 20,               // 30 degree ray
            rays = 360 / (rayd * 1.5);

        Kong.debug('draw_scene()');

        // sun / sky grad
        paper
            .circle(sunx, suny, sunx * 2)
            .attr({
                gradient:   "r#fac710-#ffeeaa:07-#48cbf0:14-#129:50",
                stroke:     0
            });

        // sun's rays
        for (var n = 0; n < rays; n++) {
            var r = rayd * n * 1.5;
            paper
                .path([
                    // overflow edges of paper so we can rotate without gaps
                    "M",  sunx, suny,
                    "L", -sunx, suny,
                    "L", -sunx, suny + Math.tan(deg2rad(rayd)) * sunx * 2,
                    "z"
                ])
                .attr({
                    fill:       '#ffa',
                    opacity:    0.15,
                    stroke:     0
                })
                .rotate(r, sunx, suny);
        }

        // central sun circle to block rays
        paper
            .circle(sunx, suny, sunr)
            .attr({
                gradient:   "r#fac710-#ffeeaa",
                stroke:     0
            });


        // for testing
        draw_wind_arrow();
    };

    function draw_wind_arrow() {
        var wind = game.wind;
        paper
            .text(width / 2, 20, "Wind: " + game.wind)
            .attr({ 'font-size': 20 });

//      paper.print(width/2, 120, "Wind: " + game.wind, font, 60)
//           .attr({fill: "#f70"});
    };

    function play_game() {
        Kong.debug('play_game()');
    };

    function game_loop() {
        init_game();
        draw_scene();
        play_game();
    };

    // normally we would loop around this forever, but a single call will
    // do for now until we've got everything working
    game_loop();

};

