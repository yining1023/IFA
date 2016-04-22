//run this script in the faculty.html page console to get a json file about faluty information
//inject jquery first
window.onload = function() {
  var obj = getJSON();
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

  var a = document.getElementById('save-btn');
  a.href = 'data:' + data;
  a.download = 'faultyList.json';
  a.innerHTML = 'Save as JSON';

  var container = document.getElementById('container');
};

var getJSON = function() {
  var json = [];

  $("tr").each(function(i) {
    var faculty = {};
    faculty.img= $(this).find("img").src;
    faculty.name = $(this).find("p").find("a").text();
    faculty.name = $(this).find("italic").text();
    faculty.name = $(this).find("greycontent").text();
    json.push(faculty);
  });

  return json;
};