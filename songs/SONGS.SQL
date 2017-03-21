
DROP TABLE IF EXISTS `songs`;
CREATE TABLE `songs`(
`id` int,
`title` varchar(55),
`author` varchar(55),
`duration` int,
`genre` varchar(20),
`src` varchar(55),
PRIMARY KEY(`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;
 
-- ----------------------------
-- Records of continents
-- ----------------------------
INSERT INTO `songs` VALUES (1, 'Highway to Hell', 'ACDC', 284, 'Rock', 'highway.mp3');
INSERT INTO `songs` VALUES (2, 'Ordinary Love', 'U2', 218, 'Rock', 'ordinary.mp3');
INSERT INTO `songs` VALUES (3, 'Make War', 'From First to Last', 203, 'Rock', 'makewar.mp3');
INSERT INTO `songs` VALUES (4, 'Eu sei de cor', 'Marialia Mendonca', 189, 'Sertanejo', 'seidecor.mp3');

songs 