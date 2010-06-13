var Kong = {
    defaults: {
        width:      800,
        height:     600,
        max_wind:   10,
//        font:       'Sansation'
        font:       'Boston Traffic'
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
        Kong.debug('draw_scene()');
        // for testing
        paper.circle(width / 2, height / 2, 10).attr({ fill: '#ff7f00' });
        draw_wind_arrow();
    };
    
    function draw_wind_arrow() {
        var wind = game.wind;
        paper.text(width / 2, height - 20, "Wind: " + game.wind)
             .attr({ 'font-size': 20 });
        paper.print(width/2, 120, "Wind: " + game.wind, font, 60)
             .attr({fill: "#f70"});
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

