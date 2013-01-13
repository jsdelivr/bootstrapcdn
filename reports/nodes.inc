    <!-- <div class="container"> -->

 <!-- 
    <h2>Location Overview</h2>
    <p>Total requests and bandwidth by map location </p>
	<table class="table table-striped">
		  <tr>
			<td>
				<h3>United States</h3>
				<div id="chart_div1" style="width: 390px; height: 400px;"></div>

			</td>
			<td>
				<h3>Europe</h3>
				<div id="chart_div2" style="width: 390px; height: 400px;"></div>

			</td>	
		  </tr>
	</table>-->		
<div class="row-fluid">
  <div class="span11">
    <h2>Location Overview</h2>
    <p>Total requests and bandwidth by map location </p>

      <div class="span6">
				<h3>United States</h3>
				<div id="chart_div1" style="width: 410px; height: 400px;"></div>	
	 </div>

       <div class="span5">
				<h3>Europe</h3>
				<div id="chart_div2" style="width: 410px; height: 400px;"></div>

	  </div>

  </div>
</div>
    <p> 
    <h2>Nodes Breakdown Overview</h2>
    <p>Total requests and bandwidth by location </p>
	<table class="table table-striped">
        <thead>
          <tr>
            <th>Location</th>
            <th>Hits (Requests)</th>
            <th> </th>
            <th>Bandwidth</th>
			<th> </th>
          </tr>
        </thead>
        <tbody>

<?php
//error_reporting(E_ALL);
require_once('config.php');
require_once("OAuth.php");

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

//url to send request to (everything after alias/ in endpoint)
$selected_call = "reports/nodes.json/stats";

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
$json_o = json_decode($json_output);

// dump the result
//  var_dump($json_output);

//define array for geochart
$eu_cities = array('Amsterdam','London');

//define array for US and Europe cities
$us_data = array();
$eu_data = array();


