-- Adicionando novos valores ao ENUM de user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'delivery';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coe_sap';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coe_qa';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'people';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'financeiro';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'inovacao';
