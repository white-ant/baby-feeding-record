CREATE DATABASE IF NOT EXISTS baby_feeding_record DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE baby_feeding_record;

-- users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- babies
CREATE TABLE babies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) DEFAULT '',
  birthday DATE DEFAULT NULL,
  avatar VARCHAR(500) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- feeding_records
CREATE TABLE feeding_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  baby_id INT NOT NULL,
  user_id INT NOT NULL,
  milk_amount INT NOT NULL DEFAULT 0,
  feeding_time DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- baby_shares
CREATE TABLE baby_shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  baby_id INT NOT NULL,
  owner_user_id INT NOT NULL,
  shared_user_id INT NOT NULL,
  permission ENUM('view', 'record') DEFAULT 'view',
  share_token VARCHAR(64) DEFAULT NULL,
  token_enabled TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY idx_share_token (share_token)
);

-- indexes
CREATE INDEX idx_baby_id ON feeding_records (baby_id);
CREATE INDEX idx_feeding_time ON feeding_records (feeding_time);
CREATE INDEX idx_baby_feeding_time ON feeding_records (baby_id, feeding_time);
CREATE INDEX idx_shared_user ON baby_shares (shared_user_id);
CREATE INDEX idx_baby_owner ON baby_shares (baby_id, owner_user_id);
