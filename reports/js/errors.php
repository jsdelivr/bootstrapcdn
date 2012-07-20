<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Reports</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="http://current.bootstrapcdn.com/bootstrap-v204/css/bootstrap-combined.min.css" rel="stylesheet">
    <style>
      body {
        padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
      }
    </style>

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="bootstrap/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="bootstrap/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="bootstrap/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="bootstrap/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="bootstrap/ico/apple-touch-icon-57-precomposed.png">

  </head>

  <body>

    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <a class="brand" href="#">Reports</a>
          <div class="nav-collapse">
            <ul class="nav">
              <li><a href="index.php">Popular Files</a></li>
              <li><a href="location.php">Nodes Breakdown</a></li>
              <li class="active"><a href="errors.php?date=<?=date("Y-m-d");?>">Hourly Errors</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>

 


<?php
require('config.php');
/*
 * NetDNA API Sample Code - PHP
 * Version 1.0a
 */

// Get it here: https://raw.github.com/gist/2791330/64b7007ab9d4d4cbb77efd107bb45e16fc6c8cdf/OAuth.php


//connection to the database
$dbhandle = mysql_connect($hostname, $username, $password) 
 or die("Unable to connect to MySQL");
//echo "Connected to MySQL<br>";

//select a database to work with
$selected = mysql_select_db($dbname,$dbhandle) 
  or die("Could not select db=netdna");

require_once("OAuth.php");

//your app key and secret
$key    = "af77755fc8f0021d3e9f65345d37b7cb04fed6080";
$secret = "a623a28e3df9f7c453cdab023c06f183";
$alias  = "jdorfman";

// create an OAuth consumer with your key and secret
$consumer = new OAuthConsumer($key, $secret, NULL);

// method type: GET, POST, etc
$method_type   = "GET";

$startdate = $_REQUEST[date];
//$nextdate = date('Y-m-d',strtotime("+1 day",$startdate));
$nextdate=strftime("%Y-%m-%d", strtotime("$startdate +1 day"));

//echo "startdate = $startdate | nextdate = $nextdate";
//url to send request to (everything after alias/ in endpoint)
$selected_call = "reports/statuscodes.json/hourly?date_from=$startdate&date_to=$nextdate";

// the endpoint for your request
$endpoint = "https://rws.netdna.com/$alias/$selected_call"; //this endpoint will pull the account information for the provided alias

//parse endpoint before creating OAuth request
$parsed = parse_url($endpoint);
if(array_key_exists("parsed", $parsed))
{
    parse_str($parsed['query'], $params);
}


//generate a request from your consumer
$req_req = OAuthRequest::from_consumer_and_token($consumer, NULL, $method_type, $endpoint, $params);

//sign your OAuth request using hmac_sha1
$sig_method = new OAuthSignatureMethod_HMAC_SHA1();
$req_req->sign_request($sig_method, $consumer, NULL);

// create curl resource 
$ch = curl_init(); 
// set url 
curl_setopt($ch, CURLOPT_URL, $req_req); 
//return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER , FALSE);

// set curl custom request type if not standard
if ($method_type != "GET" && $method_type != "POST") {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method_type);
}

// not sure what this is doing
if ($method_type == "POST" || $method_type == "PUT" || $method_type == "DELETE") {
    $query_str = OAuthUtil::build_http_query($params);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Expect:', 'Content-Length: ' . strlen($query_str)));
    curl_setopt($ch, CURLOPT_POSTFIELDS,  $query_str);
}

//tell curl to grab headers
//curl_setopt($ch, CURLOPT_HEADER, true);

// $output contains the output string 
$json_output = curl_exec($ch);

// $headers contains the output headers
//$headers = curl_getinfo($ch);

// close curl resource to free up system resources 
curl_close($ch);

//convert json response into multi-demensional array
$output = json_decode($json_output,true);


$clear_query = "truncate table hourly";
mysql_query($clear_query); 
//var_dump($output);
foreach ($output[data][statuscodes] as $s)
{
	$status_code = $s[status_code];
	$hit = $s[hit];
	$definition = $s[definition];
	$timestamp = $s[timestamp];
	$hour = substr($s[timestamp],11);
//    echo "scode: $status_code | hit: $hit | $definition: $definition | timestamp: $timestamp| hour = $hour\n";
	//print_r($hitsperhour);
	
	$query = "INSERT INTO hourly (status_code,hit,definition,timestamp) VALUES 
('$status_code','$hit','$definition','$timestamp')";

    mysql_query($query);

}
//report1 - success vs erros
//A. success hits
$select_success="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '200' or status_code = '304'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//B. query for error hits
$select_error="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
    WHERE status_code IN (502,500,404,301,408,499,400,206,405,403,302,406,504)
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";



