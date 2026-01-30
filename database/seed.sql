-- Seed data para desenvolvimento

-- Insert tenant de exemplo
INSERT INTO tenants (name, slug, address, phone, email, delivery_fee) VALUES
('Burger Express', 'burger-express', 'Rua das Lanches, 123', '(11) 98765-4321', 'contato@burgerexpress.com', 5.00);

-- Insert users de exemplo
INSERT INTO users (email, name, role, tenant_id) VALUES
('admin@burgerexpress.com', 'Administrador', 'admin', (SELECT id FROM tenants WHERE slug = 'burger-express')),
('manager@burgerexpress.com', 'Gerente', 'manager', (SELECT id FROM tenants WHERE slug = 'burger-express')),
('vendor@burgerexpress.com', 'Vendedor', 'vendor', (SELECT id FROM tenants WHERE slug = 'burger-express'));

-- Insert categories
INSERT INTO categories (tenant_id, name, description, order_index) VALUES
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Hambúrgueres', 'Nossos hambúrgueres artesanais', 1),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Bebidas', 'Refrigerantes e sucos', 2),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Acompanhamentos', 'Batatas e saladas', 3),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Sobremesas', 'Doces e sobremesas', 4);

-- Insert products
INSERT INTO products (tenant_id, category_id, name, description, price, is_available, order_index) VALUES
-- Hambúrgueres
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Hambúrgueres'), 'X-Burger', 'Pão, carne, queijo, alface, tomate', 25.90, true, 1),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Hambúrgueres'), 'X-Bacon', 'Pão, carne, bacon, queijo, alface, tomate', 29.90, true, 2),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Hambúrgueres'), 'X-Egg', 'Pão, carne, ovo, queijo, alface, tomate', 27.90, true, 3),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Hambúrgueres'), 'X-Tudo', 'Pão, 2 carnes, bacon, ovo, queijo, calabresa, alface, tomate', 35.90, true, 4),

-- Bebidas
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Bebidas'), 'Refrigerante Lata', 'Coca-Cola, Guaraná, Fanta', 6.00, true, 1),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Bebidas'), 'Suco Natural', 'Laranja, Limão, Maracujá', 8.00, true, 2),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Bebidas'), 'Água Mineral', 'Com ou sem gás', 3.00, true, 3),

-- Acompanhamentos
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Acompanhamentos'), 'Batata Frita', 'Porção média (200g)', 12.00, true, 1),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Acompanhamentos'), 'Onion Rings', 'Porção média (150g)', 15.00, true, 2),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Acompanhamentos'), 'Salada', 'Folhas verdes com molho', 10.00, true, 3),

-- Sobremesas
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Sobremesas'), 'Sundae', 'Sorvete com calda', 12.00, true, 1),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Sobremesas'), 'Petit Gateau', 'Chocolate quente', 18.00, true, 2),
((SELECT id FROM tenants WHERE slug = 'burger-express'), (SELECT id FROM categories WHERE name = 'Sobremesas'), 'Mousse', 'Limão ou chocolate', 8.00, true, 3);

-- Insert product customizations
INSERT INTO product_customizations (product_id, name, type, price, is_available) VALUES
-- Hambúrguer customizations
((SELECT id FROM products WHERE name = 'X-Burger'), 'Bacon Extra', 'addition', 5.00, true),
((SELECT id FROM products WHERE name = 'X-Burger'), 'Queijo Extra', 'addition', 3.00, true),
((SELECT id FROM products WHERE name = 'X-Burger'), 'Sem Alface', 'removal', 0.00, true),
((SELECT id FROM products WHERE name = 'X-Burger'), 'Sem Tomate', 'removal', 0.00, true),

((SELECT id FROM products WHERE name = 'X-Bacon'), 'Queijo Extra', 'addition', 3.00, true),
((SELECT id FROM products WHERE name = 'X-Bacon'), 'Ovo Extra', 'addition', 4.00, true),
((SELECT id FROM products WHERE name = 'X-Bacon'), 'Sem Alface', 'removal', 0.00, true),
((SELECT id FROM products WHERE name = 'X-Bacon'), 'Sem Tomate', 'removal', 0.00, true),

((SELECT id FROM products WHERE name = 'X-Egg'), 'Bacon Extra', 'addition', 5.00, true),
((SELECT id FROM products WHERE name = 'X-Egg'), 'Queijo Extra', 'addition', 3.00, true),
((SELECT id FROM products WHERE name = 'X-Egg'), 'Ovo Extra', 'addition', 4.00, true),
((SELECT id FROM products WHERE name = 'X-Egg'), 'Sem Alface', 'removal', 0.00, true),

((SELECT id FROM products WHERE name = 'X-Tudo'), 'Carne Extra', 'addition', 12.00, true),
((SELECT id FROM products WHERE name = 'X-Tudo'), 'Queijo Extra', 'addition', 3.00, true),
((SELECT id FROM products WHERE name = 'X-Tudo'), 'Bacon Extra', 'addition', 5.00, true);

-- Insert inventory items
INSERT INTO inventory_items (tenant_id, name, description, quantity, min_quantity, unit) VALUES
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Pão de Hambúrguer', 'Pães frescos', 100, 20, 'un'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Carne Bovina', 'Carne 150g', 50, 10, 'kg'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Queijo Prato', 'Fatias', 200, 30, 'un'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Alface', 'Unidades', 30, 5, 'un'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Tomate', 'Unidades', 30, 5, 'un'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Bacon', 'Fatias', 100, 20, 'un'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Ovos', 'Unidades', 50, 10, 'un'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Batata Congelada', 'Pacotes', 20, 5, 'kg'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Refrigerante Lata', 'Unidades', 100, 20, 'un'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'Coca-Cola 2L', 'Garrafas', 30, 5, 'un');

-- Insert sample financial records
INSERT INTO financial_records (tenant_id, type, description, amount, category, date) VALUES
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'income', 'Vendas do dia', 1250.00, 'vendas', CURRENT_DATE),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'expense', 'Compra de insumos', 450.00, 'compras', CURRENT_DATE),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'expense', 'Aluguel', 800.00, 'aluguel', CURRENT_DATE - INTERVAL '1 month'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'expense', 'Contas de luz', 250.00, 'utilidades', CURRENT_DATE - INTERVAL '15 days'),
((SELECT id FROM tenants WHERE slug = 'burger-express'), 'income', 'Delivery', 320.00, 'delivery', CURRENT_DATE - INTERVAL '1 day');
