create table if not exists guest_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT not null unique,
  generate_used INTEGER not null default 0,
  created_at TEXT not null default CURRENT_TIMESTAMP,
  updated_at TEXT not null default CURRENT_TIMESTAMP
);

create table if not exists redeem_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT not null unique,
  duration_days INTEGER not null,
  status TEXT not null,
  activated_at TEXT,
  expires_at TEXT,
  max_devices INTEGER not null default 2,
  note TEXT,
  created_at TEXT not null default CURRENT_TIMESTAMP,
  updated_at TEXT not null default CURRENT_TIMESTAMP
);

create table if not exists redeem_code_devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  redeem_code_id INTEGER not null references redeem_codes(id) on delete cascade,
  device_id TEXT not null,
  first_seen_at TEXT not null default CURRENT_TIMESTAMP,
  last_seen_at TEXT not null default CURRENT_TIMESTAMP,
  created_at TEXT not null default CURRENT_TIMESTAMP,
  updated_at TEXT not null default CURRENT_TIMESTAMP,
  unique (redeem_code_id, device_id)
);
