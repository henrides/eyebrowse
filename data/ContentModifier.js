
$(function(){
	self.port.on("gazePosition", function (position) {
		//$("p:first").html("pos = " + position.top + "," + position.left);
		//console.log("From content pos = " + position.top + "," + position.left);
		$("#eb_box").offset(position);
	});

	var toggleBorder = false;
	$("body").keydown(function(key){
		if (key.altKey && key.ctrlKey) {
			if (!toggleBorder) {
				/*$("a").each(function(){
					$(this).css("border","5px solid red");
					var width = $(this).outerWidth();
					var height = $(this).outerHeight();
					var offset = $(this).offset();
					console.log("link found at " + offset.left + "," + offset.top + " with dimension " + width + "x" + height);
				});
				*/
				$("body").append("<div id=\"eb_box\"></div>");
				$("#eb_box").css("border", "1px solid black");
				$("#eb_box").css("height", "5px");
				$("#eb_box").css("width", "5px");
				toggleBorder = true;
				self.port.emit("trackGazePosition");
			} else {
				/*$("a").each(function(){
					$(this).css("border","none");
				});
				*/
				$("#eb_box").remove();
				toggleBorder = false;
				self.port.emit("stopTracking");
			}
		}
	});
});

