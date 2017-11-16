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
  // Define simulation
  // Radial -> Group layer
  // Collide -> Avoid collisions
  simulation = d3.forceSimulation(LODgraph.nodes)
      .velocityDecay(0.40)
      .force("r", d3.forceRadial(function(d) {
                                    var r={ Media:115, Geography:45, Cross_domain:156, User_generated:220, Linguistics: 267,
                                            Government:326, Publications:383, Social_networking: 195, Life_sciences: 433};
                                    return r[d.group];}).strength(1))
      .force("colisao", d3.forceCollide(function(d){ return d.radius; }).strength(1))
      .stop();

  for (var i = 0; i < 600; ++i)
    simulation.tick();

  links = svg.append("g")
        .attr("class", "links");

  nodes = svg.append("g")
        .attr("class", "nodes")
      .selectAll("circle")
      .data(LODgraph.nodes)
      .enter().append("circle")
        .attr("r", function(d){return d.radius;})
        .attr("fill",
          function(d){return color[groups.findIndex(function(g){return g == d.group;})];})
        .attr("id", function(d){return "N"+d.id;})
        .attr("class", function(d){return d.group;})
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;});

  links.selectAll("line")
      .data(LODgraph.links)
      .enter().append("line")
        .attr("class", function(d){return "S"+d.source+" "+"T"+d.target;})
        .attr("stroke-width", function(d){return Math.max(1, Math.log10(+d.weight));})
        .attr("x1", function(d){return d3.select("#N"+d.source).data()[0].x;})
        .attr("y1", function(d){return d3.select("#N"+d.source).data()[0].y;})
        .attr("x2", function(d){return d3.select("#N"+d.target).data()[0].x;})
        .attr("y2", function(d){return d3.select("#N"+d.target).data()[0].y;})
        .style("opacity", 0);
       

  nodes.append("title")
      .text(function(d){return d.title+"\nGroup: "+d.group+"\nTriples: "+d.triples.toLocaleString()+"\nLast modified: "+d.Last_modified;});
/*
//get svg element.
var svgSave = document.getElementById("LOD");
//get svg source.
var serializer = new XMLSerializer();
var source = serializer.serializeToString(svgSave);
//add name spaces.
if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
}
if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
}
//add xml declaration
source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
//convert svg source to URI data scheme.
var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
//set url value to a element's href attribute.
document.getElementById("link").href = url;
//you can download svg file by right click menu.
*/
/*
var svgSave = document.getElementById("LOD");
//get svg source.
var serializer = new XMLSerializer();
var svgData = serializer.serializeToString(svgSave);
//var svgData = $("#LOD")[0].outerHTML;
var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
var svgUrl = URL.createObjectURL(svgBlob);
var downloadLink = document.createElement("a");
downloadLink.href = svgUrl;
downloadLink.download = "LODTarget.svg";
document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);
*/
  function mouseOver(d) {
    return;
  }
  function mouseMove(d) {
    return;
  }
  function mouseOut(d) {
    return;
  }
});