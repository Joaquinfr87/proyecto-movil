# PDF 6: INTEGRACIÓN CON SUPABASE Y BASE DE DATOS POSTGRESQL

## Propósito del avance
La información almacenada localmente pertenece al dispositivo donde se ejecuta la aplicación. Ahora deberán comenzar a solucionar este problema mediante un backend en la nube.

La evolución será:
```
PDF 4
Lógica + Estado
  ↓
PDF 5
Persistencia local
  ↓
PDF 6
Supabase + PostgreSQL
  ↓
Aplicación conectada a datos reales
```

La arquitectura básica que deberán comprender será:

```
+-----------------------------------+
|         APLICACIÓN FLUTTER        |
|                                   |
|  Pantallas                        |
|  Formularios                      |
|  Lógica                           |
+-----------------------------------+
                  |
                  | Internet
                  v
+-----------------------------------+
|              SUPABASE             |
|                                   |
|  Backend                          |
|  API                              |
|  Autenticación                    |
|  Base de datos                    |
+-----------------------------------+
                  |
                  v
+-----------------------------------+
|             PostgreSQL            |
|                                   |
|  Tablas                           |
|  Registros                        |
|  Relaciones                       |
+-----------------------------------+
```

---

## 1. RETOMAR EL PROYECTO DEL PDF 5
Cada equipo deberá continuar trabajando sobre el mismo proyecto. No deberán crear una aplicación nueva, antes de comenzar deberán comprobar:
- Las interfaces funcionan.
- La navegación funciona.
- Los formularios funcionan.
- Las validaciones funcionan.
- El manejo de estado funciona.
- La persistencia local funciona.
- El repositorio GitHub está actualizado.

El proyecto debería encontrarse aproximadamente en:
```
Aplicación móvil
│
├── Interfaces
├── Navegación
├── Formularios
├── Validaciones
├── Estado
├── Persistencia local
└── Datos temporales
```

Ahora se incorporará:
```
Interfaces
Navegación
Formularios
Validaciones
Estado
Persistencia local
Datos temporales
       ↓
    Supabase
   PostgreSQL
```

---

## 2. COMPRENDER EL PROBLEMA DE LOS DATOS LOCALES
Antes de crear la conexión con Supabase, los desarrolladores deberán analizar una situación. Supongamos que tienen una aplicación de reservas.

El usuario A realiza:
**Reserva:**  
Cancha 1  
18:00

Si la información solamente está almacenada en el teléfono:
```
Teléfono A
Reserva
```

Pero el usuario B utiliza otro teléfono:
```
Teléfono B
X No conoce la reserva
```

Esto genera un problema.

Por ello necesitamos:
```
Usuario A  -->  Aplicación  -->  Servidor  <--  Usuario B
```

Aquí aparece la necesidad de una base de datos centralizada.

---

## 3. DIFERENCIAR FRONTEND Y BACKEND
Los desarrolladores deberán identificar qué parte corresponde a cada componente.

### Frontend
Será la aplicación desarrollada con Flutter:
```
Flutter
│
├── Pantallas
├── Botones
├── Formularios
├── Navegación
└── Interacción
```

### Backend
Será la infraestructura que permitirá gestionar los datos y servicios:
```
Supabase
│
├── Base de datos
├── API
├── Autenticación
└── Servicios
```

La idea fundamental será:  
**Flutter presenta e interactúa con la información; Supabase permite gestionarla de forma centralizada.**

---

## 4. CREAR EL PROYECTO EN SUPABASE
Cada equipo deberá crear o utilizar un proyecto de Supabase (o cualquier otro gestor de base de datos) para su aplicación.

Deberán identificar:
- Nombre del proyecto.
- URL del proyecto.
- Claves necesarias para la conexión.
- Región seleccionada.
- Base de datos PostgreSQL disponible.

El objetivo es que cada equipo tenga un entorno independiente para desarrollar su proyecto.

---

## 5. EXPLORAR EL PANEL DE SUPABASE
Antes de programar, deberán realizar una exploración básica del entorno.

Deberán identificar principalmente:
```
Supabase
│
├── Table Editor
├── SQL Editor
├── Authentication
├── API
└── Project Settings
```

No se busca todavía estudiar todos los servicios de Supabase.  
El objetivo es reconocer dónde se encuentran los elementos que posteriormente utilizarán.

---

