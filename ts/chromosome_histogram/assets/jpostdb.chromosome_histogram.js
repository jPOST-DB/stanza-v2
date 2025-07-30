// jPOST-db Dataset chroomosorm info.


jpostdb.chromosome_histogram = jpostdb.chromosome_histogram || {
    param: {
	width: 10,
	height: 10,
	top: 0,
	svgHeight: 300,
	graphHeight: 200,
	margin: 20,
	anime: 500
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.chromosome_histogram;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(param.renderDiv);
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "bar_chart_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	
	var url = jpostdb.api + "chromosome_histogram?" + param.apiArg.join("&");
//	jpostdb.httpReq("get", url, null, group.bar_graph, svg, renderDiv, param.width / 2, 0);
	jpostdb.fetchReq("get", url, null, renderDiv, param.width,  group.bar_graph);
    },

    bar_graph: function(data, renderDiv){
	var group = jpostdb.chromosome_histogram;
	var param = group.param;
	var svg = renderDiv.select("#bar_chart_svg");	

	if(data.length > 1){
	    var h = param.svgHeight + param.margin + param.margin;
	    svg.transition().duration(param.anime).attr("height", h);
	  //  jpostdb.utils.bar_graph(data, svg, param.width, param.graphHeight, 0);
	    
	    var margin = 30;
	    var width = param.width;
	    var height = param.graphHeight;

	    // modified jpostdb.bar_graph
	    var scale_x = d3.scale.ordinal().rangeRoundBands([margin, width - margin*2], 0.1);
	    var scale_y = d3.scale.linear().range([height - margin, 0]);
	    var scale_y2 = d3.scale.linear().range([height - margin, 0]);
	    var axis_x = d3.svg.axis().scale(scale_x).orient("bottom");
	    var axis_y = d3.svg.axis().scale(scale_y).orient("left");  // scale for total
	    var axis_y2 = d3.svg.axis().scale(scale_y2).orient("left");  // scale for dataset
	    scale_x.domain(data.map(function(d) { return d.label; }));
	    scale_y.domain(d3.extent(data, function(d) { return d.total - 0; }));
	    scale_y2.domain(d3.extent(data, function(d) { return d.count - 0; }));

	    var graphFlag = 0;
	    var graphSwitch = function(){
		if(graphFlag){
		    graphFlag = 0;
		    svg.select("rect#graph_button").attr("fill", "#c6c6c6");
		    plot();
		}else{
		    graphFlag = 1;
		    svg.select("rect#graph_button").attr("fill", "#eecccc");
		    plot2();
		    
		}
	    };
	    
	    var render = function(){
		var g = svg.append("g").attr("id", "graph");
		var base_bar = g.selectAll(".base_bar")
		    .data(data)
		    .enter()
		    .append("rect")
		    .attr("transform", "translate(" + margin + "," + margin + ")")
		    .attr("class", "base_bar")
		    .attr("x", function(d) { return scale_x(d.label) })
		    .attr("width", scale_x.rangeBand())
		    .attr("y",  function(d) { return height - margin })
		    .attr("height", 0);
		var bar = g.selectAll(".bar")
		    .data(data)
		    .enter()
		    .append("rect")
		    .attr("transform", "translate(" + margin + "," + margin + ")")
		    .attr("class", "bar")
		    .attr("x", function(d) { return scale_x(d.label) })
		    .attr("width", scale_x.rangeBand())
		    .attr("y",  function(d) { return height - margin })
		    .attr("height", 0);
		var ax = g.append("g")
		    .attr("class", "axis x")
		    .attr("id", "x_axis")
		    .attr("transform", "translate(" + margin + "," + height + ")")
		    .call(axis_x);
		var ay = g.append("g")
		    .attr("class", "axis y")
		    .attr("id", "y_axis")
		    .attr("transform", "translate(" + (margin * 2) + "," + margin + ")")
		    .call(axis_y);
		
		ax.selectAll("text")
		    .attr("dy", ".35em")
		    .attr("x", 10)
		    .attr("y", 0)
		    .attr("transform", "rotate(90)")
		    .style("text-anchor", "start");
		
		base_bar.attr({
		    "fill": "#dddddd",
		});
		bar.attr({
		    "fill": "#6991c6",
		});
		g.selectAll(".axis").attr({
		    "stroke": "black",
		    "fill": "none",
		    "shape-rendering": "crispEdges",
		});
		g.selectAll("text").attr({
		    "stroke": "none",
		    "fill": "black",
		    "font-size": "8pt",
		    "font-family": "sans-serif",
		});
		var b = svg.append("g")
		    .attr("class", "button")
	     	    .style("cursor", "pointer")
	    	    .on("click", function(){graphSwitch();})
		b.append("rect")
		    .attr("y", 30)
		    .attr("x", width - 80)
		    .attr("width", 60)
		    .attr("height", 16)
		    .attr("rx", 5)
		    .attr("ry", 5)
		    .attr("id", "graph_button")
		    .attr("fill", "#c6c6c6");
		b.append("text")
		    .attr("y", 44)
		    .attr("x", width - 50)
		    .attr("fill", "#ffffff")
		    .attr("text-anchor", "middle")
		    .style("cursor", "pointer")
		    .text("switch");
		
	    }
	    var plot = function(){
		var base_bar = svg.selectAll(".base_bar")
		    .transition()
		    .duration(param.anime)
		    .attr("y", function(d) { return scale_y(d.total) })
		    .attr("height", function(d) { return height - scale_y(d.total) - margin });
		var bar = svg.selectAll(".bar")
		    .transition()
		    .duration(param.anime)
		    .attr("y", function(d) { return scale_y(d.count) })
		    .attr("height", function(d) { return height - scale_y(d.count) - margin });
		var ay = svg.select("#y_axis").attr("class", "axis y").call(axis_y);
		ay.selectAll("text").attr({
		    "stroke": "none",
		    "fill": "black",
		    "font-size": "8pt",
		    "font-family": "sans-serif",
		});
	    }
	    var plot2 = function(){
		var base_bar = svg.selectAll(".base_bar")
		    .transition()
		    .duration(param.anime)
		    .attr("y", height - margin)
		    .attr("height", 0);
		var bar = svg.selectAll(".bar")
		    .transition()
		    .duration(param.anime)
		    .attr("y", function(d) { return scale_y2(d.count) })
		    .attr("height", function(d) { return height - scale_y2(d.count) - margin });
		var ay = svg.select("#y_axis").attr("class", "axis y").call(axis_y2);

		ay.selectAll("text").attr({
		    "stroke": "none",
		    "fill": "black",
		    "font-size": "8pt",
		    "font-family": "sans-serif",
		});
	    }

	    render();
	    plot();
	    
	}else{
	    svg.transition().duration(param.anime).attr("height", 20);
	    svg.append("text").attr("y", 20).attr("x", 50).text("no chromosomes");
	}
    }
};
