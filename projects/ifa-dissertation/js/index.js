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

var diameter = 800, //max size of the bubbles
    format = d3.format(",d"),
    color = d3.scale.category20c(); //color category

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("body")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

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

      // console.log(catData);

      categories = categories.unique();
  catData = catData.map(function(d){ d.value = +d.count; return d; });
  //bubbles needs specific format, convert data to this
  var nodes = bubble.nodes({children:catData}).filter(function(d) { return !d.children; });

  //setup the chart
  var bubbles = svg.append("g")
      .attr("transform", "translate(0,0)")
      .selectAll(".bubble")
      .data(nodes)
      .enter();

  bubbles.append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("fill", function(d) { return color(d.value); })
      .on("mouseover", function(d) {
              tooltip.text(d.name + ": " + format(d.value));
              tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
          return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      })
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  //format the text for each bubble
    bubbles.append("text")
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
    bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .text(function(d){ return d["count"]; })
        .style({
                "font-size": "28px",
                "font-family": "sans-serif",
                "font-weight": "100",
                "text-anchor": "middle",
                fill: "white"
        });
});