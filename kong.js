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
        launch:          'Launch',
        skyline_height:  0.8,    // top of tallest building at 0.8 x height
        window_height:   0.6,    // window is 0.6 x story (floor) height
        min_buildings:   8,
        max_buildings:   12,
        min_stories:     6,
        max_stories:     16,
        windows:         6,
        building_gap:    0,
        player:          ['Player 1', 'Player 2'],
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
        ],
        outer_panel_style: {
            fill:           '#fff',
            border:         '#000',
            'stroke-width': 6,
            opacity:        0.85,
            'stroke-opacity': 0.8
        },
        inner_panel_style: {
            opacity:        0.8,
            fill:               '#e8e8ff',
//            border:             '#aaa',
            stroke:             '#aac',
            'stroke-width':     2,
            'stroke-linejoin': 'round'
        },
        origin_handle_style: {
            fill:   '#07f',
            stroke: '#04a',
            opacity: 0.9,
            r:       4,
            'stroke-width': 1
        },
        drag_handle_style: {
            fill:   '#8f8',
            stroke: '#484',
            opacity: 0.9,
            r:       6,
            'stroke-width': 1
        },
        drag_hover_style: {
            fill:   '#f70',
            stroke: '#a40',
            opacity: 0.9,
            'stroke-width': 1
        },
        dragging_handle_style: {
            fill:   '#f70',
            stroke: '#a40',
            opacity: 0.7,
            r:       10,
            'stroke-width': 1
        },
        trajectory_style: {
            stroke: '#4AA',
            'stroke-width': 2,
            'stroke-dasharray': '-'
        },
        button_style: {
            fill:   '#8f8',
            stroke: '#484',
            opacity: 0.8,
            'stroke-width': 1
        },
        button_hover_style: {
            fill:   '#f70',
            stroke: '#a40',
            opacity: 0.9
        },
        launch_style: {
            fill: '#262',
            'stroke-width': 0,
            'font-size': 16
        },
        launch_hover_style: {
            fill: '#fff',
            'stroke-width': 0,
            'font-size': 16
        }
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

    var RAD_DEG= Math.PI / 180;

    function deg2rad(degrees) {
        return degrees * RAD_DEG;
    };

    function rad2deg(radians) {
        return radians / RAD_DEG;
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
        draw_player_controls(game);

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
            bwidth     = Math.round(width / nbuildings),
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

        function switch_light() {
            windows[random(0, windows.length)]
                .attr(config.window_styles[random(0, 1)]);
            window.setTimeout(switch_light, random(500, 3000));
        };

        switch_light();
    };

    function draw_player_controls(game) {
        var margin = 15,
            status = 20,
            pcw    = Math.round(width  / 6),
            pch    = pcw + status * 2 + margin,
            ypos   = height - pch - margin;

        game.controls = [
            player_control(margin, ypos, config.player[0]),
            player_control(width - pcw - margin, ypos, config.player[1], true)
        ];

        function player_control(x, y, caption, invert) {
            var inw   = pcw - margin * 2,        // Inner dimensions are pcw x pch
                inh   = inw,
                rr    = inw * inw,
                minx  = x + margin,
                miny  = y + status + margin,
                maxx  = minx + inw,
                maxy  = miny + inh,
                set   = paper.set(),
                drag  = {
                    cx: (invert ? (maxx - inw / 2) : (minx + inw / 2)),
                    cy: miny + inh / 2
                },
                line  = [
                    ["M", invert ? maxx : minx, maxy],
                    ["L", drag.cx, drag.cy]
                ],
                outer, inner, arrow, origin, target, button, launch;

            function drag_start() {
                this.ox = this.attr("cx");
                this.oy = this.attr("cy");
                this.dragging = true;
                this.animate(config.dragging_handle_style, 500, ">");
            };

            function drag_move(dx, dy) {
                var x  = this.ox + dx,
                    y  = this.oy + dy;

                drag.cx
                    = x < minx ? minx
                    : x > maxx ? maxx
                    : x;
                drag.cy
                    = y < miny ? miny
                    : y > maxy ? maxy
                    : y;

                dx = drag.cx - (invert ? maxx : minx);
                dy = maxy - drag.cy;
                var len = dx * dx + dy * dy;

                if (len > rr) {
                    var rad = Math.atan(dx / dy);
                    dx = Math.sin(rad) * inw;
                    dy = Math.cos(rad) * inh;
                    drag.cx = (invert ? maxx : minx) + dx;
                    drag.cy = maxy - dy;
                }

                line[1][1] = drag.cx;
                line[1][2] = drag.cy;
                arrow.attr({ path: line });

                this.attr(drag);
            };

            function drag_stop() {
                this.animate(config.drag_handle_style, 500, ">");
                this.dragging = false;
            };

            function mouseover() {
                if (! this.dragging)
                    this.animate(config.drag_hover_style, 500, ">");
            };

            function mouseout() {
                if (! this.dragging)
                    this.animate(config.drag_handle_style, 500, ">");
            };

            // outer window
            outer = paper.rect(x, y, pcw, pch, 15)
                 .attr(config.outer_panel_style);

            // inner window
            inner = paper.path(
                'M' + (invert ? maxx : minx) + ',' + maxy +
                'V' + miny +
                'A' + inw + ',' + inh + (invert ? ',0,0,0,' : ',0,0,1,')
                    + (invert ? minx : maxx) + ',' + maxy +
                'Z'
            ).attr(config.inner_panel_style);

            // trajectory line
            arrow = paper
                .path(line)
                .attr(config.trajectory_style);

            // targetting arrow origin
            origin = paper.circle(invert ? maxx : minx, maxy, 5)
                .attr(config.origin_handle_style);

            // targetting arrow draggable end
            target = paper.circle(drag.cx, drag.cy, 4)
                .attr(config.drag_handle_style)
                .drag(drag_move, drag_start, drag_stop)
                .mouseover(mouseover)
                .mouseout(mouseout);

            // button - rather tedious having to build buttons from scratch...
            var hovering = false;
            var bypos    = y + inh + status + margin * 2;
            var fader;

            function hover() {
                if (! hovering) {
                    hovering = true;
                    button.animate(config.button_hover_style, 200, ">");
                    launch.animateWith(button, config.launch_hover_style, 200, ">");
                }
            };

            function unhover() {
                if (hovering) {
                    hovering = false;
                    button.animate(config.button_style, 500, ">");
                    launch.animateWith(button, config.launch_style, 500, ">");
                }
            };

            function click() {
                var dx  = invert ? maxx - drag.cx : drag.cx - minx;
                var dy  = maxy - drag.cy;
                var deg = Math.round(rad2deg(Math.atan(dy / dx)));
                var len = dx * dx + dy * dy;
                var max = inw * inw;
                var str = Math.round(len / max * 100);
                console.log("%s launched  angle:%s  strength:%s%  dx:%s  dy:%s", caption, deg, str, dx, dy);
                alert(caption + " launched a banana\nangle: " + deg + '°  strength: ' + str + '%' );
            };

            button = paper
                .rect(x + margin, bypos, inw, status, 5)
                .attr(config.button_style)
                .mouseover(hover)
                .mouseout(unhover)
                .click(click);

            launch = paper
                .text(
                    x + margin + inw / 2, bypos + status / 2,
                    config.launch
                )
                .attr(config.launch_style)
                .mouseover(hover)
                .mouseout(unhover)
                .click(click);

            set.push(
                outer, inner, arrow, origin, target,
                button, launch,
                // "Player N" caption
                paper
                    .text(x + margin + inw / 2, y + margin / 2 + 10, caption)
                    .attr({ 'font-size': 20, fill: '#444' })
            );

            return set;
        };
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

