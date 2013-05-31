<!doctype html>
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>BootstrapCDN - Security</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width">
  <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/latest/css/bootstrap-combined.min.css" rel="stylesheet">

</head>
<body>
  <!--[if lt IE 7]><p class=chromeframe>Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</p><![endif]-->

	<header>

	</header>

  <div role="main">
		<div class="span12">
			<center><h2>BootstrapCDN Security <sup>Beta</sup></h2></center>

<?php

$rootPath = realpath('../');
$searchPath = "/twitter-bootstrap";

$check = '&#x2714';
$x = '&#x2718';
$legacy = array(					"2.3.1/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css",
									"2.3.1/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/js/bootstrap.min.js",
									"2.3.0/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/css/bootstrap-combined.min.css",
									"2.3.0/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/js/bootstrap.min.js",
									"2.2.2/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/css/bootstrap-combined.min.css",
									"2.2.2/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/js/bootstrap.min.js",
									"2.2.1/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/css/bootstrap-combined.min.css",
									"2.2.1/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/js/bootstrap.min.js",
									"2.2.0/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.0/css/bootstrap-combined.min.css",
									"2.2.0/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.0/js/bootstrap.min.js",
									"2.1.1/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css",
									"2.1.1/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/js/bootstrap.min.js",
									"2.1.0/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.1.0/css/bootstrap-combined.min.css",
									"2.1.0/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.1.0/js/bootstrap.min.js",
									"2.0.4/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.0.4/css/bootstrap-combined.min.css",
									"2.0.4/js" =>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.0.4/js/bootstrap.min.js");

if ($searchPath == "") $searchPath = "/bootstrap-cdn"; //default to root

$objects =	new RecursiveIteratorIterator(
						new RecursiveDirectoryIterator($rootPath), 
						RecursiveIteratorIterator::SELF_FIRST);
echo "<table class='table table-striped table-index'><thead><tr><th>File</th><th>MD5 Origin Hash</th><th>MD5 Edge Hash</th><th>Match</th></tr></thead><tbody>\n";

$ch = curl_init();
foreach($objects as $name => $object){
	$path = $object->getPathname();
	$md5local = md5(file_get_contents($path));
	$status = false;
	foreach($legacy as $ver => $url){
		$urldir = substr($url,strrpos($url,$ver));
		if( strpos($path,$urldir) !== FALSE ){
			curl_setopt($ch, CURLOPT_URL, "http:".$url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			$response = curl_exec($ch);
			$md5remote = md5($response);
			if( $md5local == $md5remote ) $status = true; //some condition comparing md5s
			if( $object->isFile() and strpos($path,$searchPath) !== FALSE ){
				echo "<tr><td>". substr($path,strrpos($path,$searchPath))."</td><td><code>".$md5local."</code></td><td><code>".$md5remote."</code></td>";
				if ($status) echo "<td style='color:green'>".$check."</td></tr>\n";
				else echo  "<td style='color:red'>".$x."</td></tr>\n";
			}
		}
	}
}
echo "</table>\n";

//$curl_close($ch);

?>

  </div>
  <footer>
	<center>
		<div class="span12">If a hash does not match, we will be notified. <br> Please send any other security concerns to support at bootstrapcdn.com <br> BTW We are just getting started ;)</div>
	</center>
  </footer>


  <script src="http://code.jquery.com/jquery-1.10.0.min.js"></script>
  <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/latest/js/bootstrap.min.js"></script>
  <script>
    var _gaq=[['_setAccount','UA-32253110-1'],['_trackPageview']];
    (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
    s.parentNode.insertBefore(g,s)}(document,'script'));
  </script>
</body>
</html>