$("input:text").focus(function() {
	$(this).select();
	$(this).mouseup(function(e){
		e.preventDefault();
	});
});