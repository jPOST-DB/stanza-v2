Stanza(function(stanza, params) {
    for (var key in params) {
        if(params[key]) params[key] = encodeURIComponent(params[key]);
    }

    stanza.render({
        template: "stanza.html"
    });
    
    jpostdb.slice_comparison.init(params, stanza, "#draw_area");
});
