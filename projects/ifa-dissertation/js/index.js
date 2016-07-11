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

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

var dataType;//year, advisor, or category
var advisorInfo = [];//
var searchAdv="";//save which advisor does users search or click on
var panelOpen = false; //alumni info panel state
var radius = d3.scale.sqrt().range([0, 10]);
var padding = 3, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 10;

var _data;

var height = 400, //max size of the bubbles
    width = 800,
    format = d3.format(",d"),
    colorMap = {},
    colorMapAdv = {},
    colorMapYea = {},
    color = function(key, totalColors) {
      var colorIndex = Object.keys(colorMap).length + 10 || 1;
      if (!colorMap[key]) {
        colorMap[key] = d3.hsl((colorIndex * (360 / totalColors)) % 360, 0.7, 0.7);
      }
      return colorMap[key];
    }, //generate the evenly spaced hue color with fixed saturation and lightness
    //generate color #7b98aa with evenly space saturation and lgihtness
    colorForAdv = function(key, totalColors){
      var colorIndex = Object.keys(colorMapAdv).length + 10 || 1;
      if (!colorMapAdv[key]) {
        var brightness = ((colorIndex * (360 / totalColors)) % 360)/360/2;
        colorMapAdv[key] = d3.hsl(203, 0.22, brightness + 0.2);
      }
      return colorMapAdv[key];
    },
    colorForYea = function(key, totalColors){
      var colorIndex = Object.keys(colorMapYea).length + 10 || 1;
      if (!colorMapYea[key]) {
        var brightness = Math.random()*0.3;
        colorMapYea[key] = d3.hsl(203, 0.22, 0.4 + brightness);
      }
      return colorMapYea[key];
    },
    //fixed color for catagory data
    colorForCat = d3.scale.ordinal()
    .domain(["0", "1", "2", "3", "4", "5", "6", "7", "8","9", "10", "11","12","13"])
    .range(['#0a67a3','#4f90ba','#ffd663','#ffcb39','#ffbc00','#ff4100','#074f7e',
            '#ff8b63','#c53200','#ff6c39','#9b7200','#c59100','#9b2800','#043e63']);

var center = {
  x: width/2,
  y: height/2
};