/**************************
//Part2 - Error hits breakdown
***************************/


//502
$select_502="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '502'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//500
$select_500="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '500'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

$select_404="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '404'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//301
$select_301="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '301'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//408
$select_408="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '408'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";


//499
$select_499="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '499'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//400
$select_400="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '400'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//206
$select_206="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '206'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//405
$select_405="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '405'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//302
$select_302="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '302'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//403
$select_403="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '403'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//406
$select_406="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '406'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

//504
$select_504="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '504'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
AS combined_table
GROUP BY tstamp
ORDER BY tstamp asc
";

/*
//array error codes = 
$array_errorcodes = array('304','502','500','404','301','408','499','400','206','405','302','403','406','504');

foreach ($array_errorcodes as $errorcode) {
	
	$select_errorcode="SELECT tstamp, hit FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code = '$errorcode'
    )
    UNION (SELECT 0 as HOUR, 0)
    UNION (SELECT 1 as HOUR, 0)
    UNION (SELECT 2 as HOUR, 0)
    UNION (SELECT 3 as HOUR, 0)
    UNION (SELECT 4 as HOUR, 0)
    UNION (SELECT 5 as HOUR, 0)
    UNION (SELECT 6 as HOUR, 0)
    UNION (SELECT 7 as HOUR, 0)
    UNION (SELECT 8 as HOUR, 0)
    UNION (SELECT 9 as HOUR, 0)
    UNION (SELECT 10 as HOUR, 0)
    UNION (SELECT 11 as HOUR, 0)
    UNION (SELECT 12 as HOUR, 0)
    UNION (SELECT 13 as HOUR, 0)
    UNION (SELECT 14 as HOUR, 0)
    UNION (SELECT 15 as HOUR, 0)
    UNION (SELECT 16 as HOUR, 0)
    UNION (SELECT 17 as HOUR, 0)
    UNION (SELECT 18 as HOUR, 0)
    UNION (SELECT 19 as HOUR, 0)
    UNION (SELECT 20 as HOUR, 0)
    UNION (SELECT 21 as HOUR, 0)
    UNION (SELECT 22 as HOUR, 0)
    UNION (SELECT 23 as HOUR, 0)
)
	AS combined_table
	GROUP BY tstamp
	ORDER BY tstamp asc
	";
	
	$result_errorcode=mysql_query($select_errorcode);
	while($row = mysql_fetch_array($result_errorcode)){
		array_push($array_successhits,$row['hit']);	
	}
	
}
*/

//array of success hiits
$array_successhits = array();
//array of error hits from hour 0 - 23
$array_errorhits = array();

//array of other error codes
$array_error304 = array();
$array_error502 = array();
$array_error500 = array();
$array_error404 = array();
$array_error301 = array();
$array_error408 = array();
$array_error499 = array();
$array_error400 = array();
$array_error206 = array();
$array_error405 = array();
$array_error302 = array();
$array_error403 = array();
$array_error406 = array();
$array_error504 = array();

//fetch success hits and push to corresponding array
$result_success=mysql_query($select_success);
while($row = mysql_fetch_array($result_success)){
	// echo $row['tstamp']. " - ". $row['hit'];
	// echo "\n";
	array_push($array_successhits,$row['hit']);
	
}


//fetch error hits and push to corresponding array
$result_error=mysql_query($select_error);
while($row = mysql_fetch_array($result_error)){
	// echo $row['tstamp']. " - ". $row['hit'];
	// echo "\n";
	array_push($array_errorhits,$row['hit']);	
}
//add label at beginning of error/success hits array
array_unshift($array_successhits,"Successful Hits (Status Code: 200 and 304)");
array_unshift($array_errorhits,"Error Hits");

//print_r($array_hits);

//fetch error 304 and push to corresponding array

