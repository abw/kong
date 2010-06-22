// Implementation of the classic gorillas.bas game in Javascript, using 
// Raphael. Strictly just for fun.
//
// Written by Andy Wardley, June 2010.  
//
// This is free software distributed under the terms of the Artistic 
// Licence 2.0.
//

var Kong = {
    defaults: {
        width:      800,
        height:     600,
        max_wind:   9,
        clouds:     3,
        trace:      0,
        speed:      8,           // multiplier for pixels/second * wind speed
        font:       'Sansation',
        skyline_height:  0.8,    // top of tallest building at 0.8 x height
	window_height:   0.6,    // window is 0.6 x story (floor) height
        min_buildings:   8,
        max_buildings:   12,
        min_stories:     6,
        max_stories:     16,
        windows:         6,
        building_gap:    0,
        cloud_paths: [
            // Clouds were created as composite paths using Illustrator, 
            // merged and then exported as SVG.  The paths are centred at 
            // 0, 0 and are enclosed by a bounding box 2 units wide and 1 
            // unit high.  They should be scaled to size.
            "M2.835-0.223c0-0.275-0.361-0.506-0.842-0.561c0.016-0.038,0.025-0.079,0.025-0.121c0-0.283-0.378-0.513-0.845-0.513c-0.333,0-0.62,0.118-0.757,0.288c-0.029,0-0.058-0.002-0.087-0.002c-1.072,0-1.94,0.434-1.94,0.97c0,0.014,0.001,0.027,0.002,0.039c-0.712,0.104-1.227,0.4-1.227,0.751c0,0.435,0.798,0.788,1.781,0.788c0.528,0,1.003-0.101,1.329-0.264c0.249,0.162,0.628,0.264,1.053,0.264c0.75,0,1.358-0.32,1.358-0.717c0-0.172-0.114-0.329-0.306-0.453C2.655,0.144,2.835-0.027,2.835-0.223z",
            "M2.834-0.12c0-0.383-0.609-0.693-1.373-0.71c0.039-0.05,0.06-0.105,0.06-0.163c0-0.234-0.349-0.425-0.779-0.425c-0.389,0-0.708,0.155-0.767,0.358c-0.15-0.038-0.313-0.059-0.485-0.059c-0.586,0-1.08,0.243-1.232,0.573c-0.627,0.082-1.093,0.377-1.093,0.73c0,0.417,0.646,0.754,1.442,0.754c0.194,0,0.378-0.02,0.547-0.057c0.093,0.302,0.693,0.536,1.423,0.536c0.636,0,1.174-0.178,1.362-0.423c0.338-0.051,0.589-0.221,0.589-0.426c0-0.072-0.034-0.139-0.088-0.199C2.685,0.242,2.834,0.07,2.834-0.12z",
            "M2.834-0.346c0-0.517-0.804-0.935-1.795-0.935c-0.328,0-0.634,0.046-0.898,0.126c-0.176-0.16-0.438-0.262-0.731-0.262c-0.493,0-0.899,0.289-0.954,0.66c-0.734,0.074-1.291,0.418-1.291,0.833c0,0.462,0.69,0.837,1.548,0.847c0.25,0.293,0.756,0.494,1.339,0.494c0.808,0,1.466-0.385,1.503-0.868C2.295,0.433,2.834,0.076,2.834-0.346z"
        ],
        cloud_style: {
            fill:           '#fff', 
            stroke:         '#ccc',
            opacity:        1.0,
            'stroke-width': 4
        },
        building_style: {
            gradient:       "0-#aaa-#ddd",
            stroke:         '#888',
            'stroke-width': 2
        },
        window_styles: [
            {
                gradient:       "90-#555-#666",
                stroke:         '#444',
                'stroke-width': 1
            },
            {
                gradient:       "90-#ff4-#aa0",
                stroke:         '#996',
                'stroke-width': 1
            }
        ]
    },
    debug: (window.console && window.console.log)
        ? function() { window.console.log.apply(window.console, arguments); }
        : function() { }
};


Raphael.fn.line = function (x1, y1, x2, y2) {
    return this.path(
        'M' + x1 + ',' + y1 +
        'L' + x2 + ',' + y2
    );
};


