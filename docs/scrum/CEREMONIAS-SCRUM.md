# Ceremonias Scrum - Cronograma Express

## Proyecto: Lugares Interactivos (DeporteYa)

> 3 semanas de desarrollo. Reuniones minimas, ejecucion maxima.

---

## 1. Reuniones

| Ceremonia | Cuando | Duracion | Participantes |
|---|---|---|---|
| **Sprint Planning** | Lunes inicio de sprint | 30-45 min | Todo el equipo |
| **Daily async** | Todos los dias (por chat) | 0 min (async) | Todo el equipo |
| **Sync rapido** | Miercoles (si hay bloqueos) | 15 min | Solo quien tenga bloqueos |
| **Sprint Review** | Viernes fin de sprint | 30 min | Todo el equipo |
| **Retrospectiva** | Viernes despues de review | 15 min | Solo equipo dev |

---

## 2. Daily Async (por Chat)

En vez de reuniones diarias, cada persona escribe en el chat (Discord/WhatsApp) **antes de las 10:00 AM**:

```
📝 [Tu nombre] - [Fecha]
- Ayer: [que hiciste]
- Hoy: [que vas a hacer]
- Bloqueo: [si tienes algo que te detiene, o "ninguno"]
```

**Ejemplo:**
```
📝 Nicolas - Martes Dia 2
- Ayer: Cree proyecto Supabase, esquema SQL, seed de datos
- Hoy: AuthContext + probar login
- Bloqueo: ninguno
```

Si alguien reporta un bloqueo, Joaquin coordina una llamada rapida de 15 min.

---

## 3. Sprint Planning (Lunes, 30-45 min)

### Agenda

1. **Revisar tareas del sprint** (10 min)
   - ¿Que se va a hacer esta semana?
   - ¿Quien hace que?

2. **Identificar dependencias** (10 min)
   - ¿Que necesita esperar a que otro termine?
   - ¿Hay tareas que se pueden hacer en paralelo?

3. **Compromiso** (5 min)
   - ¿Todos estan de acuerdo con el plan?
   - ¿Alguna duda o riesgo?

### Planning por Sprint

| Sprint | Lunes | Objetivo |
|---|---|---|
| **S1** | Dia 1 | Supabase listo, auth funcional, datos semilla |
| **S2** | Dia 4 | Todas las pantallas del MVP funcionando |
| **S3** | Dia 9 | MVP pulido, testing completo, entrega |

---

## 4. Sprint Review (Viernes, 30 min)

### Formato

1. **Demo rapida** (20 min)
   - Cada persona muestra lo que hizo en su pantalla
   - Navegar por la app en un dispositivo real

2. **Que falta** (10 min)
   - ¿Que quedo pendiente?
   - ¿Que se mueve al proximo sprint?

### Reviews por Sprint

| Sprint | Viernes | Que demostrar |
|---|---|---|
| **S1** | Dia 3 | App conectada a Supabase, login/registro funcionando |
| **S2** | Dia 8 | App completa: mapa, catalogo, detalle, favoritos, busqueda |
| **S3** | Dia 12 | MVP final: tema pulido, sin bugs criticos |

---

## 5. Retrospectiva (Viernes, 15 min despues de review)

### Formato Rapido: "3 Preguntas"

1. **¿Que funciono bien esta semana?**
2. **¿Que fue dificil?**
3. **¿Que cambiamos para la proxima semana?**

Solo 1-2 acciones concretas. No mas.

---

## 6. Calendario Completo

### Semana 1 (Sprint 1)
| Dia | Fecha | Actividad |
|---|---|---|
| Lunes | Dia 1 | Planning S1 (45 min) + Configuracion |
| Martes | Dia 2 | Desarrollo async |
| Miercoles | Dia 2.5 | Sync rapido si hay bloqueos (15 min) |
| Jueves | Dia 3 | Integracion auth |
| Viernes | Dia 3 | Review S1 (30 min) + Retro (15 min) |

### Semana 2 (Sprint 2)
| Dia | Fecha | Actividad |
|---|---|---|
| Lunes | Dia 4 | Planning S2 (30 min) + Desarrollo |
| Martes | Dia 5 | Desarrollo async |
| Miercoles | Dia 6 | Sync rapido si hay bloqueos (15 min) |
| Jueves | Dia 7 | Desarrollo async |
| Viernes | Dia 8 | Review S2 (30 min) + Retro (15 min) |

### Semana 3 (Sprint 3)
| Dia | Fecha | Actividad |
|---|---|---|
| Lunes | Dia 9 | Planning S3 (30 min) + Tema visual |
| Martes | Dia 10 | Bugs + Rendimiento |
| Miercoles | Dia 11 | Testing final |
| Jueves | Dia 12 | Entrega + Demo |
| Viernes | Dia 12 | Cierre final |

---

## 7. Canales de Comunicacion

| Canal | Uso | Prioridad |
|---|---|---|
| **Grupo WhatsApp/Discord** | Comunicacion diaria, dudas, updates | Alta |
| **GitHub Issues** | Reporte de bugs con capturas | Alta |
| **GitHub Projects** | Tablero kanban del sprint | Media |
| **Llamada rapida** | Solo si hay bloqueos criticos | Baja |
