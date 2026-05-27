-- CONAD: Schema inicial (MySQL 5.7+/8.0)

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_plans (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(64) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description TEXT NULL,
  benefits_text TEXT NULL,
  price_full_cents INT UNSIGNED NOT NULL,
  installment_count TINYINT UNSIGNED NOT NULL DEFAULT 1,
  installment_price_cents INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_plans_slug (slug),
  KEY idx_payment_plans_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_fields (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  field_key VARCHAR(64) NOT NULL,
  label VARCHAR(191) NOT NULL,
  field_type ENUM('text','email','tel','select','textarea','checkbox') NOT NULL DEFAULT 'text',
  is_required TINYINT(1) NOT NULL DEFAULT 0,
  options_json JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_form_fields_key (field_key),
  KEY idx_form_fields_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS congregations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_congregations_name (name),
  KEY idx_congregations_active_sort (is_active, sort_order, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_id INT UNSIGNED NULL,
  payment_mode ENUM('full','installments') NOT NULL DEFAULT 'full',
  participant_name VARCHAR(191) NOT NULL,
  participant_email VARCHAR(191) NOT NULL,
  participant_phone VARCHAR(64) NULL,

  -- Primary Occupant (required at application level)
  primary_first_name VARCHAR(100) NULL,
  primary_last_name VARCHAR(100) NULL,
  primary_sex ENUM('Homem','Mulher') NULL,
  primary_dob DATE NULL,
  primary_phone VARCHAR(32) NULL,
  primary_email VARCHAR(191) NULL,

  -- Second Occupant (optional)
  secondary_name VARCHAR(191) NULL,
  secondary_sex ENUM('Homem','Mulher') NULL,
  secondary_dob DATE NULL,
  secondary_phone VARCHAR(32) NULL,
  secondary_email VARCHAR(191) NULL,

  -- Address (international)
  address_street VARCHAR(191) NULL,
  address_unit VARCHAR(100) NULL,
  address_city VARCHAR(120) NULL,
  address_state VARCHAR(120) NULL,
  address_zip VARCHAR(32) NULL,
  address_country VARCHAR(120) NULL,

  -- Church info
  pastor_name VARCHAR(191) NULL,
  congregation_id INT UNSIGNED NULL,

  fields_json JSON NULL,
  current_step TINYINT UNSIGNED NOT NULL DEFAULT 1,
  terms_accepted TINYINT(1) NOT NULL DEFAULT 0,
  terms_accepted_at TIMESTAMP NULL,
  terms_accepted_ip VARCHAR(45) NULL,
  terms_accepted_user_agent VARCHAR(255) NULL,
  status ENUM('pending','paid','canceled') NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(191) NULL,
  stripe_checkout_session_id VARCHAR(191) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_registrations_created_at (created_at),
  KEY idx_registrations_status (status),
  KEY idx_registrations_plan_id (plan_id),
  KEY idx_registrations_terms_accepted (terms_accepted),
  KEY idx_registrations_congregation_id (congregation_id),
  CONSTRAINT fk_registrations_plan_id
    FOREIGN KEY (plan_id) REFERENCES payment_plans(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
  ,CONSTRAINT fk_registrations_congregation_id
    FOREIGN KEY (congregation_id) REFERENCES congregations(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registration_children (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  registration_id BIGINT UNSIGNED NOT NULL,
  child_name VARCHAR(191) NOT NULL,
  child_last_name VARCHAR(191) NULL,
  child_dob DATE NOT NULL,
  child_sex ENUM('Homem','Mulher') NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_children_registration_id (registration_id),
  CONSTRAINT fk_children_registration_id
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registration_occupants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  registration_id BIGINT UNSIGNED NOT NULL,

  occupant_first_name VARCHAR(100) NOT NULL,
  occupant_last_name VARCHAR(100) NOT NULL,
  occupant_sex ENUM('Homem','Mulher') NOT NULL,
  occupant_dob DATE NOT NULL,
  occupant_phone VARCHAR(32) NOT NULL,
  occupant_email VARCHAR(191) NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_occupants_registration_id (registration_id),
  KEY idx_occupants_email (occupant_email),
  KEY idx_occupants_phone (occupant_phone),
  CONSTRAINT fk_occupants_registration_id
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(64) NOT NULL,
  setting_value TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seeds mínimos (opcional)
INSERT IGNORE INTO payment_plans (slug, name, description, price_full_cents, installment_count, installment_price_cents, is_active, sort_order)
VALUES
  ('lote-1', 'Lote 1', NULL, 49700, 1, NULL, 1, 10),
  ('lote-2', 'Lote 2 (Mais popular)', NULL, 69700, 1, NULL, 1, 20),
  ('vip', 'VIP Premium', NULL, 99700, 1, NULL, 1, 30);

INSERT INTO settings (setting_key, setting_value)
VALUES
  ('stripe_enabled', '0'),
  ('stripe_mode', 'test'),
  ('stripe_publishable_test', ''),
  ('stripe_secret_test', ''),
  ('stripe_publishable_live', ''),
  ('stripe_secret_live', ''),
  ('banner_home_desktop', ''),
  ('banner_home_mobile', ''),
  ('logo_desktop', ''),
  ('logo_mobile', ''),
  ('countdown_date', '2026-08-15'),
  ('countdown_time', '09:00:00')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

