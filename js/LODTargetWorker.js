/*
 * Todo list:
 * x Include static reference do d3.v4.min.js
 * - Cleanup and comment code
 * X Isolate adjancency matrix code (will belong to a different visualization)
 * X Prepare to dinamically select a group or set of groups (currently using separate files)
 * X Verify SVG attributes
 * X Play with force field models
 * - Review links color schema
 * X Review group color schema (currently Colorbrewer2 categorical, 9 colors)
 * X Separate files (css, js, html)
 * X Review code for groupCount
 */
const ALL = "all";
// Order for d3.schemeSet1
// var color = d3.schemeSet1; // From Colorbrewer2, categorical, 9
//var groups = ["Life_sciences", "Geography", "Linguistics", "User_generated", "Government",
//              "Publications", "Cross_domain", "Media", "Social_networking"],
// Original proposed order for d3.schemePaired
//var groups = ["Publications", "Cross_domain", "Linguistics", "Geography", "Government",
//              "User_generated", "Life_sciences", "Media", "Social_networking"],

var color = d3.schemePaired;
var groups = ["Cross_domain", "Geography", "Media", "Linguistics", "User_generated",
              "Life_sciences", "Publications", "Government", "Social_networking"],
    groupNL = [],     // Node-link structure for each one of the groups (with links within the same group)
    svg = d3.select("svg");

for (var i = 0; i<groups.length;i++)
  groupNL[groups[i]] = {links: [], nodes:[]};

d3.json("./json/graphFile22-08-2017.json", function(error, LODgraph) { // graphFile22-08-2017.json
  if (error) throw error;

  var k, links, nodes, simulation;

  /*
   * Goes through all nodes and creates all sub-groups self-referencing structures
   * Uses group name (LODgraph.nodes[k].group) to index groupNL object
   * Assign radius to nodes
   */
  for (k=0; k<LODgraph.nodes.length; k++) {
    LODgraph.nodes[k].radius = Math.max(5, Math.log(LODgraph.nodes[k].triples));
    groupNL[LODgraph.nodes[k].group].nodes.push(LODgraph.nodes[k]);
  }
  /*
   * Goes through all links ans adds groups self-referencing links
   * (EG: Geography->Geography) to their corresponding group.
   */
  for (k=0; k<LODgraph.links.length; k++) {
    if (LODgraph.nodes[LODgraph.links[k].source].group == LODgraph.nodes[LODgraph.links[k].target].group) {
      var g = LODgraph.nodes[LODgraph.links[k].source].group;
      groupNL[g].links.push(LODgraph.links[k]);
    }
  }

  var meter = document.querySelector("#progress"),
  	  worker = new Worker("js/LTSim.js");

  worker.postMessage({nodes: LODgraph.nodes});

  worker.onmessage = function(event) {
  	switch(event.data.type) {
  		case "tick": return ticked(event.data);
  		case "end": return ended(event.data);
  	}
  };

  function ticked(data) {
  	var progress = data.progress;
  	meter.style.width = 100 * progress + "%";
  }

  function ended(data) {
  	var links, nodes, svgLinks, svgNodes;
  	links = LODgraph.links;
  	nodes = data.nodes;

  	function twoDigits(number) {
  		return Math.round(number*100)/100;
  	}

  	meter.style.display = "none";

	svgLinks = svg.append("g")
	      .attr("class", "links");

	svgNodes = svg.append("g")
	      .attr("class", "nodes")
	    .selectAll("circle")
	    .data(nodes)
	    .enter().append("circle")
	      .attr("r", function(d){return twoDigits(d.radius);})
	      .attr("fill",
	        function(d){return color[groups.findIndex(function(g){return g == d.group;})];})
	      .attr("id", function(d){return "N"+d.id;})
	      .attr("class", function(d){return d.group;})
	      .attr("cx", function(d){return twoDigits(d.x);})
	      .attr("cy", function(d){return twoDigits(d.y);});

	svgNodes.append("title")
	    .text(function(d){
	    	var creator = "";
	    	if (d.Creator != undefined)
	    		creator = "\nCreator: "+d.Creator;
	    	return `${d.title}${creator}\nGroup: ${d.group}\nTriples: ${d.triples.toLocaleString()}\nLast modified: ${d.Last_modified}`;
	    });

	// setTimeout is called here to force the immediate display of the graph (circles),
	// while invisible links are computed separately. Delay could even be 0, with the same result
	setTimeout(
		function(){
		  svgLinks.selectAll("line")
		    .data(links)
		    .enter().append("line")
		      .attr("class", function(d){return "S"+d.source+" "+"T"+d.target;})
		      .attr("stroke-width", function(d){return twoDigits(Math.max(1, Math.log10(+d.weight)));})
		      .attr("x1", function(d){return twoDigits(d3.select("#N"+d.source).data()[0].x);})
		      .attr("y1", function(d){return twoDigits(d3.select("#N"+d.source).data()[0].y);})
		      .attr("x2", function(d){return twoDigits(d3.select("#N"+d.target).data()[0].x);})
		      .attr("y2", function(d){return twoDigits(d3.select("#N"+d.target).data()[0].y);})
		      .style("opacity", 0);
		    }, 1);
  }
});