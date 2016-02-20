$(document).ready(function () {
  var bubbleChart = new d3.svg.BubbleChart({
    supportResponsive: true,
    //container: => use @default
    size: 1200,
    //viewBoxSize: => use @default
    innerRadius: 1200 / 3.5,
    //outerRadius: => use @default
    radiusMin: 50,
    radiusMax: 80,
    //radiusMax: use @default
    //intersectDelta: use @default
    //intersectInc: use @default
    //circleColor: use @default
    data: {
      items: [
        {text: "African Art (sub-Saharan)", count: "236"},
        {text: "Architectural History/Historic Preservation", count: "382"},
        {text: "Art of the Middle East/North Africa", count: "170"},
        {text: "Art of the United States", count: "123"},
        {text: "Chinese Art", count: "12"},
        {text: "Contemporary Art", count: "170"},
        {text: "Critical Theory/Gender Studies/Visual Studies", count: "382"},
        {text: "Decorative Arts/Textiles/Design History", count: "10"},
        {text: "Drawings/Prints/Works on Paper", count: "170"},
        {text: "Digital Media.Animation", count: "12"},
        {text: "Early Christian/Byzantine Art", count: "236"},
        {text: "Early Medieval/Romanesque/Gothic Art", count: "382"},
        {text: "Egyptian/Ancient Near Eastern Art", count: "170"},
        {text: "Eighteenth-Century Art", count: "123"},
        {text: "Film/Video", count: "12"},
        {text: "Greek/Roman Art", count: "12"},
        {text: "Japanese/Korean Art", count: "170"},
        {text: "Latin American/Caribbean Art", count: "382"},
        {text: "Native American", count: "10"},
        {text: "Nineteenth-Century Art", count: "170"},
        {text: "Oceanic/Australian Art", count: "236"},
        {text: "Outsider/Folk Art", count: "382"},
        {text: "Performance Studies", count: "170"},     
        {text: "Pre-Columbian Art", count: "123"},
        {text: "Prehistoric Art", count: "12"},
        {text: "Renaissance/Baroque Art", count: "170"},
        {text: "South/Southeast Asian Art", count: "382"},
        {text: "Twentieth-Century Art", count: "10"},
        {text: "World Art", count: "170"},
      ],
      eval: function (item) {return item.count;},
      classed: function (item) {return item.text.split(" ").join("");}
    },
    plugins: [
      {
        name: "central-click",
        options: {
          text: "(See more detail)",
          style: {
            "font-size": "12px",
            "font-style": "italic",
            "font-family": "Source Sans Pro, sans-serif",
            //"font-weight": "700",
            "text-anchor": "middle",
            "fill": "white"
          },
          attr: {dy: "65px"},
          centralClick: function() {
            alert("Here is more details!!");
          }
        }
      },
      {
        name: "lines",
        options: {
          format: [
            {// Line #0
              textField: "count",
              classed: {count: true},
              style: {
                "font-size": "28px",
                "font-family": "Source Sans Pro, sans-serif",
                "text-anchor": "middle",
                fill: "white"
              },
              attr: {
                dy: "0px",
                x: function (d) {return d.cx;},
                y: function (d) {return d.cy;}
              }
            },
            {// Line #1
              textField: "text",
              classed: {text: true},
              style: {
                "font-size": "4px",
                "font-family": "Source Sans Pro, sans-serif",
                "text-anchor": "middle",
                fill: "white"
              },
              attr: {
                dy: "20px",
                x: function (d) {return d.cx;},
                y: function (d) {return d.cy;}
              }
            }
          ],
          centralFormat: [
            {// Line #0
              style: {"font-size": "50px"},
              attr: {}
            },
            {// Line #1
              style: {"font-size": "3px"},
              attr: {dy: "40px"}
            }
          ]
        }
      }]
  });
});