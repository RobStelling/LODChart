importScripts("d3/d3.min.js");

onmessage = function(event) {
  var nodes = event.data.nodes;

  // Define simulation
  // Radial -> Group layer
  // Collide -> Avoid collisions
  var simulation = d3.forceSimulation(nodes)
      .velocityDecay(0.4)
      .force("r", d3.forceRadial(function(d) {
                                    var r={ Media:113, Geography:45, Cross_domain:150, User_generated:208, Linguistics: 256,
                                            Government:318, Publications:372, Social_networking: 182, Life_sciences: 422};
                                    return r[d.group];}).strength(1))
      .force("colisao", d3.forceCollide(function(d){ return d.radius; }).strength(1))
      .stop();
// 1.15 ~= 345 times
  for (var i = 0, n = Math.ceil(1.15 * Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    postMessage({type: "tick", progress: i / n});
    simulation.tick();
  }

  postMessage({type: "end", nodes: nodes});
};