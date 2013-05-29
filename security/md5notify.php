<?php

//This is a backend script that will notify you by e-mail if there is a change to any of the twitter-bootstrap files.
//Please set your e-mail in config.ini

$ini_array = parse_ini_file("./config.ini");
$email = $ini_array['email']; //set e-mail
echo "Notifications will be sent to: ".$email."\n";

date_default_timezone_set('America/Los_Angeles');

$rootPath = realpath('../');
$searchPath = "/twitter-bootstrap";
$objects =	new RecursiveIteratorIterator(
						new RecursiveDirectoryIterator($rootPath),
						RecursiveIteratorIterator::SELF_FIRST);

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

$leglog = array(	"2.3.1/js" =>"",
									"2.3.0/css"=>"",
									"2.3.0/js" =>"",
									"2.2.2/css"=>"",
									"2.2.2/js" =>"",
									"2.2.1/css"=>"",
									"2.2.1/js" =>"",
									"2.2.0/css"=>"",
									"2.2.0/js" =>"",
									"2.1.1/css"=>"",
									"2.1.1/js" =>"",
									"2.1.0/css"=>"",
									"2.1.0/js" =>"",
									"2.0.4/css"=>"",
									"2.0.4/js" =>"");
									

function firstPass(){
	global $objects, $searchPath, $legacy, $leglog;
	$ch = curl_init();
	echo "\nLocal compare with Remote executed at start of run-time:\n\n";
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
					$leglog[$ver] = $md5remote;
					echo substr($path,strrpos($path,$searchPath))."  ".$md5local."  ".$md5remote." ";
					if ($status) echo " MATCH\n";
					else echo  "NO MATCH\n";
				}
			}
		}
	}
	curl_close($ch);
}

function loop(){

	echo "\nExecuting remote change check:\n\n";
	global $objects, $searchPath, $legacy, $leglog;
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
				if( $leglog[$ver] == $md5remote ) $status = true; //some condition comparing md5s
				if( $object->isFile() and strpos($path,$searchPath) !== FALSE ){
					if (!$status) {
						echo substr($path,strrpos($path,$searchPath))." has changed!\n";
						echo "Previous hash: ".$leglog[$ver]."\n";
						echo "New Hash.....: ".$md5remote."\n";
						echo "Time changed : ".date('m/d/Y h:i:s a', time())." \n";
						notify( substr($path,strrpos($path,$searchPath)), $leglog[$ver],$md5remote);
						$leglog[$ver] = $md5remote;
					}
				}
			}
		}
	}
	curl_close($ch);
}

function notify($dir, $oldHash, $newHash){
	global $email;
	$to = $email;
	$subject = "Bootstrap-cdn event";
	$message = 	"Time: ".date('m/d/Y h:i:s a',time()).
							"\n\nThis is to alert you that the bootstrap-cdn file: \"".$dir."\" has been altered.".
							"\n\nThe hashes have changed from \"".$oldHash."\" to \"".$newHash."\"".
							"\n\nIf you believe this change should not have happened, please check on the file now.".
							"\n\nYou can compare your local file to the remote by running \"/path/to/bootstrap-cdn/security/md5.php\"";
	$from = "auto-notify@boostrapcdn.com";
	$headers = "From:".$from;
	mail($to,$subject,$message,$headers);
	echo "Notification sent \n";
}

function dump(){
	global $leglog;
	echo "<h3>remote hashes:</h3>\n";
	foreach($leglog as $i=>$hash){
		echo $i." ".$hash."\n";
	}
	echo "\n";
}

//
firstPass();
while (true){
	flush();
	sleep(30);
	loop();
}
//notify("Somedir","OldHash","NewHash"); //test email
//dump();