## 6. IDENTIFICAR LA INFORMACIÓN QUE SE ALMACENARÁ
Cada equipo deberá regresar al análisis realizado en el PDF 1 y revisar las funcionalidades principales del MVP.

Ahora deberán responder:  
**¿Qué información necesita almacenar nuestra aplicación?**

Por ejemplo:

- **Sistema de reservas**
  - usuarios
  - reservas
  - canchas
  - horarios

- **Sistema de farmacia**
  - usuarios
  - productos
  - categorias
  - ventas

- **Sistema de pedidos**
  - usuarios
  - productos
  - pedidos
  - detalle_pedido

No deberán crear tablas sin relación con la aplicación, la estructura de datos debe responder a las funcionalidades previamente definidas.

---

## 7. IDENTIFICAR LAS ENTIDADES PRINCIPALES
Cada equipo deberá identificar las entidades principales de su proyecto.

Por ejemplo:
- **Sistema de reservas:** USUARIO, CANCHA, RESERVA
- **Sistema de pedidos:** USUARIO, PRODUCTO, PEDIDO, DETALLE PEDIDO
- **Sistema de farmacia:** USUARIO, PRODUCTO, CATEGORIA, VENTA

---

## 8. DISEÑAR LAS TABLAS
Cada entidad deberá convertirse inicialmente en una tabla de PostgreSQL. Por ejemplo:

```
USUARIO
───────
id
nombre
correo
telefono
```

```
PRODUCTO
────────
id
nombre
precio
stock
```

```
PEDIDO
──────
id
usuario_id
fecha
estado
total
```

Los desarrolladores deberán comenzar a comprender la relación:
```
Entidad  -->  Tabla  -->  Columnas / Registros
```

---

## 9. DEFINIR LOS CAMPOS
Cada equipo deberá establecer los campos necesarios para cada tabla.

Por ejemplo:  
**Tabla productos**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| **id** | integer/uuid | Identificador |
| **nombre** | text | Nombre del producto |
| **precio** | numeric | Precio |
| **stock** | integer | Cantidad disponible |
| **activo** | boolean | Estado |

Los campos deberán responder a las necesidades reales del proyecto.

---

## 10. DEFINIR LAS CLAVES PRIMARIAS
Cada tabla deberá contar con un identificador.

Los desarrolladores deberán comprender el concepto de:  
**Clave primaria (Primary Key)**

Por ejemplo:
```
PRODUCTOS
id
1
2
3
4
```
El "id" permitirá identificar de manera única cada registro.

---

## 11. IDENTIFICAR RELACIONES
Cuando existan varias tablas deberán analizar cómo se relacionan.

Por ejemplo:
```
USUARIO (1)  ──────  (N) RESERVA
```
*Un usuario puede realizar muchas reservas.*

Otro ejemplo:
```
PEDIDO
  │ 1
  │
  ↓ N
DETALLE_PEDIDO
```
*Un pedido puede contener varios productos.*

El objetivo es que los estudiantes comiencen a comprender las "relaciones entre tablas".

---

## 12. CREAR LAS TABLAS EN SUPABASE
Una vez definido el modelo, deberán crear las tablas en Supabase.  
Podrán utilizar el Table Editor o el SQL Editor.

Por ejemplo, conceptualmente:
```sql
CREATE TABLE productos (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL
);
```

No se trata de memorizar el código. El desarrollador debe comprender qué está creando:
- `CREATE TABLE` $ightarrow$ Tabla
- `PRIMARY KEY` $ightarrow$ Identificador único
- `TEXT` $ightarrow$ Texto
- `NUMERIC` $ightarrow$ Número decimal
- `INTEGER` $ightarrow$ Número entero

---

## 13. INSERTAR DATOS DE PRUEBA
Cada equipo deberá insertar algunos registros.

Por ejemplo:
```
Productos
1 | Paracetamol | 8.00  | 50
2 | Ibuprofeno  | 15.00 | 30
3 | Aspirina    | 10.00 | 25
```

La finalidad será comprobar que la tabla funciona correctamente antes de conectarla con Flutter.

---

## 14. COMPROBAR LOS DATOS DESDE SUPABASE
Los desarrolladores deberán utilizar el panel de Supabase para:
- Ver registros.
- Crear registros.
- Modificar registros.
- Eliminar registros.

Esto permitirá introducir el concepto de: **CRUD**
- **C** - Create (Crear)
- **R** - Read (Leer)
- **U** - Update (Actualizar)
- **D** - Delete (Eliminar)

---