if(array_key_exists("code",$json_o))
{
    //if successful response, grab data into elements array
    if($json_o->code == 200 || $json_o->code == 201)
    {
        $zones = $json_o->data;
		//echo $output->data->total;
		
		$array_bytestransferred = array();
		$array_requests = array();

		$highest_hit = $json_o->data->stats[0]->hit;
		$highest_size = ($json_o->data->stats[0]->size); ///1073741824;
		$highest_size_rounded = round($highest_size,2);

		foreach ( $json_o->data->stats as $f)
		{
			array_push($array_bytestransferred,$f->size);
			array_push($array_requests,$f->hit);
		}	
		//print_r($array_bytestransferred);
		$max_filetransfer = max($array_bytestransferred);
		$total_filetransfer = array_sum($array_bytestransferred);
		$total_filetransfer = round(($total_filetransfer/1073741824),2);
		$total_requests = number_format(array_sum($array_requests));
		//echo "maxfile_transferred_value: $max_filetransfer<p>";

		foreach ( $json_o->data->stats as $d)
		{
			
		//	$hit_rate = ((($d->hit)/$highest_hit) * 100);
		    $hit_formatted = number_format($d->hit);
			$hit_percentage = round(((($d->hit)/$highest_hit) * 100),2);
			$bandwidth_size = round(($d->size/1073741824),2);
			$bandwidth_percentage = round(((($d->size)/$max_filetransfer) * 100),2);	
			
			//check if data is a europe city
			if (in_array($d->pop_description, $eu_cities)) {
				array_push($eu_data,array($d->pop_description,$d->hit,$bandwidth_size,));
			} else {	
			//else add to US data array											
				array_push($us_data,array($d->pop_description,$d->hit,$bandwidth_size,));
			}
			
			echo "<tr>
            <td>
				$d->pop_description
			</td>";
            echo "<td>";
			echo "<div class=\"progress\">";
	  		echo  "<div class=\"bar\" style=\"width: $hit_percentage%;\"></div>";
			echo  "</div>";			
			echo  "</td>";
            echo "<td>$hit_formatted Requests </td>";
            echo "<td>";
			echo "<div class=\"progress\">";
	  		echo  "<div class=\"bar\" style=\"width: $bandwidth_percentage%;\"></div>";
			echo  "</div>";	
			echo "</td>";
			echo "<td>$bandwidth_size GB</td>";
			
            echo "</tr>";
			echo "<tr>";
			
		   // echo "uri: $d->uri | hit: $d->hit Requests  | percentage: $hit_percentage | | size: $d->size | fsize_percentage: $bandwidth_percentage | bandwidth: $bandwidth_size GB<p>";
		}
			echo "<td><strong>Total</strong></td><td></td><td><strong>$total_requests Requests</strong></td><td></td><td><strong>$total_filetransfer GB</strong></td>";
    }
	
    // else, spit out the error received
    else
    {
        echo "Error: " . $json_o->code . ":";
        $elements = $json_o->error;
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

// print_r($us_data);
// print_r($eu_data);
?>




        </tbody>
      </table>
    <script type='text/javascript' src='https://www.google.com/jsapi'></script>
    <script type='text/javascript'>
	//US data	
     google.load('visualization', '1', {'packages': ['geochart']});
     google.setOnLoadCallback(drawMarkersMap);

      function drawMarkersMap() {
      var data = google.visualization.arrayToDataTable([
		  ['City',   'Requests', 'Bandwidth(GB)'],
		<?
			foreach ( $us_data as $d)	{
				echo "['$d[0]',$d[1],$d[2]"."],\n";
			}	
		?>

      ]);

      var formatter_req = new google.visualization.NumberFormat({fractionDigits: 0});
      var formatter_bw = new google.visualization.NumberFormat({fractionDigits: 2});
      formatter_req.format(data, 1); // Apply formatter to second column
      formatter_bw.format(data, 2); // Apply formatter to 3rd column

      var options = {
	    showZoomOut: true,
		colorAxis: {colors:['red','#004411']},
        region: 'US',
        displayMode: 'markers',
		enableRegionInteractivity: true,
		resolution:'metros',
		legend: {textStyle: {color: 'grey', fontSize: 8, numberFormat:'.##'}},
		magnifyingGlass:{enable: true, zoomFactor: 7.5},
		markerOpacity:0.65,
		sizeAxis:{minValue: 1,  maxSize: 20},
		tooltip:  {textStyle: {color: '#AA0000'}, showColorCode: true},
        colorAxis: {colors: ['orange', 'red']},
		backgroundColor: '#F9F9F9',
		width:'410px',
		height:'400px'


      };

      var chart = new google.visualization.GeoChart(document.getElementById('chart_div1'));
      chart.draw(data, options);
    };
    </script>

    <script type='text/javascript'>
    //Europe
     google.load('visualization', '1', {'packages': ['geochart']});
     google.setOnLoadCallback(drawMarkersMap);

      function drawMarkersMap() {
      var data = google.visualization.arrayToDataTable([
        ['City',   'Requests', 'Bandwidth(GB)'],
		<?
			foreach ( $eu_data as $d)	{
				echo "['$d[0]',$d[1],$d[2]"."],\n";
			}	
		?>

      ]);

      var formatter_req = new google.visualization.NumberFormat({fractionDigits: 0});
      var formatter_bw = new google.visualization.NumberFormat({fractionDigits: 2});
      formatter_req.format(data, 1); // Apply formatter to second column
      formatter_bw.format(data, 2); // Apply formatter to 3rd column

      var options = {
	    showZoomOut: true,
        region: 155,
        displayMode: 'markers',
		enableRegionInteractivity: true,
		resolution:'countries',
		legend: {textStyle: {color: 'grey', fontSize: 8}},
		magnifyingGlass:{enable: true, zoomFactor: 7.5},
		markerOpacity:0.65,
		sizeAxis:{minValue: 1,  maxSize: 20},
		tooltip:  {textStyle: {color: '#AA0000'}, showColorCode: true},
        colorAxis: {colors: ['orange', 'red']},
		backgroundColor: '#F9F9F9',
		width:'410px',
		height:'400px'
      };

      var chart = new google.visualization.GeoChart(document.getElementById('chart_div2'));
      chart.draw(data, options);
    };
    </script>
