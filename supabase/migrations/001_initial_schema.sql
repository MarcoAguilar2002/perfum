-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Sedes
CREATE TABLE sedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  ciudad VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de Categorías
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  marca VARCHAR(100),
  categoria_id UUID REFERENCES categorias(id),
  precio_compra DECIMAL(10, 2) NOT NULL,
  precio_venta DECIMAL(10, 2) NOT NULL,
  codigo_barras VARCHAR(100) UNIQUE,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de Inventario (stock por sede)
CREATE TABLE inventario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  sede_id UUID REFERENCES sedes(id) ON DELETE CASCADE,
  stock_actual INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER DEFAULT 10,
  stock_maximo INTEGER DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(producto_id, sede_id)
);

-- Tabla de Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(20),
  dni VARCHAR(20) UNIQUE,
  direccion TEXT,
  fecha_nacimiento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de Ventas
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sede_id UUID REFERENCES sedes(id),
  cliente_id UUID REFERENCES clientes(id),
  user_id UUID REFERENCES auth.users(id),
  total DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL, -- efectivo, tarjeta, transferencia
  estado VARCHAR(50) DEFAULT 'completada', -- completada, cancelada, pendiente
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de Detalle de Ventas
CREATE TABLE detalle_ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de Proveedores
CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  ruc VARCHAR(20) UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla de Perfiles (extender auth.users)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255),
  apellido VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'vendedor', -- admin, gerente, vendedor
  sede_id UUID REFERENCES sedes(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_inventario_producto ON inventario(producto_id);
CREATE INDEX idx_inventario_sede ON inventario(sede_id);
CREATE INDEX idx_ventas_sede ON ventas(sede_id);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON ventas(created_at);
CREATE INDEX idx_detalle_ventas_venta ON detalle_ventas(venta_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_sedes_updated_at BEFORE UPDATE ON sedes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (todos los usuarios autenticados pueden leer)
CREATE POLICY "Todos pueden ver sedes" ON sedes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Todos pueden ver categorias" ON categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Todos pueden ver productos" ON productos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Todos pueden ver inventario" ON inventario FOR SELECT TO authenticated USING (true);
CREATE POLICY "Todos pueden ver clientes" ON clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Todos pueden ver ventas" ON ventas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Todos pueden ver detalle_ventas" ON detalle_ventas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Todos pueden ver proveedores" ON proveedores FOR SELECT TO authenticated USING (true);

-- Políticas de INSERT/UPDATE/DELETE (aquí puedes personalizarlas según roles)
CREATE POLICY "Usuarios pueden insertar ventas" ON ventas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden insertar detalle_ventas" ON detalle_ventas FOR INSERT TO authenticated WITH CHECK (true);

-- Política para perfiles
CREATE POLICY "Usuarios pueden ver su perfil" ON perfiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su perfil" ON perfiles FOR UPDATE TO authenticated USING (auth.uid() = id);