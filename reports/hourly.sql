--
-- Table structure for table `hourly`
--

CREATE TABLE IF NOT EXISTS `hourly` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status_code` smallint(4) NOT NULL,
  `hit` int(19) NOT NULL,
  `definition` varchar(200) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM;