Raphael.fn.Kong = function (options) {
    var paper  = this,
        config = jQuery.extend({ }, Kong.defaults, options),
        width  = config.width,
        height = config.height,
        font   = paper.getFont(config.font),
        trace  = config.trace ? function(m) { alert(m); } : function() { },
        gameno = 0,
        game;

    Kong.debug('Kong %sx%s config: %o', width, height, config);

    function deg2rad(degrees) {
        return degrees * Math.PI / 180;
    };

    function random(min, max) {
        return min + Math.round( Math.random() * (max - min) );
    };

    function init_game() {
        game = {
            // game counter for stats
            no:      ++gameno,
            // wind can be up to +ve or -ve max_wind 
            wind:    random(-config.max_wind, config.max_wind),
	    // flag indicating the game is on
	    playing: true
        };
        Kong.debug('init_game() => %o', game);

	draw_background(game);
	draw_clouds(game);
	draw_buildings(game);
	draw_wind_arrow(game);

        return game;
    };

    function draw_background(game) {
        var sunx = width  * 0.8,
            suny = height * 0.1,
            sunr = height * 0.15,
            rayd = 20,               // 30 degree ray
            rays = 360 / (rayd * 1.5),
            n;

        Kong.debug('draw_scene()');

	// Sun / sky grad
        trace('Add a radial gradient for sky/sun');
        paper
            .circle(sunx, suny, sunx * 2)
            .attr({
                gradient:   "r#fc1-#fea:07-#48cbf0:14-#129:50",
                stroke:     0
            });

        // sun's rays
        trace('Add some sunbeams');
        for (n = 0; n < rays; n++) {
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
        trace("Add the sun's core to mask sunbeams");
        paper
            .circle(sunx, suny, sunr)
            .attr({
                gradient:   "r#fac710-#ffeeaa",
                stroke:     0
            });
    };

    function draw_clouds(game) {
	var cwidth  = width / config.clouds;
        var cheight = 20;
        var csize   = 60;
        var cspeed  = 1100;
        for (n = 0; n < config.clouds; n++) {
            cloud(
                n * cwidth + cwidth / 2 + random(-cwidth / 4, cwidth / 4), 
                cheight, 
                csize,
                game.wind,
                cspeed
            );
            // quick hack to vary cloud shape, position, etc.
            cheight += random(50, 100);
            csize   -= random(10, csize / 4);
            cspeed  -= 200;
        }

    };

    function cloud(x, y, size, wind, speed) {
        Kong.debug('drawing cloud at %s, %s with size %s and wind %s', x, y, size, wind);
        var paths = config.cloud_paths;
        var cloud = paper
            .path( paths[ random(0, paths.length - 1) ] )
            .scale(size, size * 0.5)
            .translate(x, y)
            .attr(config.cloud_style);
        var dx, rx;

        if (wind > 0) {
            // move to the right then reset by moving all the way left
            dx =  width - x + size * 3;
            rx = -width - size * 6;
        }
        else if (wind < 0) {
            // move to the left then resetby moving right
            dx = -x - size * 3;
            rx = width + size * 6;
        }
        else {
            return cloud;
        }
        
       // Compute the number of milliseconds required to move off screen
       // based on the wind speed and config.speed scaling factor, with 
       // a little extra randomness thrown in for good measure.  First time
       // around we're moving dx pixels, based on the original cloud position.
       // Subsequent animations traverse the whole screen plus a bit (rx 
       // pixels in rt milliseconds).
        var dt = Math.abs(dx / config.speed / wind * speed);
        var rt = Math.abs(rx / config.speed / wind * speed);

        function reset_cloud() {
            Kong.debug('Resetting cloud position: %s / %s', rx, rt);
            cloud.translate(rx, 0)
                 .animate(
                     { translation: -rx + "," + 0 }, 
                     rt, reset_cloud
                 );
        };
        
        cloud.animate(
            { translation: dx + "," + 0 }, dt,
            reset_cloud
        );
        
        return cloud;
    };

    function draw_buildings(game) {
	var buildings  = game.buildings = [ ],
            windows    = game.windows   = [ ],
            nbuildings = random(config.min_buildings, config.max_buildings),
            bwidth     = Math.floor(width / nbuildings),
	    sheight    = height  * config.skyline_height / config.max_stories,
	    wwidth     = bwidth / (config.windows * 2 + 1),     // inc. gaps between windows
	    wheight    = sheight * config.window_height,
	    woffset    = (sheight - wheight) / 2;

        for (var nb = 0; nb < nbuildings; nb++) {
	    var nstories = random(config.min_stories, config.max_stories),
		bheight  = nstories * sheight,
                left     = bwidth * nb,
                top      = height - bheight,
		building = paper
		    .rect(left, top, bwidth, bheight)
		    .attr(config.building_style);

	    Kong.debug('%s: building left:%s  top:%s  width:%s  height:%s', nb, left, top, bwidth, bheight);

	    for (var ns = 0; ns < nstories; ns++) {
		var y = top + sheight + ns * sheight;

		// line between floors
		paper.line(left + wwidth, y, left + bwidth - wwidth, y)
		     .attr({ stroke: '#aaa' });

		// windows, some on, some off
		for (var w = 0; w < config.windows; w++) {
		    var xx = left + (w * 2 + 1) * wwidth;
		    windows.push(
		        paper
			    .rect(xx, y - wheight - woffset, wwidth, wheight)
			    .attr(config.window_styles[random(0, 1)])
				 );
		}
	    }
	}
    };

    function draw_wind_arrow() {
        var wind = game.wind;
        paper
            .text(width / 2, 20, "Wind: " + game.wind)
            .attr({ 'font-size': 20 });

        // TODO: draw arrow showing wind direction and speed

//      paper.print(width/2, 120, "Wind: " + game.wind, font, 60)
//           .attr({fill: "#f70"});

    };

    function play_game() {
        Kong.debug('play_game()');
        // TODO: 
        // while no-one has won, 
        //   player n:
        //     input values
        //     throw banana
        //     plot trajectory
        //     collision detection
        //     if building hit then damage building
        //     if gorilla hit then explode gorilla and end game
    };

    function game_loop() {
        init_game();
        play_game();
    };

    // normally we would loop around this forever, but a single call will
    // do for now until we've got everything working
    game_loop();

};

