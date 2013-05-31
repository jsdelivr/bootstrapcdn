<?php

$rootPath = realpath('../');
$searchPath = "/twitter-bootstrap";

$check = '&#x2714';
$x = '&#x2718';
$legacy = array(	"2.3.1/css"=>"//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css",
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

echo "<table class='table table-striped table-index'><thead><tr><th>File</th><th>MD5 Local Hash</th><th>MD5 Remote Hash</th><th>Match</th></tr></thead><tbody>\n";

$ch = curl_init();
foreach($legacy as $ver => $url){
	$objects =	new RecursiveIteratorIterator(
							new RecursiveDirectoryIterator($rootPath), 
							RecursiveIteratorIterator::SELF_FIRST);
	foreach($objects as $name => $object){
		$path = $object->getPathname();
		$md5local = md5(file_get_contents($path));
		$status = false;
		$urldir = substr($url,strrpos($url,$ver));
		if( strpos($path,$urldir) !== FALSE ){
			curl_setopt($ch, CURLOPT_URL, "http:".$url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			$response = curl_exec($ch);
			$md5remote = md5($response);
			if( $md5local == $md5remote ) $status = true; //some condition comparing md5s
			if( $object->isFile() and strpos($path,$searchPath) !== FALSE ){
				echo "<tr><td>". substr($path,strrpos($path,$searchPath))."</td><td>".$md5local."</td><td>".$md5remote."</td>";
				if ($status) echo "<td style='color:green'>".$check."</td></tr>\n";
				else echo  "<td style='color:red'>".$x."</td></tr>\n";
			}
			break;
		} else { 
			continue; 
		}
	}
}
echo "</table>\n";

$curl_close($ch);