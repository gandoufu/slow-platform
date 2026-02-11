-- 接口自动化测试平台 数据库建表脚本（V1）
-- 说明：
-- 1. 默认使用 MySQL 5.7+（支持 JSON）
-- 2. 所有时间字段使用 DATETIME，默认 CURRENT_TIMESTAMP
-- 3. 如不希望使用外键约束，可手动删除 CONSTRAINT ... FOREIGN KEY 部分

CREATE DATABASE IF NOT EXISTS `slow_platform`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `slow_platform`;

-- ===============================
-- 2.1 用户与权限
-- ===============================

CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `username` VARCHAR(64) NOT NULL COMMENT '用户登录名，系统内唯一标识',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希值，不存储明文密码',
  `display_name` VARCHAR(64) NOT NULL COMMENT '用户显示名称（昵称或真实姓名）',
  `role` VARCHAR(32) NOT NULL COMMENT '用户角色：ADMIN/TESTER',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用用户，1 启用，0 禁用',
  `email` VARCHAR(128) DEFAULT NULL COMMENT '用户邮箱（可选）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最近更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';

-- ===============================
-- 2.2 项目与环境
-- ===============================

CREATE TABLE IF NOT EXISTS `project` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `name` VARCHAR(128) NOT NULL COMMENT '项目名称',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '项目描述',
  `owner_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '项目负责人用户 ID，关联 user.id',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用项目，1 启用，0 停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_project_name` (`name`),
  KEY `idx_project_owner_id` (`owner_id`),
  CONSTRAINT `fk_project_owner` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='项目表';

CREATE TABLE IF NOT EXISTS `environment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目 ID，关联 project.id',
  `name` VARCHAR(64) NOT NULL COMMENT '环境名称，例如 开发环境、测试环境',
  `code` VARCHAR(64) NOT NULL COMMENT '环境标识，例如 dev/test，在项目内唯一',
  `base_url` VARCHAR(255) NOT NULL COMMENT '基础 URL，例如 https://api-dev.example.com',
  `headers` JSON DEFAULT NULL COMMENT '环境公共 Header JSON，如 {"Authorization":"xxx"}',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '环境描述信息',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为项目默认环境，1 是，0 否',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_env_project_code` (`project_id`, `code`),
  KEY `idx_env_project_id` (`project_id`),
  CONSTRAINT `fk_env_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='环境表（含公共 Header）';

-- ===============================
-- 2.3 接口与单接口用例
-- ===============================

CREATE TABLE IF NOT EXISTS `api` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目 ID，关联 project.id',
  `module_name` VARCHAR(128) DEFAULT NULL COMMENT '接口所属模块/分组名称',
  `name` VARCHAR(128) NOT NULL COMMENT '接口名称',
  `method` VARCHAR(16) NOT NULL COMMENT 'HTTP 方法，例如 GET/POST',
  `url_path` VARCHAR(255) NOT NULL COMMENT '接口路径，支持路径变量',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '接口描述',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用接口，1 启用，0 停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_api_project` (`project_id`),
  KEY `idx_api_project_module` (`project_id`, `module_name`),
  KEY `idx_api_url` (`url_path`),
  CONSTRAINT `fk_api_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='接口定义表';

CREATE TABLE IF NOT EXISTS `api_request_template` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `api_id` BIGINT UNSIGNED NOT NULL COMMENT '所属接口 ID，关联 api.id',
  `path_params` JSON DEFAULT NULL COMMENT '默认 Path 参数 JSON',
  `query_params` JSON DEFAULT NULL COMMENT '默认 Query 参数 JSON',
  `headers` JSON DEFAULT NULL COMMENT '默认请求 Header JSON',
  `body` JSON DEFAULT NULL COMMENT '默认请求体 JSON',
  `body_type` VARCHAR(32) NOT NULL DEFAULT 'JSON' COMMENT '请求体类型：JSON/FORM/X_WWW_FORM_URLENCODED/RAW',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_api_req_template_api_id` (`api_id`),
  CONSTRAINT `fk_api_req_template_api` FOREIGN KEY (`api_id`) REFERENCES `api` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='接口默认请求配置表';

