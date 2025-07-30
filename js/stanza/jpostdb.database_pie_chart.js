// jPOST-db make database pie-chart

jpostdb.database_pie_chart = jpostdb.database_pie_chart || {
    param: {
	width: 10,
	height: 10,
	top: 0,
	outSize: 200,
	inSize: 130,
	margin: 20,
	anime: 100
    },

    init: function(stanza_params, stanza, renderDiv){
	var group = jpostdb.database_pie_chart;
	var param = group.param;
	var type = stanza_params.type;
	delete stanza_params.type;
	param = jpostdb.init_param(param, stanza_params, stanza, renderDiv);
	
	var renderDiv = d3.select(stanza.select(renderDiv));
	var view = renderDiv.append("div").attr("class", "view");
	var svg = view.append("svg")
	    .attr("id", "pie_chart_svg")
	    .attr("width", param.outSize)
	    .attr("height", param.outSize);
	
	var url = jpostdb.api + type + "_chart?" + param.apiArg.join("&");
	jpostdb.fetchReq("get", url, null,  renderDiv, param.outSize, group.pie_chart);
    },

    pie_chart: function(json, renderDiv){
	var group = jpostdb.database_pie_chart;
	var param = group.param;
	var svg = renderDiv.select("#pie_chart_svg");	
	var callBack = function(onclick_list){
	    for(var i = 0; i < onclick_list.length; i++){
		var type = onclick_list[i].type;
		var id = onclick_list[i].id;
		var label = onclick_list[i].label;
		$.each($("#" + type).children(), function(){
		    if( !id || $(this).attr('value') == id ) $(this).remove();
		});
		if(id){
		    var $newOption = $("<option></option>").val(id).text(label);
		    $("#" + type).append($newOption);
		    $("#" + type).val(id).trigger('change');
		}
	    }
	    jPost.updateTables( '' );
	}

	svg.transition().duration(param.anime).attr("height", param.outSize);
	jpostdb.utils.pie_chart2(json.data, svg, json.type, json.unit, param.outSize, param.inSize, 1, callBack);

    }
};
