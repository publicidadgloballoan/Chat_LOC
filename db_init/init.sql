-- ESQUEMA DE BASE DE DATOS ANTIGRAVITY SAAS V4.0

-- 1. TABLA DE EMPRESAS (Nivel superior)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL, -- Nombre fantasía
    legal_name VARCHAR(255),           -- Razón Social
    tax_id VARCHAR(20) UNIQUE NOT NULL, -- CUIT/CUIL
    tax_type VARCHAR(50),             -- Responsable Inscripto, etc.
    brand_manual_url TEXT,            -- Ruta al manual de marca/logo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE AGENTES HUMANOS
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'supervisor', 'agente')) DEFAULT 'agente',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE CANALES DE COMUNICACIÓN (Multi-plataforma)
CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- WhatsApp, Instagram, Telegram, etc.
    bot_name VARCHAR(100) NOT NULL,
    instance_name VARCHAR(100) UNIQUE NOT NULL, -- Para Evolution API
    config_a1 JSONB, -- Config General
    config_a2 JSONB, -- Config IA
    config_a3 JSONB, -- Config Handoff
    debug_mode JSONB DEFAULT '{"enabled": false, "authorized_numbers": []}',
    status VARCHAR(20) DEFAULT 'disconnected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE BASE DE CONOCIMIENTO (RAG Optimizado)
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50), -- PDF, MD, TXT
    embedding_status VARCHAR(20) DEFAULT 'pending',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE TICKETS / CONVERSACIONES
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    customer_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'bot_handling', -- bot_handling, human_required, closed
    last_agent_id INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para busquedas rapidas
CREATE INDEX idx_agents_company ON agents(company_id);
CREATE INDEX idx_channels_company ON channels(company_id);
CREATE INDEX idx_knowledge_channel ON knowledge_base(channel_id);
CREATE INDEX idx_tickets_customer ON tickets(customer_number);
