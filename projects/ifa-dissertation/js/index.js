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
var dataType;
var panelOpen = false; //alumni info panel state
var radius = d3.scale.sqrt().range([0, 10]);
var padding = 3, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 10;

var _data;

var height = 600, //max size of the bubbles
    width = 1200,
    format = d3.format(",d"),
    colorMap = {},
    color = function(key, totalColors) {
      var colorIndex = Object.keys(colorMap).length + 10 || 1;
      if (!colorMap[key]) {
        colorMap[key] = d3.hsl((colorIndex * (360 / totalColors)) % 360, 0.7, 0.7);
      }
      return colorMap[key];
    };
    
var center = {
  x: width/2,
  y: height/2
};

var year_centers = [{
    name: "1933-1960",
    x: width / 10,
    y: height / 2
  },{
    name: "1960-1987",
    x: width * 4 / 10,
    y: height / 2
  },{ 
    name: "1987-2014",
    x: 8 * width / 10,
    y: height / 2
  }];

var target;
var damper = 0.1;

var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height])
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

  var years = data.map(function(a){
        // a.Category = a.Category.toLowerCase();
        return a.Year;
      });
  var titles = data.map(function(a){
        return a.Title;
      });
  //get catergory data
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

  //get advisor data
  var advCount = {}; //advisor frequency.

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

  //get year data
  var yeaCount = {}; //year frequency.

  data.forEach(function(a){
    if(!yeaCount[a.Year]) 
      yeaCount[a.Year]=1;
    else
      yeaCount[a.Year]++;
  });

  var yeaData = [];

  Object.keys(yeaCount).forEach(function(k){
    yeaData.push({
      name: k,
      count: yeaCount[k]
    });
  });

  categories = categories.unique();
  advisors = advisors.unique();
  years = years.unique();

  _data = data;
  initSearchBox();

  catData = catData.map(function(d){ 
    d.value = +d.count;
    d.centerX = width/2;
    d.centerY = height/2;
    return d; 
  });
  advData = advData.map(function(d){ 
    d.value = +d.count;
    d.centerX = width/2;
    d.centerY = height/2; 
    return d; 
  });
  yeaData = yeaData.map(function(d){ 
    d.value = +d.count;
    d.centerX = width/2;
    d.centerY = height/2; 
    return d; 
  });
  //bubbles needs specific format, convert data to this
  // var Category = bubble.nodes({children:catData}).filter(function(d) { return !d.children; });
  // var Advisor = bubble.nodes({children:advData}).filter(function(d) { return !d.children; });
  // var Year = bubble.nodes({children:yeaData}).filter(function(d) { return !d.children; });
  var Category = bubble.nodes({children:catData}).filter(function(d) { return !d.children; });
  var Advisor = bubble.nodes({children:advData}).filter(function(d) { return !d.children; });
  var Year = bubble.nodes({children:yeaData}).filter(function(d) { return !d.children; });

  var svg = d3.select(".visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble");

  function initSearchBox(){
    var categories = _data.map(function(a){
      return a.Category;
    }).unique();
    var years = _data.map(function(a){
      return a.Year;
    }).unique();

    var searchTerms = categories.concat(years);
    $( "#searchbox" ).autocomplete({
      source: searchTerms,
      select: function(e, selected){
        var catIndex = categories.indexOf(selected.item.value);
        var yeaIndex = years.indexOf(selected.item.value);
        // console.log(years);
        // console.log(selected.item.value);
        // console.log(yeaIndex);
        if(catIndex > -1){
          var d = Category[catIndex];
          // console.log("here comes the d from searchbox");
          console.log(d);
          renderProfile(d);
          if(dataType !== "category"){
           var val = 'Category';
           $("#text-select").val(val);
           // d3.select('text-select').property('value', 'Category');
           updateData(Category);
          }
        }
        else if(yeaIndex > -1){
          var reverseIndex = years.length -1 - yeaIndex;
          var d = Year[reverseIndex];
          // console.log(d);
          renderProfile(d);
          if(dataType !== "year"){
            var val = 'Year';
            $("#text-select").val(val);
            // d3.select('text-select').property('value', 'Year');
            updateData(Year);
          }
        }
      }
    });
  }
  //RENDERS PROFILE i.e. list of all dissertation in one cat/year/adv
  function renderProfile(d){
    // console.log(d);
    $("#selection").html(
        "<h3> <span class=\"name\">"
        + d.name + ": " + "</span>"
        +"<span class=\"number\">"
        + d["count"] + "</span>" + "</h3>"
    );
    var dInOneCat = data.filter(function(e){
      return (e.Category === d.name);
    });
    var dInOneAdv = data.filter(function(e){
      return (e.Advisor === d.name);
    });
    var dInOneYea = data.filter(function(e){
      return (e.Year === d.name);
    });
    $('#dissertation').empty();
    if(dInOneCat.length > 0){
      $("#dissertation").append("<tr>"
        + "<th>Author</th>"
        + "<th>Title</th>"
        + "<th>Advisor(s)</th>"
        + "<th>Year</th>"
        + "</tr>");
      for (var i = 0; i < dInOneCat.length; i++) {
        $("#dissertation").append("<tr>"
          + "<td><strong>" + dInOneCat[i].Author + "</strong></td>"
          + "<td>" + dInOneCat[i].Title + "</td>"
          + "<td>" + dInOneCat[i].Advisor + "; " + dInOneCat[i].Advisor2 + "</td>"
          + "<td>" + dInOneCat[i].Year + "</td>"
          + "</tr>");
      };
    }
    else if(dInOneAdv.length > 0) {
      $("#dissertation").append("<tr>"
        + "<th>Author</th>"
        + "<th>Title</th>"
        + "<th>Category</th>"
        + "<th>Year</th>"
        + "</tr>");
      for (var i = 0; i < dInOneAdv.length; i++) {
        $("#dissertation").append("<tr>"
          + "<td>" + dInOneAdv[i].Author + "</td>"
          + "<td>" + dInOneAdv[i].Title + "</td>"
          + "<td>" + dInOneAdv[i].Category + "</td>"
          + "<td>" + dInOneAdv[i].Year + "</td>"
          + "</tr>");
      };
    }
    else if(dInOneYea.length > 0){
      $("#dissertation").append("<tr>"
        + "<th>Author</th>"
        + "<th>Title</th>"
        + "<th>Category</th>"
        + "<th>Advisor(s)</th>"
        + "</tr>");
      for (var i = 0; i < dInOneYea.length; i++) {
        $("#dissertation").append("<tr>"
          + "<td>" + dInOneYea[i].Author + "</td>"
          + "<td>" + dInOneYea[i].Title + "</td>"
          + "<td>" + dInOneYea[i].Category + "</td>"
          + "<td>" + dInOneYea[i].Advisor + ", " + dInOneYea[i].Advisor2 + "</td>"
          + "</tr>");
      };
    }
  }
  function updateData(newData){
    year0 = parseInt(newData[0].name);
    //check what data type do we have in the bubble chart now, category, year, or advisor
    if(year0 > 1932 && year0 < 2015){
      dataType = "year";
    }
    else if(newData[0].name == "African Art (sub-Saharan)"){
      dataType = "category";
    }
    else{
      dataType = "advisor";
    }
    //remove old elements  
    d3.selectAll("circle")    
      .remove();

    if(year0 > 1932 && year0 < 2015){
      var force = d3.layout.force()
        .nodes(newData) //Category --> newData
        .size([width, height])
        .gravity(-0.01)
        .charge(function(d){return -Math.pow(d.radius, 2.0) / 8; })
        .friction(0.9)
        .on("tick", tickYear)
        .start();
        display_years();
    }
    else{
      var force = d3.layout.force()
        .nodes(newData) //Category --> newData
        .size([width, height])
        .gravity(-0.01)
        .charge(function(d){return -Math.pow(d.radius, 2.0) / 8; })
        //.gravity(0)
        //.charge(0)
        //add friction
        .friction(0.9)
        .on("tick", tick)
        .start(); 
      hide_years(); 
    }
    //setup the chart
    var nodes = svg.selectAll(".node")//"circle"     
      .data(newData);

    nodes.enter()
      .append("g")
      .attr("class", "nodes")
      .call(force.drag);

    var circles = nodes.append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("fill", function(d) {
        return color(d.name, newData.length); 
      })
      // .call(force.drag)
      .on("mouseover", function(d) {
        var bubble = d3.select(this);
        bubble.attr("stroke", "#000")
          .attr("stroke-width", 2.5);
        tooltip.text(d.name + ": " + format(d.value));
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      })
      .on("mouseout", function() { 
        var bubble = d3.select(this);
        tooltip.style("visibility", "hidden");
        bubble.attr("stroke", "none");
      })
      .on("click",  function(d){
        // console.log(d);
        renderProfile(d);
      });

    if(newData[0].name == "African Art (sub-Saharan)"){
      circles.attr("data-legend", function(d) { return d.name; });
      var legend = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(16, 70)")
        .style("font-size","12px")
        .attr("data-style-padding",10)
        .call(d3.legend);
    } else {
      $("g.legend").remove();
    }

    //format the text for each bubble
    // var name = nodes.append("text")
    //   .attr("x", function(d){ return d.x; })
    //   .attr("y", function(d){ return d.y + d.r/3; })
    //   .attr("text-anchor", "middle")
    //   .style("pointer-events", "none")
    //   .text(function(d){
    //     // console.log(d);
    //     // return d["name"]; 
    //     return d.name.substring(0, d.r / 4);
    //   })
    //   .style({
    //     "font-size":"12px",
    //     "font-family": "sans-serif",
    //     "font-weight": "100",
    //     "text-anchor": "middle",
    //     fill: "white"
    //   });

    //format the number for each bubble
    // var number = nodes.append("text")
    //   .attr("x", function(d){ return d.x})
    //   .attr("y", function(d){ return d.y})
    //   .attr("text-anchor", "middle")
    //   .style("pointer-events", "none")
    //   .text(function(d){ return d["count"]; })
    //   .style("font-size", function(d){return d.r/4 + 10 +"px";})
    //   .style({
    //     "font-family": "sans-serif",
    //     "font-weight": "100",
    //     "text-anchor": "middle",
    //     fill: "white"
    //   });

    circles.transition()
      .duration(2000)//750
      .delay(function(d, i) { return i * 5; })
      .attrTween("r", function(d) {
        var i = d3.interpolate(0, d.r);
        return function(t) { return d.r = i(t); };
      });

    // remove old elements  
    // svg.selectAll(".node")//"circle"     
    //   .data(newData).exit().remove();

    // nodes.exit().remove().call(function(){console.log(nodes);});

    function tick(e) {
      circles
        // .each(gravity(.1 * e.alpha))
        .each(collide(0.03))
        .each(move_towards_center(e.alpha))
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
      // number
        // .each(gravity(.1 * e.alpha))
        // .each(collide(0.03))
        // .each(move_towards_center(e.alpha))
        // .attr("x", function (d) { return d.x; })
        // .attr("y", function (d) { return d.y; });
      //show the name in the bubble
      // name
      //   .each(gravity(.1 * e.alpha))
      //   .each(collide(0.5))
      //   .attr("x", function (d) { return d.x; })
      //   .attr("y", function (d) { return d.y + d.r/3; });
    }

    function tickYear(e) {
      circles
        // .each(gravity(.1 * e.alpha))
        .each(collide(0.01))
        .each(move_towards_year(e.alpha))
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
      // number
        // .each(gravity(.1 * e.alpha))
        // .each(collide(0.01))
        // .each(move_towards_year(e.alpha))
        // .attr("x", function (d) { return d.x; })
        // .attr("y", function (d) { return d.y; });
    }

    function move_towards_center(alpha){
        return function(d) {
          d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
          d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
        };
    };

    function move_towards_year(alpha){
        return function(d) {
          var year = parseInt(d.name);
          if(year > 1932 && year < 1960){
            target = year_centers[0];
          }
          else if(year >= 1960 && year < 1987){
            target = year_centers[1];
          }
          else if(year >= 1987 && year <= 2014){
            target = year_centers[2];
          }
          else{
            target = year_centers[2];
          }
          var alphaY = alpha/4;
          d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
          d.y = d.y + (target.y - d.y) * (damper + 0.02) * alphaY;
        };
    };

    function display_years(){
      if($("#yearTag0").length !== 0){
        for(var i = 0; i < year_centers.length; i++){
          var id = 'yearTag'+i;
          id = id.toString();
          if($("#" + id).length !== 0){
            var a = $('#'+id);
            a.css('visibility', 'visible');    
          }
        }
      }
    }

    function hide_years(){
      for(var i = 0; i < year_centers.length; i++){
        var id = 'yearTag'+i;
        id = id.toString();
        if($("#" + id).length !== 0){
          var a = $('#'+id);
          a.css('visibility', 'hidden');    
        }
      }
    }

    function gravity(alpha) {
      return function (d) {
        // console.log(d);
        // alphaY = alpha / 8;
        d.y += (d.centerY - d.y) * alpha;
        d.x += (d.centerX - d.x) * alpha;
      };
    }

    function collide(alpha) {
      var quadtree = d3.geom.quadtree(newData);//Category --> newData
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
    // function renderPanel(d){
    //   renderCatProfile(d);
    //   if( !panelOpen ){
    //     // $("#dissertation-info").fadeThenSlideToggle();
    //     panelOpen = true;
    //   }
    // }
  }
  updateData(Category);
  // console.log(Category);

  d3.select('#text-select')
    .on('change', function(){
      var newData = eval(d3.select(this).property('value'));
      console.log(newData);
      updateData(newData);
    });
});