CREATE TABLE IF NOT EXISTS `api_test_case` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目 ID，关联 project.id',
  `api_id` BIGINT UNSIGNED NOT NULL COMMENT '所属接口 ID，关联 api.id',
  `name` VARCHAR(128) NOT NULL COMMENT '用例名称',
  `precondition` VARCHAR(512) DEFAULT NULL COMMENT '前置条件描述',
  `request_override` JSON DEFAULT NULL COMMENT '请求覆盖配置 JSON',
  `tags` VARCHAR(255) DEFAULT NULL COMMENT '用例标签，逗号分隔或 JSON 文本',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用用例，1 启用，0 停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_case_project` (`project_id`),
  KEY `idx_case_api` (`api_id`),
  KEY `idx_case_name` (`name`),
  CONSTRAINT `fk_case_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `fk_case_api` FOREIGN KEY (`api_id`) REFERENCES `api` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='单接口用例表';

CREATE TABLE IF NOT EXISTS `api_test_case_assert` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `case_id` BIGINT UNSIGNED NOT NULL COMMENT '所属用例 ID，关联 api_test_case.id',
  `assert_type` VARCHAR(32) NOT NULL COMMENT '断言类型：STATUS_CODE/JSON_FIELD/DURATION 等',
  `expression` VARCHAR(255) DEFAULT NULL COMMENT '断言表达式，如 JSONPath',
  `operator` VARCHAR(16) NOT NULL COMMENT '操作符：=、!=、>、<、CONTAINS 等',
  `expected_value` VARCHAR(255) DEFAULT NULL COMMENT '期望值，字符串形式保存',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '断言说明',
  PRIMARY KEY (`id`),
  KEY `idx_case_assert_case_id` (`case_id`),
  CONSTRAINT `fk_case_assert_case` FOREIGN KEY (`case_id`) REFERENCES `api_test_case` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='单接口用例断言表';

-- ===============================
-- 2.4 场景与步骤
-- ===============================

CREATE TABLE IF NOT EXISTS `scene` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目 ID，关联 project.id',
  `module_name` VARCHAR(128) DEFAULT NULL COMMENT '场景所属模块/分组名称',
  `name` VARCHAR(128) NOT NULL COMMENT '场景名称',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '场景描述（业务流程说明）',
  `tags` VARCHAR(255) DEFAULT NULL COMMENT '场景标签',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用场景，1 启用，0 停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_scene_project` (`project_id`),
  KEY `idx_scene_name` (`name`),
  CONSTRAINT `fk_scene_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='场景表（多接口组合）';

CREATE TABLE IF NOT EXISTS `scene_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `scene_id` BIGINT UNSIGNED NOT NULL COMMENT '所属场景 ID，关联 scene.id',
  `order_index` INT NOT NULL COMMENT '步骤执行顺序，从 1 开始',
  `step_name` VARCHAR(128) NOT NULL COMMENT '步骤名称',
  `ref_type` VARCHAR(16) NOT NULL COMMENT '引用类型：API 或 CASE',
  `ref_id` BIGINT UNSIGNED NOT NULL COMMENT '引用的接口或用例 ID',
  `request_override` JSON DEFAULT NULL COMMENT '步骤级请求覆盖配置 JSON',
  `enabled_flag` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '步骤是否启用，1 启用，0 跳过',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_scene_step_scene` (`scene_id`, `order_index`),
  CONSTRAINT `fk_scene_step_scene` FOREIGN KEY (`scene_id`) REFERENCES `scene` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='场景步骤表';

CREATE TABLE IF NOT EXISTS `scene_step_extract` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `step_id` BIGINT UNSIGNED NOT NULL COMMENT '所属步骤 ID，关联 scene_step.id',
  `variable_name` VARCHAR(128) NOT NULL COMMENT '变量名，例如 token',
  `source_type` VARCHAR(32) NOT NULL COMMENT '抽取来源类型：RESPONSE_JSON/RESPONSE_HEADER 等',
  `expression` VARCHAR(255) NOT NULL COMMENT '抽取表达式，如 JSONPath 或 Header 名称',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '抽取说明',
  PRIMARY KEY (`id`),
  KEY `idx_extract_step` (`step_id`),
  CONSTRAINT `fk_scene_step_extract_step` FOREIGN KEY (`step_id`) REFERENCES `scene_step` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='场景变量抽取配置表';

