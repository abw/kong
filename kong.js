function hsb(h, s, b) {
    return "hsb(" + [h, s, b].join(",") + ")";
}

function palette(hue) {
    return {
        edge:  hsb(hue/360, 0.9, 0.5),
        hour5: hsb(hue/360, 0.8, 0.6),
        hour1: hsb(hue/360, 0.7, 0.7),
        min5:  hsb(hue/360, 0.6, 0.8),
        min1:  hsb(hue/360, 0.5, 0.9),
        sec1:  hsb(hue/360, 0.4, 1.0),
    };
};

function styles(hue) {
    var p = palette(hue);
    return {
        palette: p,
        second: {
            'stroke-width': 1,
            stroke: p.edge
        },
        minute: {
            'stroke-width': 2,
            stroke: p.edge
        },
        hour: {
            'stroke-width': 2,
            stroke: p.edge
        }
    };
};

Raphael.fn.kong = function (w, h) {
    var paper  = this;
    paper.circle(w/2, h/2, 10).attr({ fill: '#ff7f00' });
};

