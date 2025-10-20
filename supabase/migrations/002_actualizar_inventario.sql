-- Función para actualizar inventario al hacer ventas
CREATE OR REPLACE FUNCTION actualizar_inventario(
  p_producto_id UUID,
  p_sede_id UUID,
  p_cantidad INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Buscar el registro de inventario
  UPDATE inventario
  SET 
    stock_actual = stock_actual + p_cantidad,
    updated_at = NOW()
  WHERE 
    producto_id = p_producto_id 
    AND sede_id = p_sede_id;
  
  -- Si no existe, crear el registro
  IF NOT FOUND THEN
    INSERT INTO inventario (producto_id, sede_id, stock_actual)
    VALUES (p_producto_id, p_sede_id, GREATEST(0, p_cantidad));
  END IF;
END;
$$ LANGUAGE plpgsql;