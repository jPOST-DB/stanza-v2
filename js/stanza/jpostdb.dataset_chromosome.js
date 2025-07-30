// jPOST-db Dataset chroomosorm info.


jpostdb.dataset_chromosome = jpostdb.dataset_chromosome || {
    param: {
	width: 10,
	height: 10,
	top: 0,
	svgHeight: 300,
	graphHeight: 200,
	margin: 20,
	anime: 100
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.dataset_chromosome;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(param.renderDiv);
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "bar_chart_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	
	var url = jpostdb.api + "dataset_chromosome?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.bar_graph, svg, renderDiv, param.width / 2, 0);
	jpostdb.fetchReq("get", url, null, renderDiv, param.width,  group.bar_graph);
    },

    bar_graph: function(data, renderDiv){
	var group = jpostdb.dataset_chromosome;
	var param = group.param;
	var svg = renderDiv.select("#bar_chart_svg");	

	if(data.length > 1){
	    var h = param.svgHeight + param.margin + param.margin;
	    svg.transition().duration(param.anime).attr("height", h);
	    jpostdb.utils.bar_graph(data, svg, param.width, param.graphHeight, 0);
	}else{
	    svg.transition().duration(param.anime).attr("height", 20);
	    svg.append("text").attr("y", 20).attr("x", 50).text("no chromosomes");
	}
    }
};
