<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Reports</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="Karlo Espiritu">

    <!-- Le styles -->
    <link href="http://current.bootstrapcdn.com/bootstrap-v204/css/bootstrap-combined.min.css" rel="stylesheet"> 
    <link href="css/datepicker.css" rel="stylesheet">
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
              <li class="active"><a href="errors.php?date=<?=gmdate("Y-m-d");?>">Hourly Errors</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>

 


<?php
//error_reporting(E_ALL);
require_once('config.php');
require_once("OAuth.php");


/**
 * generates last 24 hours labels 
 * @param none
 * @return string, last 24 hours string data 
 */
function generate_last24hourlabels() 
{
	$array_last24 = array();	
	$gmdatetime =  gmdate("Y-m-d H:00:00"); 
	
	$currenthour =  strtotime("$gmdatetime - 1 hours");
	$currenthour_formatted = strftime("%Y-%m-%d %H:00:00",$currenthour);	
	//get start time for last 24 hours
	$starttime = strtotime("$gmdate - 24 hours");
	
	for ($i=24; $i>=1; $i--)
	{
	   $gmthour = strtotime("$gmdatetime - $i hours");
	   $gmtcompareformat =  strftime("%Y-%m-%d %H:00:00",$gmthour);
	   if ($gmtcompareformat == $currenthour_formatted) {
			$gmtstringtime = strftime("<b>%b %d %H:00 (NOW)</b>",$gmthour);
	    } else {
			$gmtstringtime = strftime("%b %d %H:00",$gmthour);
		}
	   array_push($array_last24,$gmtstringtime);
	}
	
	array_unshift($array_last24,"Time");

    $xaxis = implode(",", $array_last24);
	return $array_last24;
}


/**
 * fetches last 24 hours status data 
 * @param string, comma-delimited status codes
 * @param label for series
 * @return string 
 */

function getlast24($status_codes,$label) {
	
	global $conn;
	$array_data = array();
	
	$array_last24 = array();
	$union_str = "";


	$gmdate =  gmdate("Y-m-d H:00:00"); 
	
	//get start time for last 24 hours
   $starttime = strtotime("$gmdate - 24 hours");
   $strstarttime = strftime("%Y-%m-%d %H:00:00",$starttime);
	
	for ($i=24; $i>=1; $i--)
	{
	   $gmthour = strtotime("$gmdate - $i hours");
	   $gmtstringtime = strftime("%Y-%m-%d %H:00:00",$gmthour);
	   array_push($array_last24,$gmtstringtime);
	   $union_str .= "UNION (SELECT '$gmtstringtime' as HOUR, 0)\n";
	}	
	
	$select = "SELECT tstamp, sum(hit) as hits FROM (
	(
        SELECT TIMESTAMP as tstamp, hit
        FROM hourly
        WHERE status_code IN ($status_codes)
		AND TIMESTAMP >= '$strstarttime'
    )
	$union_str	
	)
	AS combined_table
	GROUP BY tstamp
	ORDER BY tstamp asc
	";


	$result=mysql_query($select,$conn);
	
	while($row = mysql_fetch_array($result)) {
		array_push($array_data,$row['hits']);	
	}	
    //place series label at beginning
	array_unshift($array_data,$label);

    $output = implode(",", $array_data);
    
    return $output;
	
}


/**
 * fetches hourly error data 
 * @param string, date selected 
 * @param string, comma-delimited status codes
 * @param label for series
 * @return string 
 */

