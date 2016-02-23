//return all the values that are unique. i.e. remove repetiting values
Array.prototype.unique = function()
{
  var n = {},r=[];
  for(var i = 0; i < this.length; i++) 
  {
    if (!n[this[i]]) 
    {
      n[this[i]] = true; 
      r.push(this[i]); 
    }
  }
  return r;
}

var radius = d3.scale.sqrt().range([0, 12]);
var padding = 3, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 12;

var diameter = 800, //max size of the bubbles
    format = d3.format(",d"),
    color = d3.scale.category20c(); //color category

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("color", "white")
  .style("padding", "8px")
  .style("background-color", "rgba(0, 0, 0, 0.75)")
  .style("border-radius", "6px")
  .style("font", "12px sans-serif")
  .text("tooltip");

d3.csv("./data/ifa-dissertations.csv", function(error, data) {
  if (error) throw error;

  var categories = data.map(function(a){
        // a.Category = a.Category.toLowerCase();
        return a.Category;
      });

  var advisors = data.map(function(a){
        // a.Category = a.Category.toLowerCase();
        return a.Advisor;
      });

  var catCount = {}; //category frequency.

  data.forEach(function(a){
    if(!catCount[a.Category]) 
      catCount[a.Category]=1;
    else
      catCount[a.Category]++;
  });

  var catData = [];

  Object.keys(catCount).forEach(function(k){
    catData.push({
      name: k,
      count: catCount[k]
    });
  });

  categories = categories.unique();

  //get advisor
  var advCount = {}; //category frequency.

  data.forEach(function(a){
    if(!advCount[a.Advisor]) 
      advCount[a.Advisor]=1;
    else
      advCount[a.Advisor]++;
  });

  var advData = [];

  Object.keys(advCount).forEach(function(k){
    advData.push({
      name: k,
      count: advCount[k]
    });
  });
  categories = categories.unique();
  advisors = advisors.unique();


  catData = catData.map(function(d){ 
    d.value = +d.count;
    d.centerX = diameter/2;
    d.centerY = diameter/2;
    return d; 
  });
  advData = advData.map(function(d){ d.value = +d.count; return d; });
  //bubbles needs specific format, convert data to this
  var catDataNodes = bubble.nodes({children:catData}).filter(function(d) { return !d.children; });
  var advDataNodes = bubble.nodes({children:advData}).filter(function(d) { return !d.children; });

  var force = d3.layout.force()
    .nodes(catDataNodes)
    .size([diameter, diameter])
    .gravity(0)
    .charge(0)
    .on("tick", tick)
    .start();

  var svg = d3.select("body")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

  //setup the chart
  var nodes = svg.selectAll("circle")     
    .data(catDataNodes);

  nodes.enter().append("circle")
    .attr("r", function(d) { return d.r; })
    .attr("cx", function(d){ return d.x; })
    .attr("cy", function(d){ return d.y; })
    .style("fill", function(d) { return color(d.value); })
    .call(force.drag)
    .on("mouseover", function(d) {
      tooltip.text(d.name + ": " + format(d.value));
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
    })
    .on("mouseout", function() { return tooltip.style("visibility", "hidden"); });

  nodes.transition()
    .duration(750)
    .delay(function(d, i) { return i * 5; })
    .attrTween("r", function(d) {
      var i = d3.interpolate(0, d.r);
      return function(t) { return d.r = i(t); };
    });

  //format the text for each bubble
  nodes.append("text")
    .attr("x", function(d){ return d.x; })
    .attr("y", function(d){ return d.y + d.r/3; })
    .attr("text-anchor", "middle")
    .style("pointer-events", "none")
    .text(function(d){
      // console.log(d);
      // return d["name"]; 
      return d.name.substring(0, d.r / 4);
    })
    .style({
      "font-size":"12px",
      "font-family": "sans-serif",
      "font-weight": "100",
      "text-anchor": "middle",
      fill: "white"
    });

  nodes.append("text")
    .attr("x", function(d){ return d.x; })
    .attr("y", function(d){ return d.y; })
    .attr("text-anchor", "middle")
    .style("pointer-events", "none")
    .text(function(d){ return d["count"]; })
    .style({
      "font-size": "20px",
      "font-family": "sans-serif",
      "font-weight": "100",
      "text-anchor": "middle",
      fill: "white"
    });

  function tick(e) {
    nodes
      .each(gravity(.1 * e.alpha))
      .each(collide(0.5))
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; });
  }

  function gravity(alpha) {
    return function (d) {
      d.y += (d.centerY - d.y) * alpha;
      d.x += (d.centerX - d.x) * alpha;
    };
  }

  function collide(alpha) {
    var quadtree = d3.geom.quadtree(catDataNodes);
    return function (d) {
      var r = d.r + maxRadius + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.r + quad.point.r + padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }
});
