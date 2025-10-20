-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
  SELECT rol FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para obtener la sede del usuario actual
CREATE OR REPLACE FUNCTION get_user_sede()
RETURNS UUID AS $$
  SELECT sede_id FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "Todos pueden ver productos" ON productos;
DROP POLICY IF EXISTS "Todos pueden ver inventario" ON inventario;
DROP POLICY IF EXISTS "Todos pueden ver ventas" ON ventas;
DROP POLICY IF EXISTS "Usuarios pueden insertar ventas" ON ventas;
DROP POLICY IF EXISTS "Usuarios pueden insertar detalle_ventas" ON detalle_ventas;

-- POLÍTICAS PARA PRODUCTOS
CREATE POLICY "Todos pueden ver productos"
  ON productos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo admin puede crear productos"
  ON productos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Solo admin puede actualizar productos"
  ON productos FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Solo admin puede eliminar productos"
  ON productos FOR DELETE
  TO authenticated
  USING (is_admin());

-- POLÍTICAS PARA INVENTARIO
CREATE POLICY "Ver inventario según sede"
  ON inventario FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    sede_id = get_user_sede() OR 
    get_user_role() = 'gerente'
  );

CREATE POLICY "Admin y gerente pueden crear inventario"
  ON inventario FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin() OR get_user_role() = 'gerente'
  );

CREATE POLICY "Admin y gerente pueden actualizar inventario"
  ON inventario FOR UPDATE
  TO authenticated
  USING (
    is_admin() OR 
    (get_user_role() = 'gerente' AND sede_id = get_user_sede())
  );

-- POLÍTICAS PARA VENTAS
CREATE POLICY "Ver ventas según sede"
  ON ventas FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    sede_id = get_user_sede() OR 
    get_user_role() = 'gerente'
  );

CREATE POLICY "Crear ventas en su sede"
  ON ventas FOR INSERT
  TO authenticated
  WITH CHECK (
    sede_id = get_user_sede() OR is_admin()
  );

CREATE POLICY "Solo admin puede actualizar ventas"
  ON ventas FOR UPDATE
  TO authenticated
  USING (is_admin());

-- POLÍTICAS PARA DETALLE VENTAS
CREATE POLICY "Ver detalle ventas según permiso"
  ON detalle_ventas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventas 
      WHERE ventas.id = detalle_ventas.venta_id 
      AND (
        is_admin() OR 
        ventas.sede_id = get_user_sede() OR 
        get_user_role() = 'gerente'
      )
    )
  );

CREATE POLICY "Insertar detalle ventas"
  ON detalle_ventas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- POLÍTICAS PARA CLIENTES
CREATE POLICY "Ver clientes según rol"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Crear clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Actualizar clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo admin puede eliminar clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (is_admin());

-- POLÍTICAS PARA SEDES
CREATE POLICY "Ver sedes según rol"
  ON sedes FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    id = get_user_sede() OR 
    get_user_role() = 'gerente'
  );

CREATE POLICY "Solo admin puede gestionar sedes"
  ON sedes FOR ALL
  TO authenticated
  USING (is_admin());

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (id, rol)
  VALUES (NEW.id, 'vendedor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();