function gethourly($selected_date,$status_codes,$label) 
{
	global $conn;
	$array_data = array();
	
	$select = "SELECT tstamp, sum(hit) as hits FROM (
	(
        SELECT hour(TIMESTAMP) as tstamp, hit
        FROM hourly
        WHERE status_code IN ($status_codes)
		AND DATE(TIMESTAMP) = '$selected_date'
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
	 
	
	//fetch success hits and push to corresponding array
	$result=mysql_query($select,$conn);
	
	while($row = mysql_fetch_array($result)) {
		array_push($array_data,$row['hits']);	
	}	
    //place series label
	array_unshift($array_data,$label);

    $output = implode(",", $array_data);
    
    return $output;
}

//GMT current time
$gmtdate =  gmdate("Y-m-d"); 


/*
 * NetDNA API OAuth Code - PHP
 * Version 1.0a
 * Succeeding code is based on on:
 * https://raw.github.com/gist/2791330/64b7007ab9d4d4cbb77efd107bb45e16fc6c8cdf/OAuth.php
 */

// create an OAuth consumer with your key and secret
$consumer = new OAuthConsumer($key, $secret, NULL);

// method type: GET, POST, etc
$method_type   = "GET";

$selected_date = $_REQUEST[date];

if (empty($selected_date)) {
	$selected_date = $gmtdate;
}

if ($selected_date == $gmtdate) {
//display last 24 hours
    $date_from = strftime("%Y-%m-%d", strtotime("$gmtdate -24 hours"));
	$date_to = strftime("%Y-%m-%d", strtotime("$gmtdate +1 day"));
} else {
	//display selected date as span of 24 hours	
    $date_from = $selected_date;
	$date_to = strftime("%Y-%m-%d", strtotime("$selected_date +1 day"));
}

//echo "startdate = $startdate | nextdate = $nextdate";
//url to send request to (everything after alias/ in endpoint)
$selected_call = "reports/statuscodes.json/hourly?date_from=$date_from&date_to=$date_to";

//echo "<h3>selected_call =  $selected_call</h3>";
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


//after fetching JSON reponse, Populate hourly table;
$clear_query = "TRUNCATE table $tablename";
mysql_query($clear_query); 

//var_dump($output);
foreach ($output[data][statuscodes] as $s)
{
	$status_code = $s[status_code];
	$hit = $s[hit];
	$definition = $s[definition];
	$timestamp = $s[timestamp];
	$hour = substr($s[timestamp],11);
	
	//insert to hourly table of MySQL database
	$query = "INSERT INTO hourly (status_code,hit,definition,timestamp) VALUES 
('$status_code','$hit','$definition','$timestamp')";

    mysql_query($query);

}

//close db connection
mysql_close();

//generate csv for series (last 24 hr)
if ($selected_date == $gmtdate) {

	$successhits_csv = getlast24("200,304","Successful Hits (Status Code: 200 and 304)");
	$errorhits_csv = getlast24("502,500,404,301,408,499,400,206,405,403,302,406,504","Error Hits");
	$error502_csv = getlast24("502","502 Bad Gateway");
	$error500_csv = getlast24("500","500 Internal Server Error");
	$error404_csv = getlast24("404","404 Not Found");
	$error301_csv = getlast24("301","301 Moved Permanently");
	$error408_csv = getlast24("408","408 Request Timeout");
	$error499_csv = getlast24("499","499 Client Unexpectedly Terminated Connection");
	$error400_csv = getlast24("400","400 Bad Request");
	$error206_csv = getlast24("206","206 Partial Content");
	$error405_csv = getlast24("405","405 Method Not Allowed");
	$error302_csv = getlast24("403","403 Forbidden");
	$error403_csv = getlast24("302","302 Found");
	$error406_csv = getlast24("406","406 Not Acceptable");
	$error504_csv = getlast24("504","504 Gateway Timeout");
	//generate x-axis labels for last 24 hours
	$array_header = generate_last24hourlabels();
} else {
	//generate csv file for 24 hour period of specific date
	$successhits_csv = gethourly("$selected_date","200,304","Successful Hits (Status Code: 200 and 304)");
	$errorhits_csv = gethourly("$selected_date","502,500,404,301,408,499,400,206,405,403,302,406,504","Error Hits");
	$error502_csv = gethourly("$selected_date","502","502 Bad Gateway");
	$error500_csv = gethourly("$selected_date","500","500 Internal Server Error");
	$error404_csv = gethourly("$selected_date","404","404 Not Found");
	$error301_csv = gethourly("$selected_date","301","301 Moved Permanently");
	$error408_csv = gethourly("$selected_date","408","408 Request Timeout");
	$error499_csv = gethourly("$selected_date","499","499 Client Unexpectedly Terminated Connection");
	$error400_csv = gethourly("$selected_date","400","400 Bad Request");
	$error206_csv = gethourly("$selected_date","206","206 Partial Content");
	$error405_csv = gethourly("$selected_date","405","405 Method Not Allowed");
	$error302_csv = gethourly("$selected_date","403","403 Forbidden");
	$error403_csv = gethourly("$selected_date","302","302 Found");
	$error406_csv = gethourly("$selected_date","406","406 Not Acceptable");
	$error504_csv = gethourly("$selected_date","504","504 Gateway Timeout");
	
	//generate x-axis labels for last 24 hours
	$array_header = array( 'hour','0:00','1:00','2:00','3:00','4:00','5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00');

}


//convert x-axis labels to CSV format
$array_header_csv = implode(",", $array_header);

//success vs errors contents
$report1_content =  $array_header_csv."\n".$successhits_csv."\n".$errorhits_csv;

//error status breakdown csv contents
$report2_content = $array_header_csv ."\n".
			$error502_csv."\n". 
			$error500_csv."\n".
			$error404_csv."\n".
			$error301_csv."\n".
			$error408_csv."\n".
			$error499_csv."\n". 
			$error400_csv."\n". 
			$error206_csv."\n". 
			$error405_csv."\n". 
			$error302_csv."\n". 
			$error403_csv."\n". 
			$error406_csv."\n". 
			$error504_csv; 

//csv path, make sure this directory is writable by your web server
$filename1 = 'data/report1.csv';
$filename2 = 'data/report2.csv';

//write generated CSV to file
file_put_contents($filename1, $report1_content);
file_put_contents($filename2, $report2_content);

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
     <div class="container">

      <h2>Hourly Status Breakdown <?$date = ($_REQUEST[date]!='') ? $_REQUEST[date]:gmdate("Y-m-d"); $formatted_date = strftime("%b %d, %Y",strtotime($date));echo "($formatted_date GMT)";?></h2>
      <p>Total Successful and Error requests per hour</p>
		<form name="generaterport" action="errors.php" method="GET">
        <div align="center" class="well">
			  <div class="input-append date" id="dp1" data-date="<?$date = ($_REQUEST[date]!='') ? $_REQUEST[date]:gmdate("Y-m-d"); echo $date;?>" data-date-format="dd-mm-yyyy">
				<input class="span2" size="16" type="text" name="date" value="<?$date = ($_REQUEST[date]!='') ? $_REQUEST[date]:gmdate("Y-m-d"); echo $date;?>" readonly>
				<span class="add-on"><i class="icon-calendar"></i></span>
				<button class="btn btn-primary" href="#">Show</button></span>
			  </div>
          </div>
		</form>
		<div id="container1" style="min-width: 400px; height: 400px; margin: 0 auto"></div><p>
		<div id="container2" style="min-width: 400px; height: 400px; margin: 0 auto"></div>
    <hr> 
	<footer class="footer">
	   <p class="pull-left">&copy; NetDNA 2012</p>
	   <p class="pull-right"><a href="#">Back to top</a></p>
	</footer>
    </div> <!--end container-->
    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script src="http://current.bootstrapcdn.com/bootstrap-v204/js/bootstrap.min.js"></script>
   	<script src="js/bootstrap-datepicker.js"></script>
    <script src="js/highcharts.js"></script>
	<script type="text/javascript">
			$(function(){
				//window.prettyPrint && prettyPrint();
				$('#dp1').datepicker({
						format: 'yyyy-mm-dd'
					});
			});	
	</script>	
			<!-- 2. Add the JavaScript to initialize the chart on document ready -->
		<script type="text/javascript">
		$(document).ready(function() {
			

			var options = {
				credits: {
					enabled: false
				},	
							
				chart: {
					renderTo: 'container1',
					type: 'area',
				},
				title: {
					text: 'Successful Vs. Error Requests (Hourly)'
				},
				xAxis: {
					categories: [],
					labels: {
                        rotation: -45,
                        align: 'right',
                     }
				},
				yAxis: {
					title: {
						text: 'No. of Requests'
					}
				},
	            plotOptions: {
	                area: {
	                    marker: {
	                        enabled: true,
	                        symbol: 'circle',
	                        radius: 3,
	                        states: {
	                            hover: {
	                                enabled: true
	                            }
	                        }
	                    }
	                }
	            },
				series: []
			};
			
			/*
			 Load the data from the CSV file. This is the contents of the file:
			 
					hour,0:00,1:00,2:00,3:00,4:00,5:00,6:00,7:00,8:00,9:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00,18:00,19:00,20:00,21:00,22:00,23:00
					Successful Hits (Status Code: 200 and 304),924,2362,4268,3553,2962,2925,3141,3491,3497,3561,3406,2468,3,0,0,0,0,0,0,0,0,0,0,0
					Error Hits,3,14,15,6,5,9,4,7,4,2,3,1,0,0,0,0,0,0,0,0,0,0,0,0
				
			 */ 
			$.get('data/report1.csv', function(data) {
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
				credits: {
					enabled: false
				},
				chart: {
					renderTo: 'container2',
					defaultSeriesType: 'areaspline'
				},
				title: {
					text: 'Hourly Error Status Breakdown'
				},
				xAxis: {
					categories: [],
					labels: {
                        rotation: -45,
                        align: 'right',
                     }
				},
				yAxis: {
					title: {
						text: 'No. of Requests'
					}
				},
				plotOptions: {
	                area: {
	                    marker: {
	                        enabled: true,
	                        symbol: 'circle',
	                        radius: 3,
	                        states: {
	                            hover: {
	                                enabled: true
	                            }
	                        }
	                    }
	                }
	            },
				series: []
			};
			

			$.get('data/report2.csv', function(data) {
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
