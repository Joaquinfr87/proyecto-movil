# Definicion de Hecho - MVP Express

## Proyecto: Lugares Interactivos (DeporteYa)

> Criterios de calidad para un MVP funcional. Funcionalidad > Perfeccion.

---

## 1. Una Historia esta COMPLETADA cuando:

### Codigo
- [ ] El codigo funciona (no hay crashes)
- [ ] No hay errores de TypeScript criticos
- [ ] La pantalla se ve razonablemente bien

### Integracion
- [ ] Los datos se guardan/leen de Supabase correctamente
- [ ] La navegacion funciona sin romperse

### Prueba
- [ ] Fue probada en al menos 1 dispositivo Android
- [ ] No hay bugs que impidan usar la funcionalidad

### Merge
- [ ] El codigo esta en `develop` (merge sin conflictos)
- [ ] Al menos 1 persona lo reviso

---

## 2. El MVP esta COMPLETO cuando:

### Funcionalidades Core
- [ ] Login y registro funcionan
- [ ] El mapa muestra escenarios con marcadores
- [ ] El catalogo lista escenarios
- [ ] El detalle muestra info completa
- [ ] Los favoritos se guardan y se ven
- [ ] La busqueda y filtros funcionan

### Calidad Minima
- [ ] La app no crashea en uso normal
- [ ] La app se ve bien en 1 dispositivo Android
- [ ] Los errores de red muestran mensajes (no pantalla blanca)
- [ ] Los loading states aparecen cuando carga datos

### Documentacion
- [ ] README con instrucciones de instalacion
- [ ] Modelo de datos documentado

---

## 3. Pull Request - Minimo Requerido

- [ ] El codigo compila
- [ ] No se subio ningun secret (.env, keys)
- [ ] Al menos 1 review approve
- [ ] Mensaje de commit descriptivo

---

## 4. Criterios por Modulo

### Auth
- [ ] Login funciona con credenciales validas
- [ ] Registro crea usuario en Supabase
- [ ] Logout cierra sesion
- [ ] No autenticado -> redirige a login

### Mapa
- [ ] Carga y muestra marcadores de escenarios
- [ ] Ubicacion actual visible
- [ ] Tocar marcador muestra info basica

### Catalogo
- [ ] Lista escenarios desde Supabase
- [ ] Busqueda filtra por nombre
- [ ] Filtros por deporte y tipo funcionan

### Detalle
- [ ] Muestra nombre, descripcion, capacidad, direccion
- [ ] Muestra deportes disponibles
- [ ] Muestra horarios y eventos
- [ ] Boton de favorito funciona

### Favoritos
- [ ] Se puede guardar un favorito
- [ ] Se puede eliminar un favorito
- [ ] La lista persiste despues de cerrar la app

---

## 5. No Priorizar (Out of Scope MVP)

- Pruebas automatizadas (unittest, e2e)
- CI/CD pipeline
- Performance tuning avanzado
- Soporte iOS (solo Android)
- Internacionalizacion
- Notificaciones push
- Modo offline completo
