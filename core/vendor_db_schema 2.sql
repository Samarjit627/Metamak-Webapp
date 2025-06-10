-- Example schema for scalable vendor directory (PostgreSQL/Supabase)
CREATE TABLE vendors (
    vendor_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    city VARCHAR,
    tier INT,
    processes TEXT[],
    materials TEXT[],
    certifications TEXT[],
    min_order_qty INT,
    contact VARCHAR,
    rating FLOAT,
    last_active TIMESTAMP
);

CREATE INDEX idx_vendors_city ON vendors(city);
CREATE INDEX idx_vendors_processes ON vendors USING GIN(processes);
CREATE INDEX idx_vendors_materials ON vendors USING GIN(materials);
