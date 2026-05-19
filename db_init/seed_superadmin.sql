-- SEED DE SUPERADMIN PARA ANTIGRAVITY SAAS
-- Empresa Raíz del Sistema
INSERT INTO companies (id, business_name, legal_name, tax_id, tax_type)
VALUES (1, 'SISTEMA ANTIGRAVITY', 'ANTIGRAVITY CORE LTD', '00-00000000-0', 'SISTEMA')
ON CONFLICT (tax_id) DO NOTHING;

-- Usuario Superadmin (Tomi)
-- Password: Tomi4656$
INSERT INTO agents (company_id, name, email, password_hash, role, status)
VALUES (1, 'ADMIN', 'admin@antigravity.io', '$2a$10$mQ0dEhv32QskZLaP7ORfYe7G1OXuD5H6.E8l6rQ0Lc/Z.I8fpjnH2', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;
