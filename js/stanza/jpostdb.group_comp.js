// jPOST-db Group comparison


jpostdb.group_comp = jpostdb.group_comp || {
    
    param: {
	seqLen: 0,
	width: 0,
	height: 0,
	margin: 20,
	marginLeft: 20,
	marginTop: 20,
	marginRight: 50,
	freqHeight: 100,
	top: 0,
	tablePage: 0,
	lineHeight: 16,
	freqLineY: 0,
	mouseX: 0,
	mouseY: 0,
	dragMouseX: 0,
	dragStartX: 0,
	dragFlagX: false,
	dragFlagY: false,
	anime: 100,
	animeFreq: 200
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.group_comp;
	var param = group.param;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	param.top = 0;
	param.yArea = 400;
	param.xAxisY = param.yArea + param.marginTop;
	param.graphHeight = param.width;
	param.yAxisX = Math.round(((param.width - param.marginLeft - param.marginRight) / 2 + param.marginLeft) * 10) / 10;
	param.xArea = param.yAxisX - param.marginLeft;
	if(param.xArea > 400) param.xArea = 400;

	var renderDiv = d3.select(param.renderDiv);
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "volcano_svg")
	    .attr("width", param.width)
	    .attr("height", param.height);
	var table = view.append("div")
	    .attr("id", "protein_table");
	var enrich = view.append("div")
	    .style("padding", "0px")
	    .attr("id", "enrich");

	enrich.append("div").attr("id", "enrich_top").style("padding", "0px");
	enrich.append("svg").attr("id", "enrich_svg").attr("width", param.width).attr("height", 0);
	enrich.append("div").attr("id", "enrich_table").style("padding", "0px " + param.margin + "px 0px " + param.margin + "px");

	var url = jpostdb.subApi + "quant_test?" + param.apiArg.join("&"); // validation API using R script
//	jpostdb.httpReq("get", url, null, group.volcano_plot, svg, renderDiv, param.yAxisX, param.top);
	jpostdb.fetchReq("get", url, null, renderDiv, param.yAxisX, group.volcano_plot);
	
    },

    volcano_plot: function(json, renderDiv){
	var group = jpostdb.group_comp;
	var param = group.param;
	var renderDiv = d3.select(param.renderDiv);
	var svg = renderDiv.select("#volcano_svg");	
	var table = renderDiv.select("#protein_table");
	var enrich = renderDiv.select("#enrich");
	var proteinList = [];

	param.logfc = 1;
	param.fc = 2 ** param.logfc;
	param.pvalue = 0.05;
	param.proteinCount = 0;
	
	var setInitData = function(){	
	    param.maxFc = 0;
	    param.maxP = 0;
	    for(var i = 0; i < json.length; i++){
		var tmp = json[i].logfc - 0;
		if(tmp < 0) tmp *= -1;
		json[i].logfcAb = tmp;
		if(param.maxFc < tmp) param.maxFc = tmp;
		json[i].logp = Math.log(json[i].p_value - 0) / Math.log(10) * (-1);
		if(param.maxP < json[i].logp) param.maxP = json[i].logp;
		json[i]._alink_uniprot = jpostdb.root + "./protein?id=" + json[i].uniprot;
		json[i]._alink_name = "http://www.uniprot.org/uniprot/" + json[i].uniprot;
	    }
	};
	
	var setData = function(){
	    param.proteinCount = 0;
	    proteinList = [];
	    // set initial p-value
	    while(param.pvalue < Math.E**(param.maxP * Math.log(10) * (-1)) && param.pvalue < 0.9){
		if(param.pvalue < 0.1) param.pvalue += 0.01;
		else param.pvalue += 0.1;
		param.pvalue = Math.round(param.pvalue * 100) / 100;
	    }
	    for(var i = 0; i < json.length; i++){
		if(json[i].p_value - 0 <= param.pvalue && json[i].logfc - 0 <= param.logfc * (-1)){
		    json[i].color = "#81adef";
		    param.proteinCount++;
		    proteinList.push(json[i]);
		}
		else if(json[i].p_value - 0 <= param.pvalue && json[i].logfc - 0 >= param.logfc){
		    json[i].color = "#ef8197";
		    param.proteinCount++;
		    proteinList.push(json[i]);
		}
		else if(json[i].p_value - 0 > param.pvalue && json[i].logfc - 0 <= param.logfc * (-1)) json[i].color = "#6880a3";
		else if(json[i].p_value - 0 > param.pvalue && json[i].logfc - 0 >= param.logfc) json[i].color = "#a2687e";
		else if(json[i].p_value - 0 <= param.pvalue && json[i].logfc - 0 > param.logfc * (-1)) json[i].color = "#a87fc4";
		else if(json[i].p_value - 0 <= param.pvalue && json[i].logfc - 0 < param.logfc) json[i].color = "#a87fc4";
		else json[i].color = "#888888";
	    }
	    proteinList = proteinList.sort(function(a,b){
		if(a.logfcAb - 0 > b.logfcAb - 0) return -1;
		if(a.logfcAb - 0 < b.logfcAb - 0) return 1;
		return 0;
	    });
	};
	    
	var plot = function(f){
	    if(f){
		svg.selectAll(".plot")
		    .data(json)
		    .attr("fill", function(d){ return d.color;});

		// plot table
		var data = {
		    head: ["", "Protein name", "ID", "Accession", "log2FC", "p-value"],
		    arg: ["_bgcolor", "name", "id", "uniprot", "logfc", "p_value"],
		    width: [20,"","",""],
		    data: proteinList
		};
		jpostdb.utils.table(data, table, "fc_protein_list", 15, 0);
		
		var arg = [];
		for(var i = 0; i < proteinList.length;i++){ arg.push(proteinList[i].uniprot + ":" + proteinList[i].logfc); }
		param.args = arg.join("_");
		
		svg.select("#protein")
		.text("Protein: " + param.proteinCount);
	    }
	    svg.select("#fc_pa")
		.attr("transform", "translate(" + (param.logfc / param.maxFc * param.xArea) + ", 0)");
	    svg.select("#fc_na")
		.attr("transform", "translate(" + (-1 * param.logfc / param.maxFc * param.xArea) + ", 0)");
	    svg.select("#p_a")
	    	.attr("transform", function(d){ return "translate(0," + (Math.log(param.pvalue) / Math.log(10) / param.maxP * param.yArea ) + ")";} );
	    svg.select("#fc")
		.text("Fold change >= " + param.fc);
	    svg.select("#pval")
		.text("p-value <= " + param.pvalue);
	};

	var render = function(){
	    param.top += param.marginTop;
	    var g = svg.append("g")
		.attr("transform", "translate(0," + param.top + ")")
		.attr("id", "vplot");
	    g.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "2px")
		.attr("d", "M " + param.yAxisX + " " + param.xAxisY + " V 0");
	    g.append("path")
		.attr("stroke", "#000000")
		.attr("fill", "none")
		.attr("stroke-width", "2px")
		.attr("d", "M " + (param.yAxisX - param.xArea) + " " + param.xAxisY + " H " + (param.yAxisX + param.xArea));
	    g.append("text")
		.attr("x", 50)
		.attr("y", 50)
		.attr("id", "fc");
	    g.append("text")
		.attr("x", 50)
		.attr("y", 80)
		.attr("id", "pval");
	    g.append("text")
		.attr("x", 50)
		.attr("y", 110)
		.attr("id", "protein");	    
	    g.selectAll(".plot")
		.data(json)
		.enter()
		.append("circle")
		.attr("class", "plot")
		.attr("r", 3)
		.attr("cx", function(d){ return param.yAxisX + d.logfc /param.maxFc * param.xArea;})
	    	.attr("cy", function(d){ return param.xAxisY - d.logp / param.maxP * param.yArea;});
	    var fc_pa = g.append("g")
		.attr("id", "fc_pa");
	    fc_pa.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "1.5px")
		.attr("d", "M " + param.yAxisX + " " + param.xAxisY + " V 0");
	    var fc_pa_knob = fc_pa.append("g")
	    	.on("mouseover", function(){ param.arrX = true; })
	    	.on("mouseout", function(){  if(!param.dragFlagX) param.arrX = false; });
	    fc_pa_knob.append("rect")
		.attr("stroke", "none")
		.attr("fill", "#ffffff")
		.attr("x", param.yAxisX - 50)
		.attr("y", param.xAxisY + 3)
		.attr("width", 100)
		.attr("height", 16);
	    fc_pa_knob.append("polygon")
		.attr("stroke", "none")
		.attr("fill", "#aaaaaa")
		.attr("points", param.yAxisX + " " + (param.xAxisY + 5) + " " + (param.yAxisX - 10) + " " + (param.xAxisY + 15) + " " + (param.yAxisX + 10) + " " + (param.xAxisY + 15));
	    var fc_na = g.append("g")
		.attr("id", "fc_na");
	    fc_na.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "1.5px")
		.attr("d", "M " + param.yAxisX + " " + param.xAxisY + " V 0");
	    var p_a = g.append("g")
		.attr("id", "p_a");
	    p_a.append("path")
		.attr("stroke", "#888888")
		.attr("fill", "none")
		.attr("stroke-width", "1.5px")
		.attr("d", "M " + (param.yAxisX - param.xArea) + " " + param.xAxisY + " H " + (param.yAxisX + param.xArea));
	    var p_a_knob = p_a.append("g")
	    	.on("mouseover", function(){ param.arrY = true; })
	    	.on("mouseout", function(){ if(!param.dragFlagY) param.arrY = false; });
	    p_a_knob.append("rect")
		.attr("stroke", "none")
		.attr("fill", "#ffffff")
		.attr("x", param.yAxisX + param.xArea + 3)
		.attr("y", param.xAxisY - 50)
		.attr("width", 16)
		.attr("height", 100);
	    p_a_knob.append("polygon")
		.attr("stroke", "none")
		.attr("fill", "#aaaaaa")
		.attr("points",  (param.yAxisX + param.xArea + 5) + " " + param.xAxisY + " " + (param.yAxisX + param.xArea + 15) + " " + (param.xAxisY + 10) + " " + (param.yAxisX + param.xArea + 15) + " " + (param.xAxisY - 10));
	    
	    table.append("table")
	    	.attr("id", "plist");

	    var url = jpostdb.subApi + "enrich"; // Fisher's exact test API by R
	    var enrich_top = enrich.select("#enrich_top");
	    var enrich_svg = enrich.select("#enrich_svg");
	    var enrich_table = enrich.select("#enrich_table");
	    var select = enrich_top.append("select")
		.style("margin-left", param.margin + "px")
		.on("change", function(){
		    if(!this.value.match(/^--/)){
			enrich_svg.transition().duration(param.anime).attr("height", 0);
			var g = enrich_svg.selectAll(".forcegraph");
			g.remove();
			var list = enrich_table.select("#enrich_list");
			list.remove();
		//	jpostdb.httpReq("post", url, "data=" + param.args + "&e=1&target=" + this.value, group.enrichMap, enrich_svg, renderDiv, param.width / 2, 0);
			jpostdb.fetchReq("post", url, "data=" + param.args + "&e=1&target=" + this.value, renderDiv, param.width, group.enrichMap);
		    }
		});
	    select.append("option")
		.attr("id", "annotation_def")
		.text("-- Annotation --");
	    select.append("option")
		.attr("value", "ko")
		.text("KEGG Pathway");
	    select.append("option")
		.attr("value", "go_bp")
		.text("GO: biological process");
	    select.append("option")
		.attr("value", "go_mf")
		.text("GO: molecular function");
	    select.append("option")
		.attr("value", "go_cc")
		.text("GO: cellular component");
	    
	    var h = 400 + param.margin + param.margin;
	    param.top += h;
	    svg.transition().duration(param.anime).attr("height", param.top);
	}
	
	setInitData();
	setData();
	render();
	plot(1);

	group.mouseEvent(renderDiv, setData, plot);
    },

    enrichMap: function(data, renderDiv){
	var group = jpostdb.group_comp;
	var param = group.param;
	var enrich = renderDiv.select("#enrich");

	var svg = enrich.select("#enrich_svg").attr("width", param.width).attr("height", param.graphHeight);

	// set node size & color
	var max = 0;
	var min = 1;
	for(var i = 0; i < data.nodes.length; i++){
	    if(data.nodes[i].pvalue <= 0.05){
		if(max < data.nodes[i].count - 0) max = data.nodes[i].count - 0;
		if(min > data.nodes[i].pvalue - 0) min = data.nodes[i].pvalue - 0;
	    }
	}
	for(var i = 0; i < data.nodes.length; i++){
	    var r = 1 + Math.round(Math.pow(data.nodes[i].count/max, 0.5) * 29);
	    if(r > 30) r = 30;
	    data.nodes[i].r = r;
	    var color = "#ffffff";
	    if(data.nodes[i].pvalue - 0 == 2) color = "lightblue"; 
	    for(var j = 0; j < jpostdb.utils.param.color1.length; j++){
		if(Math.log(data.nodes[i].pvalue) <= (Math.log(min) - Math.log(5e-2)) / jpostdb.utils.param.color1.length * j + Math.log(5e-2)){
		    color = jpostdb.utils.param.color1[j];
		}else{ break; }
	    }
	    data.nodes[i].color = color;
	}
	// force-directed graph
	jpostdb.utils.forcegraph(data, svg, param.width);

	// set table data
	var kegg = 0;
	if(data.nodes[0].key.match(/^KEGG:/)) kegg = 1;
	var arg = ["_bgcolor", "term_label", "count", "pvalue"];
	var head = ["", "term", "count", "p-value"];
	var width = [20, , ,];
	if(kegg){ arg.push("keggmap"); head.push("mapping"); width.push("");}
	var list = [];
	for(var i = 0; i < data.nodes.length; i++){
	    if(data.nodes[i].pvalue - 0 <= 0.1){
		var obj = {
		    label: data.nodes[i].term_label,
		    key: data.nodes[i].key,
		    count: data.nodes[i].count,
		    pvalue: data.nodes[i].pvalue,
		    kos: data.nodes[i].kos,
		    color: data.nodes[i].color
		}
		if(kegg && data.nodes[i].kos.match(/^#ko value/)){
		    var key = data.nodes[i].key.replace(/^KEGG:/, "");
		    obj._innerhtml_keggmap = "<form method='post' action='http://www.kegg.jp/kegg-bin/mcolor_pathway' target='jpost_kegg'><input type='hidden' name='map' value='map" + key + "'><input type='hidden' name='mode' value='number'><input type='hidden' name='numericalType' value='nzp'><input type='hidden' name='negativeColor' value='#81adef'><input type='hidden' name='zeroColor' value='#e8e8e8'><input type='hidden' name='positiveColor' value='#ef8197'><input type='hidden' name='reference' value='white'><input type='hidden' name='unclassified' value='" + data.nodes[i].kos + "'><input type='submit' value='mapping'>";
		}
		list.push(obj);
	    }
	}
	list = list.sort(function(a,b){
	    if(a.pvalue - 0 < b.pvalue - 0) return -1;
	    if(a.pvalue - 0 > b.pvalue - 0) return 1;
	    return 0;
	});
	
	var tableData = {data: list, head: head, arg: arg, width: width};
	var renderDivEx = enrich.select("#enrich_table");
	jpostdb.utils.table(tableData, renderDivEx, "enrich_list", 15, 0);

    },


    mouseEvent: function(renderDiv, setData, plot){
	var param = jpostdb.group_comp.param;

	
	// drag = [mouseDown + mouseMove + mouseUp] 
	var mouseMoveEvent = function(){
	    var mouse = d3.mouse(this);
	 //   console.log(mouse[0] + " " + mouse[1]);
	    param.mouseX = mouse[0];
	    param.mouseY = mouse[1];
	};
	
	var mouseMoveEventDraw = function(){
	  //  console.log(param.mouseX + " " +  param.width);
	   // if(param.mouseX > param.marginLeft && param.mouseX < param.width + 100 && param.mouseY > 0 && param.mouseY < param.top){
		if(param.dragFlagX){
		    param.fc = 2 ** ((param.mouseX - param.yAxisX) / param.xArea * param.maxFc);
		    if(param.fc < 1) param.fc = 1;
		    else if(param.fc < 5) param.fc = Math.round(param.fc * 10) / 10;
		    else if(param.fc < 10) param.fc = Math.round(param.fc * 2) / 2;
		    else if(param.fc < 50) param.fc = Math.round(param.fc);
		    else param.fc = Math.round(param.fc / 10) * 10;
		    param.logfc = Math.log(param.fc) / Math.log(2);
		 //   setData();
		    plot(0);
		}
		if(param.dragFlagY){
		    var log = ( param.mouseY - param.xAxisY - param.marginTop) / param.yArea * param.maxP;
		    param.pvalue = 10 ** log;
		    if(param.pvalue < 0.001) param.pvalue = 0.001;
		    else if(param.pvalue < 0.01) param.pvalue = Math.round(10 ** log * 1000) / 1000;
		    else if(param.pvalue < 0.1) param.pvalue = Math.round(10 ** log * 100) / 100;
		    else if(param.pvalue < 1) param.pvalue = Math.round(10 ** log * 10) / 10;
		    else param.pvalue = 1;
		  //  setData();
		    plot(0);
		}	
	 //   }else{
	//	param.dragFlagX = false;
	//	param.dragFlagY = false;
	 //   }
	};

	var mouseDownEvent = function(){
	    if(param.arrX) param.dragFlagX = true;
	    if(param.arrY) param.dragFlagY = true;
	}
	
	var mouseUpEvent = function(){
	    if(param.dragFlagX){ param.dragFlagX = false; param.arrX = false; setData(); plot(1); }
	    if(param.dragFlagY){ param.dragFlagY = false; param.arrY = false; setData(); plot(1); }
	}


	var preventDefault = function(e) {
	    e = e || window.event;
	    if (e.preventDefault)
		e.preventDefault();
	    e.returnValue = false;  
	}
	
	renderDiv.on("mousemove", mouseMoveEvent, false);
	renderDiv.on("mousedown", mouseDownEvent, false);
	d3.select(window).on("mouseup", mouseUpEvent, false);
	document.addEventListener ("mousemove",  mouseMoveEventDraw, false);
    }
};
