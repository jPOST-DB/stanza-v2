Stanza(function(stanza, params) {

    stanza.render({
        template: "stanza.html"
    });
    console.log(params.dataset);
     jpostdb.chromosome_histogram.init(params, stanza, "#draw_area");
});
