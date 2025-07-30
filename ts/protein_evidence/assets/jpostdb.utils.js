// jPOST-db utils


jpostdb.utils = jpostdb.utils || {
    param: {
	color: [ "#a8a8e0", "#a8e0e0", "#a8e0a8", "#e0e0a8", "#e0a8d3", "#d3a8e0", "#a8d3e0", "#a8e0d3", "#d3e0a8", "#e0d3a8", "#e0a8a8", "#e0a8e0"], // pastel
	color1: [ "#ebde37", "#eccf31", "#edc12c", "#eeb326", "#efa521", "#f0971b", "#f18916", "#f27b10", "#f36d0b", "#f45f05", "#f55100"] // yellow-orange
    },

    bar_graph: function(data, renderSVG, width, height, onClickFunc){
	var group = jpostdb.utils;
	var param = group.param;
	var svg = renderSVG;
	var margin = 30;

	var scale_x = d3.scale.ordinal().rangeRoundBands([margin, width - margin*2], 0.1);
	var scale_y = d3.scale.linear().range([height - margin, 0]);
	var axis_x = d3.svg.axis().scale(scale_x).orient("bottom");
	var axis_y = d3.svg.axis().scale(scale_y).orient("left");  // .ticks(10, "%")
	scale_x.domain(data.map(function(d) { return d.label; }));
	scale_y.domain(d3.extent(data, function(d) { return d.count - 0; }));

	var g = svg.append("g").attr("id", "graph");
	var bar = g.selectAll(".bar")
	    .data(data)
	    .enter()
	    .append("rect")
	    .attr("transform", "translate(" + margin + "," + margin + ")")
	    .attr("class", "bar")
	    .attr("x", function(d) { return scale_x(d.label) })
	    .attr("width", scale_x.rangeBand())
	    .attr("y", function(d) { return scale_y(d.count) })
	    .attr("height", function(d) { return height - scale_y(d.count) - margin });
	 var ax = g.append("g")
	     .attr("class", "axis x")
	     .attr("transform", "translate(" + margin + "," + height + ")")
	     .call(axis_x);
	var ay = g.append("g")
	    .attr("class", "axis y")
	    .attr("transform", "translate(" + (margin * 2) + "," + margin + ")")
	    .call(axis_y);
	
	ax.selectAll("text")
	    .attr("dy", ".35em")
	    .attr("x", 10)
	    .attr("y", 0)
	    .attr("transform", "rotate(90)")
	    .style("text-anchor", "start");
/*	ax.append("text")
	    .attr("class", "label")
	    .text("category")
	    .style("text-anchor", "middle")
	    .attr("transform", "translate(" + ((param.width - param.margin) / 2) + "," + (param.margin - 5) + ")");*/
/*	ay.append("text")
	    .attr("class", "label")
	    .text("frequency")
	    .style("text-anchor", "middle")
	    .attr("transform", "rotate(-90)")
	    .attr("x", 0 - (param.graphHeight / 2))
	    .attr("y", 0 - (param.margin - 20));*/

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
	
    },

    pie_chart: function(data, renderSVG, size, width, height, onClickFunc){
	var group = jpostdb.utils;
	var param = group.param;
	var svg = renderSVG;
	var pie = d3.layout.pie().value(function(d){ return d.count; }),
	arc = d3.svg.arc().innerRadius(20).outerRadius(size / 2);
	
	var render = function(){
	    var g = svg.selectAll(".arc")
		.data(pie(data))
		.enter()
		.append("g")
		.attr("class", "arc").attr("transform", "translate(" + (width / 2 - size / 2 - 40) + "," + (height / 2) + ")");
	 
	    g.append("path")
		.attr("id", function(d){ return "p" + d.data.id;})
		.attr("class", "pie_area")
		.attr("fill", function(d, i){ return param.color[i % param.color.length]; })
		.attr("stroke", "white");

	    g.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.attr("class", "graph_category_count")
		.attr("fill", "white")
		.attr("id", function(d){ return "t_" + d.data.id; })
		.text(function(d){ if(d.endAngle - d.startAngle >= 0.3){ return d.data.count.replace(/(\d)(?=(\d{3})+$)/g , '$1,');}})
	    	.attr("transform", function(d){ return "translate(" + arc.centroid(d) + ")"; })
		.attr("display", "none");

	    if(onClickFunc){
		g.selectAll("path.pie_area")
	    	    .attr("cursor", "pointer")
		    .on("click", function(d){ onClickFunc(d.data.id);});
	    }
	};

	var plot = function(){
	    var g = svg.selectAll(".arc");
	    g.selectAll("path")
		.transition()
		.ease("cubic-out")
		.delay(500)
		.duration(1000)
		.attr("d", arc);
	}

	var animate = function(){
	    var g = svg.selectAll(".arc"),
		length = data.length,
		i = 0;
	    
	    g.selectAll("path")
		.transition()
		.ease("cubic-out")
		.delay(500)
		.duration(1000)
		.attrTween("d", function(d){
		    var interpolate = d3.interpolate(
			{startAngle: 0, endAngle: 0},
			{startAngle: d.startAngle, endAngle: d.endAngle}
		    );
		    return function(t){
			return arc(interpolate(t));
		    };
		})
		.each("end", function(transition, callback){
		    i++;
		    isAnimated = i === length;
		    legend();
		});
	}

	var legend = function(){
	    var g = svg.selectAll(".arc");
	    g.selectAll("text.graph_category_count").attr("display", "inline");
	    
	    g = svg.selectAll(".legend")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "legend");

	    g.append("rect")
		.attr("class", "color")
		.attr("fill", function(d, i){ return param.color[i];})
		.attr("x", width / 2 + 40)
		.attr("y", function(d, i){ return i * 20 + 40;})
		.attr("width", 16)
		.attr("height", 16);

	    g.append("text")
		.attr("class", "graph_category_label")
		.attr("id", function(d){ return "l_" + d.id;})
		.attr("fill", "#888888")
		.attr("x", width / 2 + 66)
		.attr("y", function(d, i){ return i * 20 + 54;})
		.text(function(d){ return d.label + " : " + d.count.replace(/(\d)(?=(\d{3})+$)/g , '$1,');});

	    if(onClickFunc){
		g.selectAll("text.graph_category_label")
	    	    .attr("cursor", "pointer")
		    .on("click", function(d){ onClickFunc(d.id);});
	    }
	}
	
	render();
	plot();
	animate();
    },