$result_error502=mysql_query($select_502);
$result_error500=mysql_query($select_500);
$result_error404=mysql_query($select_404);
$result_error301=mysql_query($select_301);
$result_error408=mysql_query($select_408);
$result_error499=mysql_query($select_499);
$result_error400=mysql_query($select_400);
$result_error206=mysql_query($select_206);
$result_error405=mysql_query($select_405);
$result_error302=mysql_query($select_302);
$result_error403=mysql_query($select_403);
$result_error406=mysql_query($select_406);
$result_error504=mysql_query($select_504);


while($row = mysql_fetch_array($result_error502)){

	array_push($array_error502,$row['hit']);	
}

while($row = mysql_fetch_array($result_error500)){

	array_push($array_error500,$row['hit']);	
}

while($row = mysql_fetch_array($result_error404)){

	array_push($array_error404,$row['hit']);	
}
while($row = mysql_fetch_array($result_error301)){

	array_push($array_error408,$row['hit']);	
}
while($row = mysql_fetch_array($result_error499)){

	array_push($array_error499,$row['hit']);	
}
while($row = mysql_fetch_array($result_error400)){

	array_push($array_error400,$row['hit']);	
}
while($row = mysql_fetch_array($result_error206)){

	array_push($array_error206,$row['hit']);	
}

while($row = mysql_fetch_array($result_error405)){

	array_push($array_error405,$row['hit']);	
}

while($row = mysql_fetch_array($result_error302)){

	array_push($array_error302,$row['hit']);	
}

while($row = mysql_fetch_array($result_error403)){

	array_push($array_error403,$row['hit']);	
}
while($row = mysql_fetch_array($result_error406)){

	array_push($array_error406,$row['hit']);	
}
while($row = mysql_fetch_array($result_error504)){

	array_push($array_error504,$row['hit']);	
}


//add label to error series

array_unshift($array_error502,"502	Bad Gateway");
array_unshift($array_error500,"500	Internal Server Error");
array_unshift($array_error404,"404	Not Found");
array_unshift($array_error301,"301	Moved Permanently");
array_unshift($array_error408,"408	Request Timeout");
array_unshift($array_error499,"499	Client Unexpectedly Terminated Connection");
array_unshift($array_error400,"400	Bad Request");
array_unshift($array_error206,"206	Partial Content");
array_unshift($array_error405,"405	Method Not Allowed");
array_unshift($array_error302,"403	Forbidden");
array_unshift($array_error403,"302	Found");
array_unshift($array_error406,"406	Not Acceptable");
array_unshift($array_error504,"504	Gateway Timeout");






//generate csv file section

$array_header = array( 'hour','0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00');

//report1 contents
$array_header_csv = implode(",", $array_header);
$array_successhits_csv = implode(",", $array_successhits);
$array_errorhits_csv = implode(",", $array_errorhits);


//report2 contents

$array_error502_csv = implode(",", $array_error502);
$array_error500_csv = implode(",", $array_error500);
$array_error404_csv = implode(",", $array_error404);
$array_error301_csv = implode(",", $array_error301);
$array_error408_csv = implode(",", $array_error408);
$array_error499_csv = implode(",", $array_error499);
$array_error400_csv = implode(",", $array_error400);
$array_error206_csv = implode(",", $array_error206);
$array_error405_csv = implode(",", $array_error405);
$array_error302_csv = implode(",", $array_error302);
$array_error403_csv = implode(",", $array_error403);
$array_error406_csv = implode(",", $array_error406);
$array_error504_csv = implode(",", $array_error504);


$report1_content =  $array_header_csv."\n".$array_successhits_csv."\n".$array_errorhits_csv;
$report2_content = $array_header_csv ."\n".
			$array_error502_csv."\n". 
			$array_error500_csv."\n".
			$array_error404_csv."\n".
			$array_error301_csv."\n".
			$array_error408_csv."\n".
			$array_error499_csv."\n". 
			$array_error400_csv."\n". 
			$array_error206_csv."\n". 
			$array_error405_csv."\n". 
			$array_error302_csv."\n". 
			$array_error403_csv."\n". 
			$array_error406_csv."\n". 
			$array_error504_csv; 


$filename1 = 'report1.csv';
$filename2 = 'report2.csv';
file_put_contents($filename1, $report1_content);
file_put_contents($filename2, $report2_content);

// $array_report1 = array(
// 		$array_header,
// 		$array_successhits,
// 		$array_errorhits,
// 	);
// $filename = 'hourly1.csv';
// $fp = fopen($filename, 'w');
// 	
// foreach ($array_report1 as $fields) {
//     fputcsv($fp, $fields);
// }