var year_centers = [{
    name: "1933-1970",
    x: width * 2 / 10,
    y: height / 2
  },{
    name: "1970-1997",
    x: width * 5 / 10,
    y: height / 2
  },{
    name: "1997-2016",
    x: width * 8 / 10,
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
    if(a.Category == ""){
      a.Category = "Uncategorized";
    }
    return a.Category;
  });

  var advisors = data.map(function(a){
    return a.Advisor;
  });

  var years = data.map(function(a){
    return a.Year;
  });

  var titles = data.map(function(a){
    return a.Title;
  });

  var authors = data.map(function(a){
    return a.Author;
  });

  //get catergory frequency data
  var catCount = {};

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
    if(a.Advisor2 !== ""){
      if(!advCount[a.Advisor2]){
        advCount[a.Advisor2]=1;
      }
      else{
        advCount[a.Advisor2]++;
      }
    }
  });

  var advData = [];

  Object.keys(advCount).forEach(function(k){
    advData.push({
      name: k,
      count: advCount[k]
    });
  });

  advData = advData.sort(function(a, b){
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
  })
  // console.log(advData);

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

  //get author data
  var autCount = {}; //author frequency. actually no need to calculate this

  data.forEach(function(a){
    if(!autCount[a.Author])
      autCount[a.Author]=1;
    else
      autCount[a.Author]++;
  });

  var autData = [];

  Object.keys(autCount).forEach(function(k){
    autData.push({
      name: k,
      count: autCount[k]
    });
  });

  //get title data
  var titCount = {}; //title frequency.

  data.forEach(function(a){
    if(!titCount[a.Title])
      titCount[a.Title]=1;
    else
      titCount[a.Title]++;
  });

  var titData = [];

  Object.keys(titCount).forEach(function(k){
    titData.push({
      name: k,
      count: titCount[k]
    });
  });

  categories = categories.unique();
  advisors = advisors.unique();
  years = years.unique();
  authors = authors.unique();
  titles = titles.unique();

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

  autData = autData.map(function(d){
    d.value = +d.count; //only needs valaue, no centerX, centerY
    return d;
  });

  titData = titData.map(function(d){
    d.value = +d.count; //only needs valaue, no centerX, centerY
    return d;
  });

  //bubbles needs specific format, convert data to this
  var Category = bubble.nodes({children:catData}).filter(function(d) { return !d.children; });
  var Advisor = bubble.nodes({children:advData}).filter(function(d) { return !d.children; });
  var Year = bubble.nodes({children:yeaData}).filter(function(d) { return !d.children; });

  var Author = bubble.nodes({children:autData}).filter(function(d) { return !d.children; });
  var Title = bubble.nodes({children:titData}).filter(function(d) { return !d.children; });

  var svg = d3.select(".visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble")
    .attr("viewBox", "0 0 800 400")
    .attr("preserveAspectRatio", "xMidYMid meet");

  var aspect = width / height;

  //creating svg for legend for advisor data
  var svg2 = d3.select("#advisor-legend")
    .append("svg")
    .attr("width", 250)
    .attr("height", 20*(advData.length+1));

  //add year tag
  var yearTags = svg.selectAll('.yearTag')
    .data(year_centers);

  yearTags.enter()
    .append("text")
    .attr("class", "yearTag")
    .text(function(d) { return d.name; })
    .style("visibility", "hidden")
    .attr("transform", function(d) {
      var center = d.x - 40;
      return "translate(" + center + "," + height + ")";
    });

  d3.select(window)
    .on("resize", function() {
      var targetWidth = svg.node().getBoundingClientRect().width;
      var targetHeight = targetWidth / aspect;
      svg.attr("width", targetWidth);
      svg.attr("height", targetHeight);
    });

  function initSearchBox(){
    var categories = _data.map(function(a){
      return a.Category;
    }).unique();
    var years = _data.map(function(a){
      return a.Year;
    }).unique();
    var advisors = _data.map(function(a){
      return a.Advisor;
    }).unique();
    var authors = _data.map(function(a){
      return a.Author;
    }).unique();
    var titles = _data.map(function(a){
      return a.Title;
    }).unique();

    var searchTerms0 = categories.concat(years);
    var searchTerms1 = searchTerms0.concat(authors);
    var searchTerms2 = searchTerms1.concat(titles);
    var searchTerms = searchTerms2.concat(advisors);
    $( "#searchbox" ).autocomplete({
      source: searchTerms,
      select: function(e, selected){
        var catIndex = categories.indexOf(selected.item.value);
        var yeaIndex = years.indexOf(selected.item.value);
        var advIndex = advisors.indexOf(selected.item.value);
        var autIndex = authors.indexOf(selected.item.value);
        var titIndex = titles.indexOf(selected.item.value);

        if(catIndex > -1){
          var d = Category[catIndex];
          // console.log(d);
          renderProfile(d);
          if(dataType !== "category"){
           var val = 'Category';
           $("#text-select").val(val);
           updateData(Category);
          }
        }
        else if(yeaIndex > -1){
          var reverseIndex = years.length -1 - yeaIndex;
          var d = Year[reverseIndex];
          renderProfile(d);
          if(dataType !== "year"){
            var val = 'Year';
            $("#text-select").val(val);
            updateData(Year);
          }
        }
        else if(advIndex > -1){
          // console.log(Advisor);
          var d = Advisor[advIndex];
          renderProfile(d);
          if(dataType !== "advisor"){
            var val = 'Advisor';
            $("#text-select").val(val);
            updateData(Advisor);
          }
        }
        else if(autIndex > -1){
          var d = Author[autIndex];
          renderProfile(d);
        }
        else if(titIndex > -1){
          var d = Title[titIndex];
          renderProfile(d);
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
      searchAdv = d.name;
      return (e.Advisor === d.name || e.Advisor2 === d.name);
    });
    var dInOneYea = data.filter(function(e){
      return (e.Year === d.name);
    });
    var dInOneAut = data.filter(function(e){
      return (e.Author === d.name);
    });
    var dInOneTit = data.filter(function(e){
      return (e.Title === d.name);
    });

    $('#dissertation-table').empty();
    var dissertationTable = $('#dissertation-table');

    $('.advisor-thumb').empty();

    // $('#dissertation').empty();
    //one problem here, everytime render profile, the bootstrap-table.js will init
    // a table container div(class:"bootstrarp-table"), so if render profile for several times,
    // there will be a container inside of another. I tried to empty it every time it init a container,
    //but it didn't work:
    // $('.bootstrap-table').empty();
    //from the outside, there's no difference. But in the DOM, you can see there are extra container
    // $('#dissertation').bootstrapTable('destory');
    if(dInOneCat.length > 0){
      dissertationTable.append("<thead><tr>"
        + "<th data-sortable='true' data-field='year'>Year</th>"
        + "<th data-sortable='true' data-field='anthor'>Author</th>"
        + "<th data-sortable='true' data-field='advisor'>Advisor(s)</th>"
        + "<th data-sortable='true' data-field='title'>Title</th>"
        + "</tr></thead><tbody>");
      for (var i = 0; i < dInOneCat.length; i++) {
        // console.log(dInOneCat[i].Advisor2);
        //see if there is a second advisor, if yes, add "; second advisor", if not, return ""
        var ifadvisor2 = '';
        if(dInOneCat[i].Advisor2.length > 0){
          ifadvisor2 = '; ' + dInOneCat[i].Advisor2;
        }
        else{
          ifadvisor2 = '';
        }
        // console.log(advisor3);
        if(i<dInOneCat.length-1){
          dissertationTable.append("<tr>"
            + "<td>" + dInOneCat[i].Year + "</td>"
            + "<td>" + dInOneCat[i].Author + "</td>"
            + "<td>" + dInOneCat[i].Advisor + ifadvisor2 + "</td>"
            + "<td>" + dInOneCat[i].Title + "</td>"
            + "</tr>");
        }else{
          dissertationTable.append("<tr>"
            + "<td>" + dInOneCat[i].Year + "</td>"
            + "<td>" + dInOneCat[i].Author + "</td>"
            + "<td>" + dInOneCat[i].Advisor + ifadvisor2 + "</td>"
            + "<td>" + dInOneCat[i].Title + "</td>"
            + "</tr></tbody>");
        }
      }
    }
    else if(dInOneAdv.length > 0) {
      //update the advisor thumb photo
      //if the thumb photo exist
      //remove the white spce in the string
      var searchAdv1 = searchAdv.trim();
      var url = './faculty-thumbs/'+searchAdv1+'.jpg';
      var img = new Image();
      img.src = url;
      img.onload = function() {
        document.getElementById('advisor-thumb').appendChild(img);
      };
      img.onerror = function() {console.log("There is no image for this advisor");};

      //show advisor info, name, title, field of study
      //delete the comma in the name, eg: Nochlin, Linda into Nochlin Linda
      //save the new name in searchAdv2 
      searchAdv2 = searchAdv.replace(",","");
      console.log(searchAdv2);
      //clear every thing first
      //clear name
      var a = document.getElementById('advisor-link');
      a.innerHTML = "";
      //clear title
      var advisorTitleDiv = document.getElementById('advisor-title');
      advisorTitleDiv.innerHTML = "";
      //clear field of study
      var advisorFieldDiv = document.getElementById('advisor-field');
      advisorFieldDiv.innerHTML = "";
      //search if there is advisor info
      for(var i = 0; i < advisorInfo.length; i++){
        console.log(advisorInfo[i][0]);
        if(advisorInfo[i][0] == searchAdv2){
          console.log('got a name');
          //show the border of advisor info
          $("#advisor-info").attr("style", "display: block");
          //add link to the advisor name
          if(advisorInfo[i][1]!== null && advisorInfo[i][1] !== ""){
            $("#advisor-link").attr("style", "color: #7a98ab");
            a.href = advisorInfo[i][1];
          }else{
            $("#advisor-link").attr("style", "color: black");
          }
          a.innerHTML = searchAdv2;
          //add title
          var advisorTitleDiv = document.getElementById('advisor-title');
          if(typeof advisorInfo[i][2] !== 'undefined' && advisorInfo[i][2]!==null && advisorInfo[i][2]!==""){
            advisorTitleDiv.innerHTML = advisorInfo[i][2];
          }
          //add study of field
          var advisorFieldDiv = document.getElementById('advisor-field');
          if(typeof advisorInfo[i][3] !== 'undefined' && advisorInfo[i][3]!==null && advisorInfo[i][3]!==""){
            advisorFieldDiv.innerHTML = advisorInfo[i][3];
          }
        }
      }
      //update the table
      dissertationTable.append("<thead><tr>"
        + "<th data-sortable='true'>Year</th>"
        + "<th data-sortable='true'>Author</th>"
        + "<th data-sortable='true'>Title</th>"
        + "<th data-sortable='true'>Category</th>"
        + "<th data-sortable='true'>First/Secondary Advisor</th>"
        + "</tr></thead><tbody>");
      for (var i = 0; i < dInOneAdv.length; i++) {
        if(dInOneAdv[i].Advisor2!=="" && dInOneAdv[i].Advisor2 == searchAdv){
          firstOrSecond = "Secondary";
        }else{
          firstOrSecond = "First";
        }
        if(i<dInOneAdv.length-1){
          dissertationTable.append("<tr>"
            + "<td>" + dInOneAdv[i].Year + "</td>"
            + "<td>" + dInOneAdv[i].Author + "</td>"
            + "<td>" + dInOneAdv[i].Title + "</td>"
            + "<td>" + dInOneAdv[i].Category + "</td>"
            + "<td>" + firstOrSecond + "</td>"
            + "</tr>");
        }else{
          dissertationTable.append("<tr>"
            + "<td>" + dInOneAdv[i].Year + "</td>"
            + "<td>" + dInOneAdv[i].Author + "</td>"
            + "<td>" + dInOneAdv[i].Title + "</td>"
            + "<td>" + dInOneAdv[i].Category + "</td>"
            + "<td>" + firstOrSecond + "</td>"
            + "</tr></tbody>");
        }
      }
    }
    else if(dInOneYea.length > 0){
      dissertationTable.append("<thead><tr>"
        + "<th data-sortable='true'>Author</th>" //don't forget to add 'data-sortable='true''
        //in order to make srtable table work, also add <thead>, <tbody>
        + "<th data-sortable='true'>Advisor(s)</th>"
        + "<th data-sortable='true'>Title</th>"
        + "<th data-sortable='true'>Category</th>"
        + "</tr></thead><tbody>");
      for (var i = 0; i < dInOneYea.length; i++) {
        var ifadvisor2 = ''; //see if there is a second advisor, if yes, add "; second advisor", if not, return ""
        if(dInOneYea[i].Advisor2.length > 0){
          ifadvisor2 = '; ' + dInOneYea[i].Advisor2;
        }
        else{
          ifadvisor2 = '';
        }
        if(i<dInOneYea.length-1){
          dissertationTable.append("<tr>"
            + "<td>" + dInOneYea[i].Author + "</td>"
            + "<td>" + dInOneYea[i].Advisor + ifadvisor2 + "</td>"
            + "<td>" + dInOneYea[i].Title + "</td>"
            + "<td>" + dInOneYea[i].Category + "</td>"
            + "</tr>");
        }else{
          dissertationTable.append("<tr>"
            + "<td>" + dInOneYea[i].Author + "</td>"
            + "<td>" + dInOneYea[i].Advisor + ifadvisor2 + "</td>"
            + "<td>" + dInOneYea[i].Title + "</td>"
            + "<td>" + dInOneYea[i].Category + "</td>"
            + "</tr></tbody>");
        }
      }
    }
    else if(dInOneAut.length > 0){
      dissertationTable.append("<thead><tr>"
        + "<th data-sortable='true'>Year</th>"
        + "<th data-sortable='true'>Advisor(s)</th>"
        + "<th data-sortable='true'>Title</th>"
        + "<th data-sortable='true'>Category</th>"
        + "</tr></thead><tbody>");
      for (var i = 0; i < dInOneAut.length; i++) {
        var ifadvisor2 = ''; //see if there is a second advisor, if yes, add "; second advisor", if not, return ""
        if(dInOneAut[i].Advisor2.length > 0){
          ifadvisor2 = '; ' + dInOneAut[i].Advisor2;
        }
        else{
          ifadvisor2 = '';
        }
        if(i<dInOneAut.length-1){
          dissertationTable.append("<tr>"
            + "<td>" + dInOneAut[i].Year + "</td>"
            + "<td>" + dInOneAut[i].Advisor + ifadvisor2 + "</td>"
            + "<td>" + dInOneAut[i].Title + "</td>"
            + "<td>" + dInOneAut[i].Category + "</td>"
            + "</tr>");
        }else{
          dissertationTable.append("<tr>"
            + "<td>" + dInOneAut[i].Year + "</td>"
            + "<td>" + dInOneAut[i].Advisor + ifadvisor2 + "</td>"
            + "<td>" + dInOneAut[i].Title + "</td>"
            + "<td>" + dInOneAut[i].Category + "</td>"
            + "</tr></tbody>");
        }
      }
    }
    else if(dInOneTit.length > 0){
      dissertationTable.append("<thead><tr>"
        + "<th data-sortable='true'>Year</th>"
        + "<th data-sortable='true'>Author</th>"
        + "<th data-sortable='true'>Advisor(s)</th>"
        + "<th data-sortable='true'>Category</th>"
        + "</tr></thead><tbody>");
      for (var i = 0; i < dInOneTit.length; i++) {
        var ifadvisor2 = ''; //see if there is a second advisor, if yes, add "; second advisor", if not, return ""
        if(dInOneTit[i].Advisor2.length > 0){
          ifadvisor2 = '; ' + dInOneTit[i].Advisor2;
        }
        else{
          ifadvisor2 = '';
        }
        if(i<dInOneTit.length-2){
          dissertationTable.append("<tr>"
            + "<td>" + dInOneTit[i].Year + "</td>"
            + "<td>" + dInOneTit[i].Author + "</td>"
            + "<td>" + dInOneTit[i].Advisor + ifadvisor2 + "</td>"
            + "<td>" + dInOneTit[i].Category + "</td>"
            + "</tr>");
        }else{
          dissertationTable.append("<tr>"
            + "<td>" + dInOneTit[i].Year + "</td>"
            + "<td>" + dInOneTit[i].Author + "</td>"
            + "<td>" + dInOneTit[i].Advisor + ifadvisor2s + "</td>"
            + "<td>" + dInOneTit[i].Category + "</td>"
            + "</tr></tbody>");
        }
      }
    }
    //in order to dynamically add sortable table, call this function.
    dissertationTable.bootstrapTable();
  }

  function updateData(newData){
    //Clear Selections
    $("#dissertation-table").empty();
    $("#selection").empty();

    year0 = parseInt(newData[0].name);
    //check what data type do we have in the bubble chart now, category, year, or advisor
    if(!isNaN(year0) && typeof year0 === "number"){
      dataType = "year";
    }
    else if(typeof newData[0].name === "string" && newData[0].name.indexOf(",") > -1){
      dataType = "advisor";
    }
    else if(typeof newData[0].name === "string" && newData[0].name.indexOf(",") == -1) {
      dataType = "category";
    }
    //remove old elements
    d3.selectAll("circle")
      .remove();

    //if it's year data, display years
    if(dataType == "year") {
      yearTags.style("visibility", "visible");
      var force = d3.layout.force()
        .nodes(newData) //Year --> newData
        .size([width, height])
        .gravity(-0.01)
        .charge(function(d){return -Math.pow(d.radius, 2.0) / 8; })
        .friction(0.6)
        .on("tick", tickYear) //call tick Year instead
        .start();
        display_years();
    } else {
      yearTags.style("visibility", "hidden");
      var force = d3.layout.force()
        .nodes(newData) //newData is not year
        .size([width, height])
        .gravity(-0.01)
        .charge(function(d){return -Math.pow(d.radius, 2.0) / 8; })
        .friction(0.6)
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
      .attr("r", function(d) {return d.r/2; })
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      // .style("fill", function(d) {
      //   return color(d.name, newData.length);
      // })
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

    if(dataType == "category"){
      circles.style("fill", function(d) {
        return colorForCat(d.name);
      })
    }else if(dataType == "advisor"){
      circles.style("fill", function(d) {
        return colorForAdv(d.name, newData.length);
      })
    }else if(dataType == "year"){
      circles.style("fill", function(d) {
        return colorForYea(d.name, newData.length);
      })
    }

    //when it's category data, show legend
    if(dataType == "category"){
      $("#advisor-legend").attr("style", "display: none");
      $("#advisor-info").attr("style", "display: none");
      $("#search").attr("style", "top: -800px");
      $("g.legend").remove();
      circles.attr("data-legend", function(d) { return d.name; });
      var legend = svg.append("g")
        .attr("class","legend")
        .attr("transform","translate(-15, 20)")
        .style("font-size","10px")
        .attr("data-style-padding",8);
        // .call(d3.legend);

      legend.selectAll('rect')
        .data(newData)
        .enter()
        .append("circle")
        .attr("cx", 30)
        .attr("cy", function(d, i){ return (i-1) *  12})
        .attr("r", 4)
        // .attr("height", 5)
        // .style("stroke", "#7b98aa")
        .style("fill", function(d) {return colorForCat(d.name);});
        // .attr("stroke-width", 1)
        // .style("fill", "#7b98aa");

      legend.selectAll('text')
        .data(newData)
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("width", 5)
        .attr("height", 5)
        .attr("y", function(d, i){ return (i-1) *  12 + 5;})
        .style("cursor", "pointer")
        .text(function(d) {
          return d.name + ' (' + d.count + ')';
        })
        .on("click", renderProfile);
    } else if (dataType == "advisor"){ //when it's advisor data, show another legend
        $("#search").attr("style", "top: -475px");
        $("#advisor-legend").attr("style", "display: block");
        $("#advisor-info").attr("style", "display: none");
        $("g.legend").remove();

      var legend = svg2.append("g")
        .attr("class","legend")
        .attr("transform","translate(-15, 40)")
        .style("font-size","12px")
        .attr("data-style-padding",10);
        // .call(d3.legend);
      legend.selectAll('rect')
        .data(newData)
        .enter()
        .append("circle")
        .attr("cx", 30)
        .attr("cy", function(d, i){ return (i-1) *  20})
        .attr("r", 2.5)
        // .attr("height", 5)
        // .style("stroke", "#7b98aa")
        // .attr("stroke-width", 1)
        // .style("fill", "#7b98aa");
        .style("fill", function(d) {return colorForAdv(d.name);});

      legend.selectAll('text')
        .data(newData)
        .enter()
        .append("text")
        .attr("x", 40)
        .attr("width", 5)
        .attr("height", 5)
        .attr("y", function(d, i){ return (i-1) *  20 + 5;})
        .style("cursor", "pointer")
        .text(function(d) {
          return d.name + ' (' + d.count + ')';
        })
        .on("click", renderProfile);
    }else {
      $("#advisor-legend").attr("style", "display: none");
      $("#advisor-info").attr("style", "display: none");
      $("#search").attr("style", "top: -930px");
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
    if(dataType == "category"){
      circles.transition()
        .duration(2000)//750
        .delay(function(d, i) { return i * 5; })
        .attrTween("r", function(d) {
          var i = d3.interpolate(0, d.r*3/4);
          return function(t) { return d.r = i(t); };
        });
    }else{
      circles.transition()
        .duration(2000)//750
        .delay(function(d, i) { return i * 5; })
        .attrTween("r", function(d) {
          var i = d3.interpolate(0, d.r);
          return function(t) { return d.r = i(t); };
        });
    }
    yearTags.moveToFront();

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

//here is the function that divides all years evenly. To change it, change the if condition.
    function move_towards_year(alpha){
        return function(d) {
          var year = parseInt(d.name);
          if(year < 1970){
            target = year_centers[0];
          }
          else if(year >= 1970 && year < 1997){
            target = year_centers[1];
          }
          else if(year >= 1997){
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
  }
  updateData(Category);

  d3.select('#text-select')
    .on('change', function(){
      var newData = eval(d3.select(this).property('value'));
      // console.log(newData);
      updateData(newData);
    });
});

//read advisor info csv and save them as arrays
$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "./data/ifa-advisors.csv",
    success: function(data) {
      processData(data);
    }
  });
});

function processData(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');

  for (var i=1; i<allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    // if (data.length <= headers.length && data.length > 0) {
      var tarr = [];
      for (var j=0; j<headers.length; j++) {
        // if(data[j]!==""){
          tarr.push(data[j]);
        // }
      }
      advisorInfo.push(tarr);
    // }
  }
  console.log(advisorInfo);
}
