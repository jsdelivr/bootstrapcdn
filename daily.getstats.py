#http://developer.netdna.com
 
# Thanks to @sajal from TurboBytes.com for getting this script started
# Contributed: @jdorfman
 
import oauth.oauth as oauth
import httplib2, json
import datetime
import pprint
 
class NetDNAREST():
   def __init__(self, key, secret, alias, server="rws.netdna.com"):
       self.alias = alias
       self.server = server
       self.token = None
       self.http = httplib2.Http()
       self.signature_method_hmac_sha1 = oauth.OAuthSignatureMethod_HMAC_SHA1()
       self.consumer = oauth.OAuthConsumer(key, secret)
 
   def request(self, method, endpoint, params=None):
       oauth_request = oauth.OAuthRequest.from_consumer_and_token(self.consumer, token=self.token, http_url=endpoint, http_method=method, parameters=params)
       oauth_request.sign_request(self.signature_method_hmac_sha1, self.consumer, self.token)
       r, c = self.http.request(oauth_request.to_url(), method=oauth_request.http_method,body=None, headers=oauth_request.to_header())
       if r["status"] != "200":
           raise Exception(r["status"], r, c)
       return json.loads(c)

   def get(self, uri):
       endpoint = "https://%s/%s%s" %(self.server, self.alias, uri)
#       print "\n"
#       print endpoint
       return self.request("GET", endpoint)
 
   def get_zone_stats(self, zoneid, reporttype, fromdate, todate):
       return api.get("/reports/%s/stats.json/%s?date_from=%s&date_to=%s" %(zoneid, reporttype, fromdate, todate))
       output = {"cache_hit": 0, "noncache_hit": 0, "hit": 0, "size": 0}
       for stat in ds["data"]["stats"]:
              output["cache_hit"] += int(stat["cache_hit"])
              output["noncache_hit"] += int(stat["noncache_hit"])
              output["hit"] += int(stat["hit"])
              output["size"] += int(stat["size"])
       return output
       return None
   
if __name__ in "__main__":
   api = NetDNAREST("fbe242bcaf4c95ed39a56daf9035e1b104fdf7022", "e1429ab0873d0f13b624d76a723fcbd4", "jdorfman")
   

   getdate = datetime.date.today()
   thirty = datetime.timedelta(days=10)
   last_month = getdate - thirty
   print json.dumps(api.get_zone_stats(44703, "daily", str(last_month), str(getdate)))