CREATE TABLE IF NOT EXISTS `scene_step_assert` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `step_id` BIGINT UNSIGNED NOT NULL COMMENT '所属步骤 ID，关联 scene_step.id',
  `assert_type` VARCHAR(32) NOT NULL COMMENT '断言类型：STATUS_CODE/JSON_FIELD/DURATION 等',
  `expression` VARCHAR(255) DEFAULT NULL COMMENT '断言表达式，如 JSONPath',
  `operator` VARCHAR(16) NOT NULL COMMENT '操作符，如 =、!=、CONTAINS 等',
  `expected_value` VARCHAR(255) DEFAULT NULL COMMENT '期望值，字符串形式保存',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '断言说明',
  PRIMARY KEY (`id`),
  KEY `idx_scene_step_assert_step` (`step_id`),
  CONSTRAINT `fk_scene_step_assert_step` FOREIGN KEY (`step_id`) REFERENCES `scene_step` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='场景步骤断言表';

-- ===============================
-- 2.5 测试计划与执行记录
-- ===============================

CREATE TABLE IF NOT EXISTS `test_plan` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目 ID，关联 project.id',
  `name` VARCHAR(128) NOT NULL COMMENT '测试计划名称',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '测试计划说明',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用测试计划，1 启用，0 停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_plan_project` (`project_id`),
  KEY `idx_plan_name` (`name`),
  CONSTRAINT `fk_plan_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='测试计划表';

CREATE TABLE IF NOT EXISTS `test_plan_scene` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `plan_id` BIGINT UNSIGNED NOT NULL COMMENT '所属测试计划 ID，关联 test_plan.id',
  `scene_id` BIGINT UNSIGNED NOT NULL COMMENT '关联场景 ID，关联 scene.id',
  `order_index` INT NOT NULL COMMENT '在计划中的执行顺序，从 1 开始',
  PRIMARY KEY (`id`),
  KEY `idx_plan_scene_plan` (`plan_id`, `order_index`),
  KEY `idx_plan_scene_scene` (`scene_id`),
  CONSTRAINT `fk_plan_scene_plan` FOREIGN KEY (`plan_id`) REFERENCES `test_plan` (`id`),
  CONSTRAINT `fk_plan_scene_scene` FOREIGN KEY (`scene_id`) REFERENCES `scene` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='测试计划关联场景表';

CREATE TABLE IF NOT EXISTS `execution` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目 ID，关联 project.id',
  `target_type` VARCHAR(16) NOT NULL COMMENT '执行目标类型：CASE/SCENE/PLAN',
  `target_id` BIGINT UNSIGNED NOT NULL COMMENT '执行目标 ID，对应具体用例/场景/计划',
  `environment_id` BIGINT UNSIGNED NOT NULL COMMENT '执行使用的环境 ID，关联 environment.id',
  `trigger_type` VARCHAR(16) NOT NULL DEFAULT 'MANUAL' COMMENT '触发类型：MANUAL 等',
  `status` VARCHAR(16) NOT NULL COMMENT '执行状态：RUNNING/SUCCESS/FAILED/PARTIAL_FAILED/ERROR',
  `total_count` INT DEFAULT NULL COMMENT '总步骤或场景数',
  `success_count` INT DEFAULT NULL COMMENT '成功步骤或场景数',
  `failed_count` INT DEFAULT NULL COMMENT '失败步骤或场景数',
  `error_message` VARCHAR(512) DEFAULT NULL COMMENT '执行级错误信息',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '执行开始时间',
  `finished_at` DATETIME DEFAULT NULL COMMENT '执行结束时间',
  `triggered_by` BIGINT UNSIGNED NOT NULL COMMENT '触发执行的用户 ID，关联 user.id',
  PRIMARY KEY (`id`),
  KEY `idx_exec_project` (`project_id`),
  KEY `idx_exec_target` (`target_type`, `target_id`),
  KEY `idx_exec_env` (`environment_id`),
  KEY `idx_exec_status` (`status`),
  KEY `idx_exec_time` (`started_at`),
  CONSTRAINT `fk_exec_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `fk_exec_env` FOREIGN KEY (`environment_id`) REFERENCES `environment` (`id`),
  CONSTRAINT `fk_exec_user` FOREIGN KEY (`triggered_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='执行记录总表';

