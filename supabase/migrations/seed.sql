-- Insertar datos de ejemplo para probar la aplicación

-- Sedes
INSERT INTO sedes (nombre, direccion, telefono, ciudad) VALUES
('Sede Centro', 'Av. Larco 123, Trujillo', '044-123456', 'Trujillo'),
('Sede Mall', 'Mall Aventura Plaza, Trujillo', '044-654321', 'Trujillo'),
('Sede Norte', 'Av. España 456, Trujillo', '044-789012', 'Trujillo');

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Perfumes Mujer', 'Perfumes y fragancias para mujer'),
('Perfumes Hombre', 'Perfumes y fragancias para hombre'),
('Perfumes Unisex', 'Fragancias unisex'),
('Colonias', 'Colonias y agua de colonia'),
('Sets y Regalos', 'Sets de regalo y combos');

-- Productos (necesitas el ID de las categorías)
INSERT INTO productos (nombre, descripcion, marca, categoria_id, precio_compra, precio_venta, codigo_barras) 
SELECT 
  'Chanel No. 5', 
  'Perfume clásico de mujer', 
  'Chanel', 
  id, 
  250.00, 
  380.00, 
  '3145891355208'
FROM categorias WHERE nombre = 'Perfumes Mujer' LIMIT 1;

INSERT INTO productos (nombre, descripcion, marca, categoria_id, precio_compra, precio_venta, codigo_barras) 
SELECT 
  'Dior Sauvage', 
  'Fragancia masculina fresca', 
  'Dior', 
  id, 
  200.00, 
  320.00, 
  '3348901419178'
FROM categorias WHERE nombre = 'Perfumes Hombre' LIMIT 1;

INSERT INTO productos (nombre, descripcion, marca, categoria_id, precio_compra, precio_venta, codigo_barras) 
SELECT 
  'Carolina Herrera Good Girl', 
  'Perfume elegante de mujer', 
  'Carolina Herrera', 
  id, 
  180.00, 
  290.00, 
  '8411061929193'
FROM categorias WHERE nombre = 'Perfumes Mujer' LIMIT 1;

INSERT INTO productos (nombre, descripcion, marca, categoria_id, precio_compra, precio_venta, codigo_barras) 
SELECT 
  'Paco Rabanne 1 Million', 
  'Perfume masculino intenso', 
  'Paco Rabanne', 
  id, 
  150.00, 
  240.00, 
  '3349668021822'
FROM categorias WHERE nombre = 'Perfumes Hombre' LIMIT 1;

INSERT INTO productos (nombre, descripcion, marca, categoria_id, precio_compra, precio_venta, codigo_barras) 
SELECT 
  'Calvin Klein CK One', 
  'Fragancia unisex clásica', 
  'Calvin Klein', 
  id, 
  80.00, 
  130.00, 
  '088300605507'
FROM categorias WHERE nombre = 'Perfumes Unisex' LIMIT 1;

-- Clientes
INSERT INTO clientes (nombre, apellido, email, telefono, dni) VALUES
('María', 'García', 'maria.garcia@email.com', '987654321', '12345678'),
('Juan', 'Pérez', 'juan.perez@email.com', '987654322', '87654321'),
('Ana', 'López', 'ana.lopez@email.com', '987654323', '11223344'),
('Carlos', 'Ramírez', 'carlos.ramirez@email.com', '987654324', '44332211');

-- Inventario inicial (para cada producto en cada sede)
-- Nota: Necesitarás ajustar esto según tus IDs reales
INSERT INTO inventario (producto_id, sede_id, stock_actual, stock_minimo, stock_maximo)
SELECT p.id, s.id, 50, 10, 100
FROM productos p
CROSS JOIN sedes s;

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email, ruc) VALUES
('Distribuidora Fragancias SAC', 'Roberto Silva', '044-111222', 'ventas@fragancias.com', '20123456789'),
('Importadora Perfumes Peru', 'Laura Mendoza', '044-333444', 'contacto@perfumesperu.com', '20987654321'),
('Comercial Beauty Line', 'Miguel Torres', '044-555666', 'info@beautyline.com', '20456789123');