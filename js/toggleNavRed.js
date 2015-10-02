$('body').on('click', '.expandingNavClosed .headingexpandingRed', function(event){
  var that = this.parentNode;
  
  $(that).children('.expandingSubText').animate({
		top: '-=50',
		height: 'show'
	  }, 100, function() {
		that.setAttribute("class", "expandingNavOpen");

		//set the 'plus' image to 'minus'
		that.getElementsByClassName("headingexpandingRed")[0].getElementsByTagName("img")[0].src = "../images/slidingContent/minusSmall.png";
	  });
});

$('body').on('click', '.expandingNavOpen .headingexpandingRed', function(event){
  var that = this.parentNode;
  
  /*if(this.getElementByTagName("img") == null){
  		this.prepend("<img src=../images/slidingContent/plus.png>");
  }*/

  $(that).children('.expandingSubText').animate({
		top: '-=50',
		height: 'hide'
	  }, 100, function() {
		that.setAttribute("class", "expandingNavClosed");

		//set the 'minus' image to 'plus'
		that.getElementsByClassName("headingexpandingRed")[0].getElementsByTagName("img")[0].src = "../images/slidingContent/plusSmall.png";
	  });
});

(function() {
	var nodes;
	var innerData;

	nodes = document.getElementsByClassName("expandingNavClosed");
	for(node in nodes) {
		if(node < nodes.length) {
			var heading = nodes[node].getElementsByClassName("headingexpandingRed")[0];
			if(heading.getElementsByTagName("img").length == 0){
				innerData = nodes[node].getElementsByClassName("headingexpandingRed")[0].innerHTML
				heading.innerHTML = innerData + "<img src=../images/slidingContent/plusSmall.png>";
	  		}
	  	}
	}

	nodes = document.getElementsByClassName("expandingNavOpen");
	for(node in nodes) {
		if(node < nodes.length) {
			var heading = nodes[node].getElementsByClassName("headingexpandingRed")[0];
			if(heading.getElementsByTagName("img").length == 0){
				innerData = nodes[node].getElementsByClassName("headingexpandingRed")[0].innerHTML
				heading.innerHTML = innerData + "<img src=../images/slidingContent/minusSmall.png>";
	  		}
	  	}
	}
	
})()

/*$('.expandingContentClosed .heading').(function(event){
	console.log(this.getElementsByTagName("img"));
});*/