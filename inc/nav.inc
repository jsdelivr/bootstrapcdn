	<?php include "cachebuster.php" ?>

	<div class="navbar navbar-inverse navbar-fixed-top">
	      <div class="navbar-inner">
	        <div class="container">
	          <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
	            <span class="icon-bar"></span>
	            <span class="icon-bar"></span>
	            <span class="icon-bar"></span>
	          </button>
	          <div class="nav-collapse collapse">
	            <ul class="nav">
	              <li class="active">
	                <a href="./index.html"><strong>BootstrapCDN</strong></a>
	              </li>
					<li><a href="index.html?v=<?php echo $version ?>">Home</a></li>
					<li><a href="https://github.com/netdna/bootstrap-cdn/issues" target="_blank">Issues <i class="icon-white icon-share-alt"></i></a></li>
					<li class="dropdown" id="menu1"><a class="dropdown-toggle" data-toggle="dropdown" href="#menu1">Reports<b class="caret"></b></a>
						<ul class="dropdown-menu">
							<li><a href="uptime.html?v=<?php echo $version ?>"><i class="icon-ok-sign"></i> Uptime</a></li>
							<li><a href="stats.html?v=<?php echo $version ?>"><i class="icon-tasks"></i> Stats/Charts</a></li>
							<li><a href="security/index.php?v=<?php echo $version ?>"><i class="icon-lock"></i> Security</a></li>
							<!---
							<li class="divider"></li>
								<li class="dropdown-submenu">
									<a tabindex="-1" href="pulse.html?v=<!?php echo $version ?>"><i class="icon-heart"></i> PULSE</a>
									<ul class="dropdown-menu">
										<li><a href="http://pulse.bootstrapcdn.com/day" target="_blank">Day</a></li>
										<li><a href="http://pulse.bootstrapcdn.com/week" target="_blank">Week</a></li>
										<li><a href="http://pulse.bootstrapcdn.com/month" target="_blank">Month</a></li>
										<li class="divider"></li>
										<li><a href="http://pulse.bootstrapcdn.com/ga" target="_blank">Pageviews</a></li>
									</ul>
								</li>
							</li>
							-->
						</ul>
					</li>
					<li><a href="http://blog.netdna.com/category/opensource/bootstrapcdn/" target="_blank">Blog <i class="icon-white icon-share-alt"></i></a></li>				
				  <li><a href="http://eepurl.com/nYBcv" target="_blank">Newsletter <i class="icon-white icon-envelope"></i></a></li>
	            </ul>
	          </div>
	        </div>
	      </div>
	    </div>