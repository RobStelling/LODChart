
var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width : number = 950 - margin.right - margin.left,
    height : number = 950 - margin.top - margin.bottom;

var index : number = 0,
    duration : number = 750,
    depth : number = 70,
    root,
    groups : string[] = [];

var adjancencyMatrix;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("./json/graphFile22-08-2017.json", function(error, LODgraph) {
  if (error) throw error;
  var nodeSpace = LODgraph.nodes.length, linkSpace = LODgraph.links.length;

  var j, k;
  adjancencyMatrix = new Array(nodeSpace);

  for (k = 0; k<nodeSpace; k++)
    adjancencyMatrix[k] = new Array(nodeSpace);
  // Fill adjancency Matrix
  for (k = 0; k<linkSpace; k++)
    adjancencyMatrix[LODgraph.links[k].source][LODgraph.links[k].target] = LODgraph.links[k].weight;
  for (j = 0; j<nodeSpace; j++)
    for (k = 0; k<nodeSpace; k++)
      if (!adjancencyMatrix[j][k])
        adjancencyMatrix[j][k] = 0;


  for (k = 0; k<nodeSpace; k++)
    if (!groups.includes(LODgraph.nodes[k].group))
      groups.push(LODgraph.nodes[k].group);

  root = LODgraph;
  root.x0 = height / 2;
  root.y0 = 0;

  update(root);
});

d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * depth; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++index); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) {
        return d._children ? "lightsteelblue" :"#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.lance+(d.eval?": "+d.eval:""); })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : d.link ? "#0f0" : d.children ? "#fff" : "#f00"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    if (d.link)
      window.open(d.link);
    d.children = d._children;
    d._children = null;
  }
  update(d);
}
