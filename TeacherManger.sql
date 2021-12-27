/*
 Navicat Premium Data Transfer

 Source Server         : Meow
 Source Server Type    : MySQL
 Source Server Version : 80021
 Source Host           : localhost:3306
 Source Schema         : TeacherManger

 Target Server Type    : MySQL
 Target Server Version : 80021
 File Encoding         : 65001

 Date: 27/12/2021 14:18:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `a_id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `a_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '用户名字',
  `login_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '登陆名',
  `a_pwd` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL COMMENT '密码',
  `desc` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT '' COMMENT '描述',
  `type` int NOT NULL DEFAULT '2' COMMENT '1管理员2教师',
  `t_id` int DEFAULT NULL COMMENT '教师ID',
  PRIMARY KEY (`a_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='管理员';

-- ----------------------------
-- Records of account
-- ----------------------------
BEGIN;
INSERT INTO `account` VALUES (1, '超级管理员', 'admin', '123456', '最牛逼的管理员', 1, NULL);
INSERT INTO `account` VALUES (2, '澈力木格', 'clmg', '123456', '是个老师', 2, 1);
INSERT INTO `account` VALUES (11, '123', '1', '1', '', 2, 123);
COMMIT;

-- ----------------------------
-- Table structure for classroom
-- ----------------------------
DROP TABLE IF EXISTS `classroom`;
CREATE TABLE `classroom` (
  `cr_id` int NOT NULL AUTO_INCREMENT,
  `cr_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '班级名字',
  `year` char(4) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '入学年份',
  `cr_number` int DEFAULT NULL COMMENT '班级人数',
  `m_id` int DEFAULT NULL COMMENT '专业ID',
  `ttp_id` int DEFAULT NULL COMMENT '培养方案ID',
  PRIMARY KEY (`cr_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='班级';

-- ----------------------------
-- Records of classroom
-- ----------------------------
BEGIN;
INSERT INTO `classroom` VALUES (1, '网络编程1', '2019', 30, 1, 1);
INSERT INTO `classroom` VALUES (2, '网络编程2', '2019', 30, 1, 1);
COMMIT;

-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `c_id` int NOT NULL AUTO_INCREMENT,
  `c_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '课程名字',
  `cc_id` int DEFAULT NULL COMMENT '课程类别',
  `c_no` int DEFAULT NULL COMMENT '课号',
  `ttp_id` int DEFAULT NULL COMMENT '培养方案ID',
  `m_id` int DEFAULT NULL COMMENT '专业ID',
  `credit` decimal(10,2) DEFAULT NULL COMMENT '学分',
  PRIMARY KEY (`c_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='课程';

-- ----------------------------
-- Records of course
-- ----------------------------
BEGIN;
INSERT INTO `course` VALUES (1, '思想道德修养与法律基础', 1, 3100016, 1, 1, 3.00);
INSERT INTO `course` VALUES (2, '民族理论与民族政策', 1, 3100017, 1, 1, 2.00);
INSERT INTO `course` VALUES (3, '外语1', 1, 0, 1, 1, 2.00);
INSERT INTO `course` VALUES (4, '心理健康教育', 1, 3300006, 1, 1, 2.00);
INSERT INTO `course` VALUES (5, '军事理论', 1, 3300001, 1, 1, 2.00);
INSERT INTO `course` VALUES (6, '军事训练', 1, NULL, 1, 1, 1.00);
INSERT INTO `course` VALUES (7, '大学体育（全部学期修够4次）', 1, NULL, 1, 1, 2.00);
INSERT INTO `course` VALUES (8, '高等数学（一）', 1, NULL, 1, 1, 4.00);
INSERT INTO `course` VALUES (9, 'C语言程序设计', 2, 1919101, 1, 1, 3.00);
INSERT INTO `course` VALUES (10, '形势与政策（8个学期全部开课）', 1, 3100009, 1, 1, 2.00);
INSERT INTO `course` VALUES (11, '中国近现代史纲要', 1, 3100015, 1, 1, 3.00);
INSERT INTO `course` VALUES (12, '外语2', 1, 0, 1, 1, 2.00);
INSERT INTO `course` VALUES (13, '高等数学（二）', 1, NULL, 1, 1, 4.00);
INSERT INTO `course` VALUES (14, '线性代数', 1, NULL, 1, 1, 3.00);
INSERT INTO `course` VALUES (15, '程序设计综合训练', 2, 1919102, 1, 1, 3.00);
INSERT INTO `course` VALUES (16, '马克思主义基本原理', 1, 3100013, 1, 1, 3.00);
INSERT INTO `course` VALUES (17, '毛泽东思想和中国特色社会主义理论体系概论', 1, 3100014, 1, 1, 5.00);
INSERT INTO `course` VALUES (18, '外语3', 1, 0, 1, 1, 2.00);
INSERT INTO `course` VALUES (19, '概率论与数理统计', 1, NULL, 1, 1, 3.00);
INSERT INTO `course` VALUES (20, '数据结构与算法', 2, 1919103, 1, 1, 4.00);
INSERT INTO `course` VALUES (21, '数据结构与算法实验', 2, 1919104, 1, 1, 1.00);
INSERT INTO `course` VALUES (22, '数据库系统应用', 2, 1919105, 1, 1, 2.00);
INSERT INTO `course` VALUES (23, '外语4', 1, 0, 1, 1, 2.00);
INSERT INTO `course` VALUES (24, '计算机组成原理', 2, 1919106, 1, 1, 4.00);
INSERT INTO `course` VALUES (25, '计算机组成原理实验', 2, 1919107, 1, 1, 1.00);
INSERT INTO `course` VALUES (26, '数据库系统原理', 2, 1919108, 1, 1, 2.00);
INSERT INTO `course` VALUES (27, '数据库系统原理实验', 2, 1919109, 1, 1, 1.00);
INSERT INTO `course` VALUES (28, '大学生就业指导', 1, 3300003, 1, 1, 1.00);
INSERT INTO `course` VALUES (29, '大学生创新创业指导', 1, 3300005, 1, 1, 1.00);
INSERT INTO `course` VALUES (30, '计算机网络', 2, 1919110, 1, 1, 4.00);
INSERT INTO `course` VALUES (31, '计算机网络实验', 2, 1919111, 1, 1, 1.00);
INSERT INTO `course` VALUES (32, '操作系统', 2, 1919112, 1, 1, 4.00);
INSERT INTO `course` VALUES (33, '操作系统实验', 2, 1919113, 1, 1, 1.00);
INSERT INTO `course` VALUES (34, '软件工程系列课问题', 2, NULL, 1, 1, NULL);
INSERT INTO `course` VALUES (35, '软件工程', 2, NULL, 1, 1, 2.00);
INSERT INTO `course` VALUES (36, '软件工程实验', 2, NULL, 1, 1, 1.00);
INSERT INTO `course` VALUES (37, '专业实习', 1, 1919115, 1, 1, 3.00);
INSERT INTO `course` VALUES (38, '毕业设计（论文）', 1, 1919117, 1, 1, 3.00);
INSERT INTO `course` VALUES (39, 'ICPC算法实战入门', 3, 1919119, 1, 1, 2.00);
INSERT INTO `course` VALUES (40, '专业导论（新生研讨课）', 3, 1919120, 1, 1, 2.00);
INSERT INTO `course` VALUES (41, '公共礼仪', 3, 1919121, 1, 1, 1.00);
INSERT INTO `course` VALUES (42, '音乐鉴赏', 3, 1919123, 1, 1, 1.00);
INSERT INTO `course` VALUES (43, '科技创新实践（一）', 3, 1919122, 1, 1, 2.00);
INSERT INTO `course` VALUES (44, '专业见习', 3, 1919114, 1, 1, 1.00);
INSERT INTO `course` VALUES (45, '计算机组装与维修', 3, 1919126, 1, 1, 1.00);
INSERT INTO `course` VALUES (46, 'ICPC算法实战提高', 3, 1919124, 1, 1, 2.00);
INSERT INTO `course` VALUES (47, '数字媒体艺术基础', 3, 1919125, 1, 1, 1.00);
INSERT INTO `course` VALUES (48, '摄影摄像通识', 3, 1919128, 1, 1, 1.00);
INSERT INTO `course` VALUES (49, '科技创新实践（二）', 3, 1919127, 1, 1, 2.00);
INSERT INTO `course` VALUES (50, '书法', 3, 1919129, 1, 1, 1.00);
INSERT INTO `course` VALUES (51, '机器人导论', 3, 1919130, 1, 1, 1.00);
INSERT INTO `course` VALUES (52, '人文历史通识', 3, 1919131, 1, 1, 2.00);
INSERT INTO `course` VALUES (53, '应用文写作基础', 3, 1919134, 1, 1, 2.00);
INSERT INTO `course` VALUES (54, '科技创新实践（三）', 3, 1919132, 1, 1, 2.00);
INSERT INTO `course` VALUES (55, '专业研习', 3, 1919133, 1, 1, 2.00);
INSERT INTO `course` VALUES (56, '离散数学', 4, 1919135, 1, 1, 3.00);
INSERT INTO `course` VALUES (57, '大学物理一', 4, NULL, 1, 1, NULL);
INSERT INTO `course` VALUES (58, '电路与电子技术', 4, 1919136, 1, 1, 3.00);
INSERT INTO `course` VALUES (59, '电路与电子技术实验', 4, 1919137, 1, 1, 1.00);
INSERT INTO `course` VALUES (60, 'Java程序设计初级', 4, NULL, 1, 1, 3.00);
INSERT INTO `course` VALUES (61, '大学物理二', 4, NULL, 1, 1, NULL);
INSERT INTO `course` VALUES (62, 'Java程序设计高级', 4, NULL, 1, 1, 3.00);
INSERT INTO `course` VALUES (63, 'java实训', 4, NULL, 1, 1, 2.00);
INSERT INTO `course` VALUES (64, 'JavaWeb程序设计', 4, 1919141, 1, 1, 3.00);
INSERT INTO `course` VALUES (65, 'Javaweb程序设计实验', 4, 1919142, 1, 1, 1.50);
INSERT INTO `course` VALUES (66, 'JavaWeb实训', 4, NULL, 1, 1, 1.00);
INSERT INTO `course` VALUES (67, '移动互联开发实践', 4, NULL, 1, 1, 2.00);
INSERT INTO `course` VALUES (68, 'WEB前端开发实践', 4, NULL, 1, 1, 2.00);
INSERT INTO `course` VALUES (69, '大数据开发技术', 4, NULL, 1, 1, 3.00);
INSERT INTO `course` VALUES (70, '大数据开发技术实验', 4, NULL, 1, 1, 1.00);
INSERT INTO `course` VALUES (71, '分布式编程技术', 4, NULL, 1, 1, 3.00);
INSERT INTO `course` VALUES (72, '分布式编程技术实验', 4, NULL, 1, 1, 1.00);
INSERT INTO `course` VALUES (73, '企业级开发技术', 4, NULL, 1, 1, 3.00);
INSERT INTO `course` VALUES (74, '企业级开发技术实验', 4, NULL, 1, 1, 1.00);
INSERT INTO `course` VALUES (75, '企业级开发技术实训', 4, NULL, 1, 1, 2.00);
INSERT INTO `course` VALUES (76, '专业综合实训（基地完成 7月开始-9月结束 10周左右）', 4, 1919143, 1, 1, 3.00);
INSERT INTO `course` VALUES (77, '工程数学进阶', 4, NULL, 1, 1, NULL);
COMMIT;

-- ----------------------------
-- Table structure for course_arrangement_plan
-- ----------------------------
DROP TABLE IF EXISTS `course_arrangement_plan`;
CREATE TABLE `course_arrangement_plan` (
  `cap_id` int NOT NULL AUTO_INCREMENT,
  `cap_title` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '排课计划名',
  `cap_term` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '学期',
  PRIMARY KEY (`cap_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='排课计划';

-- ----------------------------
-- Records of course_arrangement_plan
-- ----------------------------
BEGIN;
INSERT INTO `course_arrangement_plan` VALUES (1, '2019学年排课计划', '2019');
COMMIT;

-- ----------------------------
-- Table structure for course_cate
-- ----------------------------
DROP TABLE IF EXISTS `course_cate`;
CREATE TABLE `course_cate` (
  `cc_id` int NOT NULL AUTO_INCREMENT,
  `cc_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '类别名字',
  PRIMARY KEY (`cc_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='课程分类';

-- ----------------------------
-- Records of course_cate
-- ----------------------------
BEGIN;
INSERT INTO `course_cate` VALUES (1, '公共必修');
INSERT INTO `course_cate` VALUES (2, '专业必修');
INSERT INTO `course_cate` VALUES (3, '通识选修');
INSERT INTO `course_cate` VALUES (4, '专业选修');
COMMIT;

-- ----------------------------
-- Table structure for major
-- ----------------------------
DROP TABLE IF EXISTS `major`;
CREATE TABLE `major` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `m_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '专业名',
  PRIMARY KEY (`m_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='专业';

-- ----------------------------
-- Records of major
-- ----------------------------
BEGIN;
INSERT INTO `major` VALUES (1, '网络编程');
COMMIT;

-- ----------------------------
-- Table structure for plan_course_list
-- ----------------------------
DROP TABLE IF EXISTS `plan_course_list`;
CREATE TABLE `plan_course_list` (
  `pcl_id` int NOT NULL AUTO_INCREMENT,
  `c_id` int DEFAULT NULL COMMENT '课程ID',
  `cap_id` int DEFAULT NULL COMMENT '排课计划ID',
  `t_id` int DEFAULT '0' COMMENT '教师ID',
  `pcl_status` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '排课状态',
  `desc` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`pcl_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='排课课程表';

-- ----------------------------
-- Records of plan_course_list
-- ----------------------------
BEGIN;
INSERT INTO `plan_course_list` VALUES (1, 1, 1, 1, '1', '1号老师选择了1号课程，排课计划表是1');
INSERT INTO `plan_course_list` VALUES (2, 2, 1, 1, '1', NULL);
COMMIT;

-- ----------------------------
-- Table structure for talent_training_profram
-- ----------------------------
DROP TABLE IF EXISTS `talent_training_profram`;
CREATE TABLE `talent_training_profram` (
  `ttp_id` int NOT NULL AUTO_INCREMENT,
  `ttp_year` char(4) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '方案年份',
  `ttp_title` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '状态',
  `ggBiXiu_credit` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '公共必修学分',
  `zyBiXiu_credit` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '专业必修学分',
  `tsXuanXiu_credit` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '通识选修学分',
  `zyXuanXiu_credit` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '专业选修学分',
  PRIMARY KEY (`ttp_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='人才培养方案';

-- ----------------------------
-- Records of talent_training_profram
-- ----------------------------
BEGIN;
INSERT INTO `talent_training_profram` VALUES (1, '2019', '计算机科学与技术类专业2019版教学计划框架表（非师范、校企）', '49', '34', '26', '42');
INSERT INTO `talent_training_profram` VALUES (2, '2019', '123', '34', '67', '54', '45');
INSERT INTO `talent_training_profram` VALUES (3, '2021', 'gouli', '12', '33', '21', '44');
INSERT INTO `talent_training_profram` VALUES (5, '2020', 'asdf', '34', '12', '34', '33');
INSERT INTO `talent_training_profram` VALUES (6, '2021', '33333', '34', '435', '3453', '43535');
COMMIT;

-- ----------------------------
-- Table structure for teacher
-- ----------------------------
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher` (
  `t_id` int NOT NULL AUTO_INCREMENT,
  `t_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '教师名字',
  `t_no` int DEFAULT NULL COMMENT '教师工号',
  `desc` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL COMMENT '描述',
  PRIMARY KEY (`t_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC COMMENT='教师表';

-- ----------------------------
-- Records of teacher
-- ----------------------------
BEGIN;
INSERT INTO `teacher` VALUES (1, '澈力木格', 20104564, '1234567890');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