//fclose($fp); // close file pointer 
//close db connection
mysql_close();

/*
$hitsperhour = array();
foreach ($output[data][statuscodes] as $key => $row)
{
	$hitsperhour[$key] = $row['timestamp'];	
    echo "hit: $hitsperhour[$key]\n ";
	//print_r($hitsperhour);
}
*/
  // sort alphabetically by timestamp
//usort($hitsperhour, 'compare_timestamp');
//array_multisort($hitsperhour, SORT_DESC, $output[data][statuscodes]);

//var_dump($hitsperhour);

if(array_key_exists("code",$output))
{
    //if successful response, grab data into elements array
    if($output['code'] == 200 || $output['code'] == 201)
    {
        $zones = $output['data'];
		

    }
    // else, spit out the error received
    else
    {
        echo "Error: " . $output['code'] . ":";
        $elements = $output['error'];
        foreach($elements as $key => $value)
        {
            echo "$key = $value";
        }
    }
}
else
{
    echo "No return code given";
}

?>

		<div id="container1" style="min-width: 400px; height: 400px; margin: 0 auto"></div><p>
		<div id="container2" style="min-width: 400px; height: 400px; margin: 0 auto"></div>
 


    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script src="http://current.bootstrapcdn.com/bootstrap-v204/js/bootstrap.min.js"></script>
   	<script src="js/highcharts.js"></script>
	<script src="js/highcharts-defaults.js"></script>
	<script src="js/highcharts-cachehits.js"></script>
			<!-- 2. Add the JavaScript to initialize the chart on document ready -->
		<script type="text/javascript">
		$(document).ready(function() {
			

			var options = {
				chart: {
					renderTo: 'container1',
					defaultSeriesType: 'area'
				},
				title: {
					text: 'Successful Vs. Error Requests (Hourly)'
				},
				xAxis: {
					categories: []
				},
				yAxis: {
					title: {
						text: 'No. of Requests'
					}
				},
				series: []
			};
			
			/*
			 Load the data from the CSV file. This is the contents of the file:
			 
				Apples,Pears,Oranges,Bananas,Plums
				John,8,4,6,5
				Jane,3,4,2,3
				Joe,86,76,79,77
				Janet,3,16,13,15
				
			 */ 
			$.get('report1.csv', function(data) {
				// Split the lines
				var lines = data.split('\n');
				$.each(lines, function(lineNo, line) {
					var items = line.split(',');
					
					// header line containes categories
					if (lineNo == 0) {
						$.each(items, function(itemNo, item) {
							if (itemNo > 0) options.xAxis.categories.push(item);
						});
					}
					
					// the rest of the lines contain data with their name in the first position
					else {
						var series = { 
							data: []
						};
						$.each(items, function(itemNo, item) {
							if (itemNo == 0) {
								series.name = item;
							} else {
								series.data.push(parseFloat(item));
							}
						});
						
						options.series.push(series);

					}
					
				});
				
				var chart = new Highcharts.Chart(options);
			});
			
			
		});
		</script>
		
     	<script type="text/javascript">
		$(document).ready(function() {
			

			var options = {
				chart: {
					renderTo: 'container2',
					defaultSeriesType: 'area'
				},
				title: {
					text: 'Hourly Error Status Breakdown'
				},
				xAxis: {
					categories: []
				},
				yAxis: {
					title: {
						text: 'No. of Requests'
					}
				},
				series: []
			};
			

			$.get('report2.csv', function(data) {
				// Split the lines
				var lines = data.split('\n');
				$.each(lines, function(lineNo, line) {
					var items = line.split(',');
					
					// header line containes categories
					if (lineNo == 0) {
						$.each(items, function(itemNo, item) {
							if (itemNo > 0) options.xAxis.categories.push(item);
						});
					}
					
					// the rest of the lines contain data with their name in the first position
					else {
						var series = { 
							data: []
						};
						$.each(items, function(itemNo, item) {
							if (itemNo == 0) {
								series.name = item;
							} else {
								series.data.push(parseFloat(item));
							}
						});
						
						options.series.push(series);

					}
					
				});
				
				var chart = new Highcharts.Chart(options);
			});
			
			
		});
		</script>
		

  </body>
</html>