## 15. COMPRENDER EL CRUD
El flujo será:

```
          BASE DE DATOS
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
    CREATE    READ    UPDATE
       │        │        │
       └────────┼────────┘
                │
                ▼
              DELETE
```

Por ejemplo:
```
Crear producto  -->  Consultar producto  -->  Modificar precio  -->  Eliminar producto
```

El CRUD será uno de los conceptos centrales del desarrollo de la aplicación.

---

## 16. AGREGAR SUPABASE AL PROYECTO FLUTTER
Los desarrolladores deberán incorporar el paquete correspondiente para trabajar con Supabase desde Flutter.

La estructura conceptual será:
```
Flutter  -->  Supabase Flutter SDK  -->  Supabase  -->  PostgreSQL
```

Deberán configurar el proyecto para poder inicializar la conexión.

---

## 17. CONFIGURAR LA CONEXIÓN
Cada equipo deberá configurar los datos necesarios para conectar Flutter con su proyecto de Supabase.

Conceptualmente:
```
URL DEL PROYECTO + CLAVE DE ACCESO  -->  Inicialización  -->  Supabase
```

**Importante:** las credenciales sensibles no deberán colocarse innecesariamente en repositorios públicos.

El objetivo pedagógico en este punto es comprender cómo una aplicación cliente establece comunicación con un servicio backend.

---

## 18. CREAR UN SERVICIO PARA SUPABASE
Siguiendo la organización iniciada en el PDF 5, deberán crear una capa para manejar las operaciones con Supabase.

Por ejemplo:
```
lib/
│
├── screens/
├── widgets/
├── models/
├── services/
│   ├── storage_service.dart
│   └── supabase_service.dart
└── main.dart
```

La idea es evitar colocar todas las consultas directamente dentro de las interfaces.

---

## 19. REALIZAR LA PRIMERA CONSULTA
El primer objetivo será conseguir que Flutter pueda leer información desde Supabase.

El flujo será:
```
Flutter  -->  Solicita productos  -->  Supabase  -->  PostgreSQL
  │                                                      │
  └── ListView  <--  Devuelve productos  <---------------┘
```

La pantalla deberá mostrar información que realmente provenga de la base de datos.

---

## 20. MOSTRAR DATOS DINÁMICOS
Hasta el PDF 5 los desarrolladores podían utilizar:
```
ListView  -->  Datos escritos directamente en el código
```

Ahora deberán trabajar con:
```
ListView  -->  Datos de Supabase  -->  PostgreSQL
```

Por ejemplo:
```
+-----------------------+
| PRODUCTOS             |
|                       |
| Paracetamol    Bs. 8  |
| Ibuprofeno     Bs. 15 |
| Aspirina       Bs. 10 |
+-----------------------+
```

Los datos ya no deberán estar escritos directamente en la interfaz.

---

## 21. IMPLEMENTAR CREATE
Posteriormente deberán implementar una operación de creación.

Por ejemplo:
```
Flutter  -->  Formulario  -->  Usuario introduce datos  -->  [ GUARDAR ]  -->  Supabase  -->  PostgreSQL
```

Ejemplo:
```
Nombre: Paracetamol
Precio: 8
Stock: 50
```

Después de presionar:
```
[ GUARDAR ]
```
el registro deberá aparecer en la tabla correspondiente.

---

## 22. IMPLEMENTAR READ
La aplicación deberá poder consultar los registros almacenados.

Por ejemplo:
```
Base de datos  -->  Consulta  -->  Flutter  -->  Lista
```

Esto permitirá comprobar que la información almacenada en Supabase puede ser recuperada desde la aplicación.

---

## 23. IMPLEMENTAR UPDATE
Cada equipo deberá realizar al menos una operación de actualización.

Por ejemplo:
```
Producto: Paracetamol
Precio: Bs. 8
   ↓
Editar: Precio: Bs. 10
   ↓
Guardar
   ↓
UPDATE  -->  Supabase  -->  PostgreSQL
```

La aplicación deberá reflejar el nuevo valor.

---

## 24. IMPLEMENTAR DELETE
Finalmente deberán implementar una eliminación.

Por ejemplo:
```
Producto: Aspirina
   ↓
Seleccionar: [ ELIMINAR ]
   ↓
Y después:
Aspirina
❌ Eliminada
```

La eliminación deberá comprobarse también desde Supabase.

---

## 25. CONSEGUIR EL CRUD COMPLETO
Como resultado de este avance, cada equipo deberá tener al menos una entidad con operaciones CRUD.