CREATE TABLE IF NOT EXISTS `execution_step` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `execution_id` BIGINT UNSIGNED NOT NULL COMMENT '所属执行记录 ID，关联 execution.id',
  `scene_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属场景 ID，用于场景/计划执行',
  `scene_step_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '对应场景步骤 ID，关联 scene_step.id',
  `case_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '对应单接口用例 ID',
  `api_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '对应接口 ID',
  `order_index` INT NOT NULL COMMENT '步骤执行顺序',
  `status` VARCHAR(16) NOT NULL COMMENT '步骤执行状态：SUCCESS/FAILED/ERROR/SKIPPED',
  `request_snapshot` JSON DEFAULT NULL COMMENT '请求快照 JSON',
  `response_snapshot` JSON DEFAULT NULL COMMENT '响应快照 JSON',
  `asserts_result` JSON DEFAULT NULL COMMENT '断言结果 JSON 列表',
  `error_message` VARCHAR(512) DEFAULT NULL COMMENT '步骤级错误信息',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '步骤开始时间',
  `finished_at` DATETIME DEFAULT NULL COMMENT '步骤结束时间',
  PRIMARY KEY (`id`),
  KEY `idx_exec_step_exec` (`execution_id`, `order_index`),
  KEY `idx_exec_step_scene` (`scene_id`),
  CONSTRAINT `fk_exec_step_exec` FOREIGN KEY (`execution_id`) REFERENCES `execution` (`id`),
  CONSTRAINT `fk_exec_step_scene` FOREIGN KEY (`scene_id`) REFERENCES `scene` (`id`),
  CONSTRAINT `fk_exec_step_scene_step` FOREIGN KEY (`scene_step_id`) REFERENCES `scene_step` (`id`),
  CONSTRAINT `fk_exec_step_case` FOREIGN KEY (`case_id`) REFERENCES `api_test_case` (`id`),
  CONSTRAINT `fk_exec_step_api` FOREIGN KEY (`api_id`) REFERENCES `api` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='执行步骤记录表';

-- ===============================
-- 2.6 变量与系统配置
-- ===============================

CREATE TABLE IF NOT EXISTS `variable` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `project_id` BIGINT UNSIGNED NOT NULL COMMENT '所属项目 ID，关联 project.id',
  `scope` VARCHAR(16) NOT NULL COMMENT '变量作用域：GLOBAL/ENV/SCENE',
  `environment_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '作用域为 ENV 时的环境 ID',
  `scene_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '作用域为 SCENE 时的场景 ID',
  `name` VARCHAR(128) NOT NULL COMMENT '变量名',
  `value` VARCHAR(1024) NOT NULL COMMENT '变量值，字符串形式存储',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '变量说明',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_var_scope_name` (`project_id`, `scope`, `environment_id`, `scene_id`, `name`),
  KEY `idx_var_project_scope` (`project_id`, `scope`),
  KEY `idx_var_env` (`environment_id`),
  KEY `idx_var_scene` (`scene_id`),
  CONSTRAINT `fk_var_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  CONSTRAINT `fk_var_env` FOREIGN KEY (`environment_id`) REFERENCES `environment` (`id`),
  CONSTRAINT `fk_var_scene` FOREIGN KEY (`scene_id`) REFERENCES `scene` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='变量表';

CREATE TABLE IF NOT EXISTS `system_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键，自增 ID',
  `config_key` VARCHAR(128) NOT NULL COMMENT '配置键，例如 max_response_size',
  `config_value` VARCHAR(1024) NOT NULL COMMENT '配置值，字符串形式',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '配置说明',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sys_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统配置表';