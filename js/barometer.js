var BAROMETER;
if(BAROMETER == undefined) {
  BAROMETER = {};
}

BAROMETER.load = function(barometer_id) {
  this.barometer_id = barometer_id;
  this.empty_url = "http://getbarometer.s3.amazonaws.com/assets/barometer/images/transparent.gif";
  this.feedback_url = 'http://getbarometer.com/system/feedback_form/' + this.barometer_id;

  this.tab_html = '<a id="barometer_tab" onclick="BAROMETER.show();" href="#">Feedback</a>';
  this.overlay_html = '<div id="barometer_overlay" style="display: none;">' +
			'<div id="barometer_main" style="top: 130.95px;">' +
			'<a id="barometer_close" onclick="document.getElementById(\'barometer_overlay\').style.display = \'none\';return false" href="#"/></a>' +
			'<div id="overlay_header">' +
				'<a href="http://getbarometer.com">Powered by Barometer</a>' +
				'</div>' +
				'<iframe src="' + this.empty_url + '" id="barometer_iframe" allowTransparency="true" scrolling="no" frameborder="0" class="loading"></iframe>' +
				'</div>' +
				'<div id="barometer_screen" onclick="document.getElementById(\'barometer_overlay\').style.display = \'none\';return false" style="height: 100%;"/>' +
				'</div>' +
	'</div>';
       
    document.write(this.tab_html);
    document.write(this.overlay_html);    
};

BAROMETER.show = function() {
  document.getElementById('barometer_iframe').setAttribute("src", this.feedback_url);
  document.getElementById('barometer_overlay').style.display = "block";
  return false;
};