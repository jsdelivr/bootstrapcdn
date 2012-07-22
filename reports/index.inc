    <div class="container">
		<div class="span11">
      <h2>   Popular Files Overview</h2>
      <p>    Total requests per file and total bandwith of popular files</p>
	
	
		      <table class="table table-striped">
        <thead>
          <tr>
			<th></th>
            <th>URI</th>
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
$selected_call = "reports/popularfiles.json";

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


//array of filetypes with icons
$filetypes = array('txt','ico','json','acc','ai','aif','app','atom','avi','bmp','cdr','css','doc','docx','eps','exe','fla','flv','gif','gzip','html','indd','jpg','js','keynote','mov','mp3','mp4','numbers','otf','pages','pdf','php','png','ppt','pptx','psd','rar','raw','rss','rtf','sql','svg','swf','tar','tiff','ttf','wav','wmv','xls','xlsx','xml','zip');


if(array_key_exists("code",$json_o))
{
    //if successful response, grab data into elements array
    if($json_o->code == 200 || $json_o->code == 201)
    {
        $zones = $json_o->data;
		//echo $output->data->total;
		
		$array_bytestransferred = array();
		//print_r($json_output);
		//first row
		$highest_hit = $json_o->data->popularfiles[0]->hit;
		$highest_size = ($json_o->data->popularfiles[0]->size); ///1073741824;
		$highest_size_rounded = round($highest_size,2);
		//echo "first row hit val: $highest_hit Requests | highest_size: $highest_size_rounded GB<p>";

		foreach ( $json_o->data->popularfiles as $f)
		{
			array_push($array_bytestransferred,$f->size);
		}	
		//print_r($array_bytestransferred);
		$max_filetransfer = max($array_bytestransferred);

		foreach ( $json_o->data->popularfiles as $d)
		{
	
		    $hit_formatted = number_format($d->hit);
			$hit_percentage = round(((($d->hit)/$highest_hit) * 100),2);
			$bandwidth_size = round(($d->size/1073741824),2);
			$bandwidth_percentage = round(((($d->size)/$max_filetransfer) * 100),2);	
			
			echo "<tr><td>";
				//$filetype = substr($d->uri,-3);
				$ext = pathinfo($d->uri, PATHINFO_EXTENSION);
				
				if (in_array($ext, $filetypes)) {
				    echo "<img src=\"reports/images/$ext.png\" alt=\"$ext\" height=\"30\" width=\"30\"/>";
				}
	
			echo "</td>";
	        echo "<td>
					$d->uri
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
			

		}
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
?>


        </tbody>
      </table>

</div>
</div>
    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/highcharts.js"></script>
	<script src="js/highcharts-defaults.js"></script>
	<script src="js/highcharts-cachehits.js"></script>




