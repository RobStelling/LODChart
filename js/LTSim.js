importScripts("d3/d3.min.js");

onmessage = function(event) {
  var nodes = event.data.nodes;

  // Define simulation
  // Radial -> Group layer
  // Collide -> Avoid collisions
  var simulation = d3.forceSimulation(nodes)
      .velocityDecay(0.40)
      .force("r", d3.forceRadial(function(d) {
                                    var r={ Media:115, Geography:45, Cross_domain:156, User_generated:220, Linguistics: 267,
                                            Government:326, Publications:383, Social_networking: 195, Life_sciences: 433};
                                    return r[d.group];}).strength(1))
      .force("colisao", d3.forceCollide(function(d){ return d.radius; }).strength(1))
      .stop();

  for (var i = 0, n = Math.ceil(1.5 * Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    postMessage({type: "tick", progress: i / n});
    simulation.tick();
  }

  postMessage({type: "end", nodes: nodes});
};