Por ejemplo:
```
SUPABASE
  │
  ├── CREATE
  ├── READ      -->  PRODUCTOS
  ├── UPDATE
  └── DELETE
```

deberá permitir:
- Crear producto.
- Consultar productos.
- Modificar producto.
- Eliminar producto.

---

## 26. CONECTAR EL CRUD CON EL PROYECTO REAL
Este punto es fundamental.  
No deberán realizar un CRUD genérico separado de su proyecto.  
La funcionalidad deberá corresponder a la aplicación desarrollada desde el PDF 1.

Por ejemplo:
- **Sistema de reservas:** CRUD de canchas / CRUD de reservas
- **Sistema de farmacia:** CRUD de productos
- **Sistema de pedidos:** CRUD de productos
- **Sistema de eventos:** CRUD de eventos

De esta manera se mantiene la continuidad del proyecto.

---

## 27. MANEJAR ESTADOS DE CARGA
Cuando la aplicación consulte Supabase, puede existir un tiempo de espera.

Por ello deberán contemplar:
```
+-----------------------+
|                       |
|     Cargando...       |
|          ⌛          |
|                       |
+-----------------------+
```

Una vez obtenidos los datos:
```
+-----------------------+
| PRODUCTOS             |
|                       |
| Paracetamol           |
| Ibuprofeno            |
| Aspirina              |
+-----------------------+
```

---

## 28. MANEJAR ERRORES DE CONEXIÓN
También deberán considerar que una aplicación móvil depende de Internet.

Deberán contemplar al menos:
- **Sin conexión:** ❌ No se pudo obtener la información
- **Error al guardar:** ⚠️ Intente nuevamente

El objetivo es que la aplicación no se cierre inesperadamente ante un problema de comunicación.

---

## 29. REALIZAR PRUEBAS CRUD
Cada equipo deberá realizar pruebas de:

- **Prueba 1 - CREATE:** Crear un registro.
- **Prueba 2 - READ:** Consultar el registro.
- **Prueba 3 - UPDATE:** Modificar el registro.
- **Prueba 4 - DELETE:** Eliminar el registro.
- **Prueba 5 - ERROR:** Simular o controlar un error de conexión o datos inválidos.

---

## 30. ACTUALIZAR GITHUB
Al finalizar deberán registrar el avance:

```bash
git add .
git commit -m "Integración con Supabase y operaciones CRUD"
git push
```

El historial del proyecto deberá evidenciar la evolución:
```
Commit 1: Inicialización
   ↓
Commit 2: Interfaces y navegación
   ↓
Commit 3: Lógica y validaciones
   ↓
Commit 4: Persistencia local
   ↓
Commit 5: Supabase + CRUD
```

---

## 31. ACTUALIZAR EL README
Deberán incorporar una sección:

```markdown
## Backend y base de datos
```

Indicando:
- Plataforma utilizada.
- Base de datos utilizada.
- Tablas creadas.
- Funcionalidad conectada.
- Operaciones CRUD implementadas.
- Estado actual del proyecto.

Por ejemplo:
> La aplicación móvil desarrollada con Flutter se encuentra integrada con Supabase como backend y utiliza PostgreSQL para la persistencia de información. Se implementaron operaciones CRUD sobre la entidad principal del proyecto.

---

## 32. DOCUMENTAR LAS DIFICULTADES
Cada equipo deberá registrar las principales dificultades encontradas. Por ejemplo:

| Dificultad | Análisis | Solución |
| :--- | :--- | :--- |
| La aplicación no podía recuperar los registros de Supabase. | Se revisó la configuración de conexión y la consulta realizada. | Se corrigió la configuración y se verificó nuevamente la consulta. |
| Los datos se guardaban en Supabase, pero no aparecían inmediatamente en Flutter. | — | Se actualizó la información mostrada después de completar la operación. |

---

## 33. EVIDENCIAS DEL AVANCE
Deberán recopilar capturas de:
1. Proyecto creado en Supabase.
2. Tablas creadas.
3. Estructura de las tablas.
4. Registros almacenados.
5. Proyecto Flutter configurado.
6. Conexión con Supabase.
7. Consulta de datos.
8. Creación de registros.
9. Actualización de registros.
10. Eliminación de registros.
11. Aplicación mostrando datos reales.
12. Manejo de estados de carga.
13. Manejo de errores.
14. Repositorio GitHub actualizado.
