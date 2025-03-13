DROP TABLE IF EXISTS products;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stockCount INTEGER NOT NULL DEFAULT 0,
    brand VARCHAR(50),
    imageUrl TEXT,
    isAvailable BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, category, description, price, stockCount, brand)
VALUES 
('Laptop', 'Electronics', 'High-performance laptop', 999.99, 10, 'BrandX'),
('Smartphone', 'Electronics', 'Latest model smartphone', 699.99, 15, 'BrandY')
ON CONFLICT DO NOTHING;
