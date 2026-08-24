# Asignacion de Tareas - Sprint 3 (FINAL)

## Proyecto: Lugares Interactivos (DeporteYa)

> **Sprint 3:** Cierre, Gestion de Contenido y Entrega
> **Regla clave:** Ultimo sprint. Congelamiento de codigo el viernes. Cerrar > perfeccionar.
> **T-040 es bloqueante:** sin el cloud sincronizado no hay demo ni admin funcional.

---

## Joaquin Alessandro Felipez Rojas - Scrum Master / Lider Tecnico

### Responsabilidades
- Definir y centralizar la logica de permisos por rol
- Code review final de todo el proyecto antes del tag v1.0.0-mvp
- Documentacion de entrega (README, guion de demo)
- Aprobar o rechazar los merges a develop

### Tareas Asignadas

| ID | Tarea | Dependencias |
|----|-------|--------------|
| **T-046** | Permisos finos por rol (helper centralizado + RLS migracion 009) | T-042, T-043, T-044 |
| **T-048** | QA final sobre el APK (con Angel), checklist MVP completo | T-047 |
| **T-049** | README.md con guia completa de instalacion y ejecucion | T-040 |
| **T-051** | Guion de demo final de 5 minutos (con David) | T-048 |
| **T-052** | Code review final, merge de ramas sueltas y tag `v1.0.0-mvp` | Todas |

### Orden de ejecucion sugerido
1. T-049 (README) → puede empezar ya, solo depende de T-040 para la seccion cloud
2. T-046 (permisos) → cuando David y Angel tengan pantallas que proteger
3. T-048 + T-051 + T-052 → ultima fase del sprint

---

## Nicolas Sebastian Reguerin Meneses - Desarrollador Full Stack

### Responsabilidades
- Sincronizar el proyecto cloud (migraciones + imagenes)
- Agregar horarios al esquema y a la app
- Construir y distribuir el APK

### Tareas Asignadas (en orden)

| ID | Tarea | Grupo | Dependencias |
|----|-------|-------|--------------|
| **T-040** | Sincronizar cloud: link, db push (005-007) y subir 35 imagenes al bucket | Cierre | Ninguna |
| **T-041** | Horarios: migration 008, seed, tipos y seccion en detalle | Cierre | T-040 |
| **T-047** | Build APK EAS e instalacion en minimo 2 celulares (con David) | Distribucion | T-040..T-046 |

### Orden de ejecucion sugerido
1. T-040 (cloud sync) → BLOQUEANTE, primero del sprint
2. T-041 (horarios) → cierra el gap del MVP
3. T-047 (APK) → cuando todas las features esten mergeadas

---

## David Willy Cruz Huanca - Desarrollador Full Stack

### Responsabilidades
- Pantalla de gestion de contenido para staff
- Seccion de proximos eventos en Inicio
- Build y distribucion del APK
- Co-producir el guion de demo

### Tareas Asignadas (en orden)

| ID | Tarea | Grupo | Dependencias |
|----|-------|-------|--------------|
| **T-042** | Pantalla "Gestion" con lista de escenarios segun rol | Contenido | T-041 |
| **T-045** | Seccion "Proximos eventos" en Inicio (cierra RF-09 sin push) | Contenido | T-044 |
| **T-047** | Build APK EAS e instalacion (con Nicolas) | Distribucion | T-040..T-046 |
| **T-051** | Guion de demo final (con Joaquin) | Entrega | T-048 |

### Orden de ejecucion sugerido
1. T-042 (pantalla gestion) → base para Angel (formulario y eventos)
2. T-045 (proximos eventos) → cuando Angel tenga el CRUD de eventos
3. T-047 (APK) → congelamiento de codigo
4. T-051 (guion demo) → cierre

---

## Angel Gabriel Rojas Hinojosa - Desarrollador Junior / QA

### Responsabilidades
- Formularios de creacion/edicion de escenarios y eventos
- Testing final sobre el APK instalado
- Capturas de pantalla para los capitulos de la tesis

### Tareas Asignadas (en orden)

| ID | Tarea | Grupo | Dependencias |
|----|-------|-------|--------------|
| **T-043** | Formulario crear/editar escenario con selector de ubicacion en mapa | Contenido | T-042 |
| **T-044** | CRUD de eventos por escenario desde detalle/gestion | Contenido | T-042 |
| **T-048** | QA final sobre el APK (con Joaquin): checklist MVP completo | Distribucion | T-047 |
| **T-050** | Capturas de pantalla de todas las pantallas para la tesis | Entrega | T-047 |

### Por que estas tareas para el junior
- Los formularios reutilizan patrones ya existentes (TextInput validados, chips, modales)
- El selector de ubicacion reutiliza la config MapLibre que David ya dejo en index.tsx
- QA sobre checklist cerrado: no requiere decisiones de diseno
- Las capturas son mecanicas pero necesarias para la entrega academica

---

## Flujo Paralelo del Sprint

```
Semana completa:

Nicolas:  T-040 ──> T-041 ──────────────> T-047 ──┐
                       │                          │
David:            T-042 ──> T-045 ───────────> T-047 ──> T-051
                       │        │                │
Angel:                 T-043 ──> T-044 ────────> T-048 ──> T-050
                                                        
Joaquin:  T-049 ──> T-046 ──────────────────> T-048 ──> T-051 ──> T-052
```

### Puntos de sincronizacion
1. **Fin del dia 1:** T-040 lista. Todo el equipo puede probar contra cloud.
2. **Mitad de semana:** T-042 + T-043 + T-044 mergeados. T-045 y T-046 cierran el modulo de gestion.
3. **Viernes manana:** congelamiento. Solo bug fixes. Nicolas + David generan el APK.
4. **Viernes tarde:** T-048 QA sobre APK, T-050 capturas, T-052 tag final.

---

## Matriz de Asignacion Final

| Tarea | Joaquin | Nicolas | David | Angel |
|-------|---------|---------|-------|-------|
| T-040 Sync cloud | I | **R** | C | - |
| T-041 Horarios | C | **R** | - | - |
| T-042 Pantalla Gestion | C | - | **R** | - |
| T-043 Form escenario | C | - | C | **R** |
| T-044 CRUD eventos | C | - | C | **R** |
| T-045 Proximos eventos | - | - | **R** | C |
| T-046 Permisos + RLS | **R** | C | C | I |
| T-047 APK EAS | - | **R** | **R** | - |
| T-048 QA final APK | **R** | - | - | **R** |
| T-049 README | **R** | C | C | - |
| T-050 Capturas tesis | C | - | - | **R** |
| T-051 Guion demo | **R** | - | **R** | - |
| T-052 Review final + tag | **R** | C | C | C |

**R** = Responsable, **C** = Consultado, **I** = Informado
