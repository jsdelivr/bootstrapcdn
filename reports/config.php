<?
//NetDNA OAuth API Parameters
//your app key and secret
$key    = "af77755fc8f0021d3e9f65345d37b7cb04fed6080";
$secret = "a623a28e3df9f7c453cdab023c06f183";
$alias  = "jdorfman";

/**
 * fetches last 24 hours status data 
 * @param string, comma-delimited status codes
 * @param label for series
 * @return string 
 */

//Database parameters
$username = "root";
$password = "root";
$hostname = "localhost"; 
$dbname = "netdna";
$tablename = "hourly";

//Connect to the DB
$conn = mysql_connect($host, $username, $password);
mysql_select_db($dbname, $conn);
if (!$conn) {
   die('Could not connect to database: '. mysql_errno() . mysql_error());
}