//pie chart for database statistics 
    pie_chart2: function(data, renderSVG, title, unit, outSize, inSize, other, onClickFunc){
	var group = jpostdb.utils;
	var param = group.param;
	var svg = renderSVG;

	var pie = d3.layout.pie().value(function(d){ return d.count; }),
	arc = d3.svg.arc().innerRadius(inSize/2).outerRadius(outSize/2);

	var setData = function(){
	    var max = 0;
	    for(var i = 0; i < data.length; i++){
		max += data[i].count - 0;
	    }
	    if(other){
		var dataNew = [];
		var other = 0;
		for(var i = 0; i < data.length; i++){
		    if(data[i].count / max >= 0.025){
			dataNew.push(data[i]);
		    }else{
			other += data[i].count;
		    }
		}
		dataNew.push({label: "other", id: "other", count: other});
		data = dataNew;
	    }
	    for(var i = 0; i < data.length; i++){
		data[i].percent = String(Math.round(data[i].count * 1000 / max) / 10) + "%";
		data[i].value = String(data[i].count).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + " " + unit;
	    }
	};
	
	var render = function(){
	    var g = svg.selectAll(".arc")
		.data(pie(data))
		.enter()
		.append("g")
		.attr("class", "arc").attr("transform", "translate(" + (outSize / 2) + "," + (outSize / 2) + ")")
		.on("mouseover", function(d){
		    svg.select("#legend_label").text(d.data.label);
		    svg.select("#legend_value").text(d.data.value);
		})
		.on("mouseout", function(){
		    svg.select("#legend_label").text(title);
		    svg.select("#legend_value").text("");
		})
		.on("click", function(d){
		    onClickFunc(d.data.onclick_list);
		});
	 
	    g.append("path")
		.attr("id", function(d){ return "p" + d.data.id;})
		.attr("fill", function(d, i){ return param.color[i % param.color.length]; })
		.attr("stroke", "white");

	    g.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.attr("class", "label")
		.attr("fill", "white")
		.attr("id", function(d){ return "t_" + d.data.id; })
		.style("font-size", "12px")
		.text(function(d){ if(d.endAngle - d.startAngle >= 0.3){ return d.data.percent;}})
	    	.attr("transform", function(d){ return "translate(" + arc.centroid(d) + ")"; })
		.attr("display", "none");
	};

	var plot = function(){
	    var g = svg.selectAll(".arc");
	    g.selectAll("path")
		.transition()
		.ease("cubic-out")
		.delay(500)
		.duration(1000)
		.attr("d", arc);
	}

	var animate = function(){
	    var g = svg.selectAll(".arc"),
		length = data.length,
		i = 0;
	    
	    g.selectAll("path")
		.transition()
		.ease("cubic-out")
		.delay(500)
		.duration(1000)
		.attrTween("d", function(d){
		    var interpolate = d3.interpolate(
			{startAngle: 0, endAngle: 0},
			{startAngle: d.startAngle, endAngle: d.endAngle}
		    );
		    return function(t){
			return arc(interpolate(t));
		    };
		})
		.each("end", function(transition, callback){
		    i++;
		    isAnimated = i === length;
		    showValues();
		});
	}

	var showValues = function(){
	    var g = svg.selectAll(".arc");
	    g.selectAll("text.label").attr("display", "inline");
	}

	setData();
	render();
	plot();
	animate();

	var g = svg.append("g").attr("transform", "translate(" + (outSize / 2) + "," + (outSize / 2) + ")");
	g.append("text")
	    .attr("text-anchor", "middle")
	    .attr("x", 0)
	    .attr("y", 0)
	    .attr("class", "label")
	    .style("font-size", "16px")
	    .attr("id", "legend_label")
	    .text(title);
	g.append("text")
	    .attr("text-anchor", "middle")
	    .attr("x", 0)
	    .attr("y", 20)
	    .attr("class", "label")
	    .style("font-size", "12px")
	    .attr("id", "legend_value")
	    .text("");
    },

    forcegraph: function(data, renderSVG, svgSize) {
	var group = jpostdb.utils;
	var param = group.param;
	var svg = renderSVG;
	var labelFlag = 0;

	var g = svg.append("g").attr("class", "forcegraph");
	svg.call(d3.behavior.zoom()
                 .size([svgSize, svgSize])
                 .scaleExtent([0.1, 5])
                 .on("zoom", function(){ g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); }));

	var link = g.selectAll(".edge")
	    .data(data.edges)
	    .enter()
	    .append("line")
	    .attr("class", "edge")
	    .attr("stroke", function(d) { return d.color; })
	    .attr("stroke-width", function(d) {return d.width; });
	var node = g.selectAll(".node")
	    .data(data.nodes)
	    .enter()
	    .append("g");
	var label = g.selectAll(".node_label")
	    .data(data.nodes)
	    .enter()
	    .append("g");
	var circle = node.append("circle")
	    .attr("class", "node")
	    .attr("id", function(d) { return d.term_label; })
	    .attr("r", function(d) { return d.r; })
	    .attr("fill", function(d) { return d.color; })
	    .on("mouseover", function(d){ svg.selectAll(".hover_label").attr("display", "block").text(this.id);if(labelFlag == 1){ svg.select('#' + d.key.replace(":", "_")).attr('display', 'block');}})
	    .on("mouseout", function(d){ svg.selectAll(".hover_label").attr("display", "none");if(labelFlag == 1){ svg.select('#' + d.key.replace(":", "_")).attr('display', 'none');}});
	var text = label.append("text")
	    .text(function(d) {return d.term_label; })
	    .attr("class", "node_label")
	    .attr("dx", function(d){ return d.r + 5 + "px"})
	    .attr("dy", "4px")
	    .attr("id", function(d){ return d.key.replace(":", "_"); });
	var force = d3.layout.force()
            .charge(-300)
            .linkDistance(60)
	    .friction(0.9)
	    .size([svgSize, svgSize])
	    .nodes(data.nodes)
	    .links(data.edges)
	    .start();
	force.on("tick", function() {
	    link.attr("x1", function(d) {return d.source.x})
		.attr("y1", function(d) {return d.source.y})
		.attr("x2", function(d) {return d.target.x})
		.attr("y2", function(d) {return d.target.y})
	    text.attr("x", function(d) {return d.x})
		.attr("y", function(d) {return d.y})
	    circle.attr("cx", function(d) {return d.x})
		.attr("cy", function(d) {return d.y})
	});
	node.call(force.drag);

	// default CSS/SVG
	link.attr({
 //   "stroke": "#999999",
//    "marker-end": "url(#arrowGray)",
	})
	circle.attr({
	    "stroke": "black",
	    "stroke-width": "1px",
	    "opacity": 1,
	})
	text.attr({
	    "font-size": "8px",
	    "font-family": "sans-serif",
	    "pointer-events": "none",
	})

	var box = svg.append("g").attr("class", "forcegraph").attr("transform", "translate(50,20)");
	box.append("text")
	    .attr("x", 0).attr("y", 12)
	    .attr("fill", "#888888")
	    .text("Label:");
	var b = box.append("g")
	    .attr("class", "button")
	    .style("cursor", "pointer")
	    .on("click", function(){if(labelFlag == 1){labelSwitch();}});
	b.append("rect")
	    .attr("y", 0)
	    .attr("x", 50)
	    .attr("width", 50)
	    .attr("height", 16)
	    .attr("rx", 5)
	    .attr("ry", 5)
	    .attr("id", "show_label")
	    .attr("fill", "#eecccc");
	b.append("text")
	    .attr("y", 12)
	    .attr("x", 75)
	    .attr("fill", "#ffffff")
	    .attr("text-anchor", "middle")
	    .text("show");
	var b = box.append("g")
	    .attr("class", "button")
	    .style("cursor", "pointer")
	    .on("click", function(){if(labelFlag == 0){labelSwitch();}});
	b.append("rect")
	    .attr("y", 0)
	    .attr("x", 110)
	    .attr("width", 50)
	    .attr("height", 16)
	    .attr("rx", 5)
	    .attr("ry", 5)
	    .attr("id", "hide_label")
	    .attr("fill", "#c6c6c6");
	b.append("text")
	    .attr("y", 12)
	    .attr("x", 135)
	    .attr("fill", "#ffffff")
	    .attr("text-anchor", "middle")
	    .text("hide");
	box.append("text")
	    .attr("class", "hover_label")
	    .attr("x", 200).attr("y", 12)
	    .attr("fill", "white")
	    .attr("stroke", "white")
	    .attr("stroke-width", "4px")
	    .attr("display", "none")
	    .text("");
	box.append("text")
	    .attr("class", "hover_label")
	    .attr("x", 200).attr("y", 12)
	    .attr("fill", "black")
	    .attr("display", "none")
	    .text("");

	var labelSwitch= function(){
	    if(labelFlag){
		labelFlag = 0;
		svg.select("#show_label").attr("fill", "#eecccc");
		svg.select("#hide_label").attr("fill", "#c6c6c6");
		svg.selectAll(".node_label").attr("display", "block");
	    }else{
		labelFlag = 1;
		svg.select("#show_label").attr("fill", "#c6c6c6");
		svg.select("#hide_label").attr("fill", "#eecccc");
		svg.selectAll(".node_label").attr("display", "none");
	    }
	}
    },

    
    table: function(tableData, renderDiv, id, num, page){
	var div = renderDiv.select("#" + id);
	if(div) div.remove();

	var div = renderDiv.append("div").attr("id", id).style("padding", "0px 0px 0px 0px");
	if(tableData.title){
	    var title = div.append("h3")
		.attr("id", "t_" + id)
	    	.attr("class", "stanza_table")
		.text(tableData.title);
	}

	// css
	div.append("style").text(this.table_css);
	
	// upper sub menu
	var table = div.append("table")
	    .attr("class", "stanza_table_sub");
	var tr = table.append("tr");
	var td = tr.append("td").attr("class", "left").html("Page Size: ");
	var sel = td.append("select").attr("class", "size_select")
	    .on("change", function(){
		var num = sel.property("value");
		jpostdb.utils.table(tableData, renderDiv, id, num, 0);
	    });
	var list = [5, 10, 15, 30, 50];
	sel.selectAll(".size_opt")
	    .data(list)
	    .enter()
	    .append("option").attr("class", "size_opt")
	    .attr("value", function(d){
		return d;
	    }).attr("selected", function(d){
		if(d == num) return "selected";
	    }).html(function(d){
		return d;
	    });
	td = tr.append("td").attr("class", "right")
	    .html("Showing " + (page * num + 1) + " to " + ((page + 1) * num) + " of " + tableData.data.length + " entries");
	
	// main table
	var table = div.append("table")
	    .attr("class", "stanza_table")
	    .style("width", "100%")
	    .attr("id", id);
	
	// table header
	var tr = table.append("tr")
	    .attr("class", "stanza_table_header");
	tr.selectAll("th")
	    .data(tableData.head)
	    .enter()
	    .append("th")
	    .attr("id", function(d, i){ return tableData.arg[i];})
	    .attr("class", "stanza_table_header")
	    .text(function(d){ return d; });

	// set col width
	if(tableData.width){
	    for(var i = 0; i < tableData.width.length;i++){
		if(tableData.width[i]){ table.select("th#" + tableData.arg[i]).style("width", tableData.width[i] + "px");}
	    }
	}

	// table body
	var c = 0;
	for(var i = page * num; i < tableData.data.length; i++){
	    var tr = table.append("tr").attr("id", "row" + i).attr("class", "stanza_table_row");
	    if(c % 2 == 1) tr.attr("class", "stanza_table_row stanza_table_row_odd");
	    for(var j = 0; j < tableData.arg.length; j++){
		var arg = tableData.arg[j];
		var txt = "";
		if(arg) txt = tableData.data[i][arg];
		var align = "";
		if(tableData.align && tableData.align[j]) align = " text_align_right";
		var td = tr.append("td").attr("class", "stanza_table_data " + arg + align);
		if(tableData.data[i]["_alink_" + arg]){ td.append("a").attr("href", (tableData.data[i]["_alink_" + arg])).text(txt); }
		else if(tableData.data[i]["_innerhtml_" + arg]){ td.append("a").html(tableData.data[i]["_innerhtml_" + arg]); }
		else{ td.text(txt); }
		if(arg == "_bgcolor" && tableData.data[i].color){ td.style("background-color", tableData.data[i].color); }
	    }
	    c++;
	    if(c == num) break;
	}

	// lower sub menu
	var table = div.append("table")
	    .attr("class", "stanza_table_sub");
	var tr = table.append("tr");
	var td = tr.append("td").attr("class", "left").html("Page: ");
	var page_in = td.append("input").attr("class", "page_select").attr("type", "text").attr("value", page + 1);
	td.append("span").html("of " + Math.ceil(tableData.data.length / num));
	td.append("img").attr("src", "http://globe.jpostdb.org/img/icon_update32.png").attr("width", "24")
	    .style("cursor", "pointer").style("position", "relative").style("left", "5px").style("top", "5px")
	    .on("click", function(){
		var p = page_in.property("value") - 1;
		if(p != page) jpostdb.utils.table(tableData, renderDiv, id, num, p);
	    });
	

	td = tr.append("td").attr("class", "right")
	var button = td.append("button").html("First");
	if(page != 0) button.attr("class", "active").on("click", function(){ jpostdb.utils.table(tableData, renderDiv, id, num, 0);});
	else button.attr("class", "inactive")
	button = td.append("button").html("Prev");
	if(page > 0) button.attr("class", "active").on("click", function(){ jpostdb.utils.table(tableData, renderDiv, id, num, page - 1);});
	else button.attr("class", "inactive")
	var start = page - 2;
	var last = Math.ceil(tableData.data.length / num) - 1;
	if(start < 0) start = 0;
	else if(start > last - 5) start = last - 4;
	for(var i = start; i < start + 5; i++){
	    if(i > tableData.data.length / num - 1) break;
	    button = td.append("button").html(i + 1);
	    if(page != i) button.attr("class", "active").on("click", function(){ jpostdb.utils.table(tableData, renderDiv, id, num, this.innerHTML - 1);});
	    else button.attr("class", "inactive")
	}
	button = td.append("button").html("Next");
	if(page < last) button.attr("class", "active").on("click", function(){ jpostdb.utils.table(tableData, renderDiv, id, num, page + 1);});
	else button.attr("class", "inactive")
	button = td.append("button").html("Last");
	if(page != last) button.attr("class", "active").on("click", function(){ jpostdb.utils.table(tableData, renderDiv, id, num, last);});
	else button.attr("class", "inactive")
    },

    table_css: "td.stanza_table_data a { color: #2196f3; text-decoration: none;}td.stanza_table_data a:active, td.stanza_table_data a:hover { color: #; text-decoration: underline;}table.stanza_table { border: 1px solid #999; font-size: 14px; border-collapse: collapse;}table.stanza_table tr { height: 34px;}table.stanza_table tr.stanza_table_header { background-color: #e6e6e6; border: 1px solid #999; font-weight: 700; white-space: nowrap;}table.stanza_table th.stanza_table_header {border: 1px solid #999; font-weight: 700; padding: 4px;}table.stanza_table tr.stanza_table_row:hover, table.stanza_table th.stanza_table_header:hover { background-color: #c6c6c6;} table.stanza_table tr.stanza_table_row_odd { background-color: #efefef;}table.stanza_table td.stanza_table_data { border-left: 1px solid #999; border-right: 1px solid #999; padding: 4px; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;} table.stanza_table td.text_align_right { text-align: right;}table.stanza_table_sub { font-size: 13px; width: 100%; margin: 15px 0px 15px 0px;} table.stanza_table_sub td{ vertical-align: bottom;}select.size_select { border: 0; width: 34px; -webkit-appearance: none; -moz-appearance: none; appearance: none; padding: 0; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAJ1BMVEVmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmaP/QSjAAAADHRSTlMAAgMJC0uWpKa6wMxMdjkoAAAANUlEQVR4AeXJyQEAERAAsNl7Hf3X6xt0QL6JpZWq30pdvdadme+0PMdzvHm8YThHcT1H7K0BtOMDniZhWOgAAAAASUVORK5CYII=); -webkit-background-size: 13px 13px; background-size: 13px; background-repeat: no-repeat; background-position: right center; -webkit-box-shadow: inset 0 -1px 0 #ddd; box-shadow: inset 0 -1px 0 #ddd; font-size: 16px; line-height: 1.5;} table.stanza_table_sub td.right { text-align: right;} table.stanza_table_sub input.page_select { width: 90px; border-left: 0px; border-top: 0px; border-right: 0px; border-bottom: 1px solid #ddd; font-size: 16px;} table.stanza_table_sub button.active, table.stanza_table_sub button.inactive { padding: 5px 15px 5px 15px; border-radius: 0px; border: 1px solid #999; font-size:14px;}table.stanza_table_sub button.active { cursor: pointer;}table.stanza_table_sub button.inactive { background-color: #ffffff;}"

};
