# Guia de Desarrollo con Agentes de IA

## Proyecto: Lugares Interactivos (DeporteYa)

> Como usar agentes de IA (opencode, Cursor, Copilot, etc.) para desarrollar un MVP funcional de forma rapida y efectiva.

---

## 1. Principios Fundamentales

### El agente es tu junior mas rapido del mundo
- Genera codigo mucho mas rapido que un humano
- No tiene contexto de tu proyecto a menos que se lo des
- Puede generar codigo que compila pero no funciona
- **Tu supervision es obligatoria.** Nunca confies ciegamente.

### Regla de oro
```
TU defines QUE construir.
EL AGENTE construye.
TU verificas QUE FUNCIONA.
```

---

## 2. Preparacion Antes de Usar Agentes

### 2.1 Ten documentacion clara del proyecto

Antes de pedirle al agente que genere codigo, asegurate de tener:

- **README** con que es el proyecto y para que sirve
- **Descripcion de pantallas** (que hay en cada una)
- **Modelo de datos** (tablas, relaciones, campos)
- **Tecnologias** (Expo, Supabase, etc.)

### 2.2 Crea un AGENTS.md en la raiz del proyecto

Este archivo le dice al agente todo sobre tu proyecto:

```markdown
# AGENTS.md - Contexto del Proyecto

## Que es este proyecto
App movil con Expo + React Native que muestra escenarios deportivos
en un mapa interactivo. Backend es Supabase (sin API custom).

## Tecnologias
- Frontend: React Native, Expo SDK 57, TypeScript
- Backend: Supabase (Auth, PostgreSQL, PostGIS, Storage)
- Navegacion: Expo Router
- Mapa: react-native-maps
- Estado: React Context (no Redux)

## Estructura de carpetas
src/
  app/          # Pantallas (Expo Router)
  components/   # Componentes reutilizables
  services/     # Conexion con Supabase
  hooks/        # Custom hooks
  types/        # Tipos TypeScript
  theme/        # Colores, tipografia

## Convenciones
- Todo en TypeScript
- Componentes funcionales con hooks
- Nombres en camelCase para variables, PascalCase para componentes
- CSS con StyleSheet (no styled-components)
- Supabase client en services/supabase.ts
```

### 2.3 Manten el AGENTS.md actualizado

Cada vez que cambies la estructura, tecnologia o convencion, actualiza el archivo.

---

## 3. Como Pedir Codigo al Agente

### 3.1 Secuencia de prompts para una pantalla

**Paso 1: Pedir la estructura base**
```
Crea la pantalla de [nombre] en src/app/[ruta].tsx
- Usa Expo Router
- Usa React Native con TypeScript
- Usa los tipos de src/types/[archivo].ts
- Incluye [componentes que necesita]
- Conecta a Supabase para [operacion]
```

**Paso 2: Pedir la logica**
```
Agrega a la pantalla [nombre]:
- Fetch de datos desde Supabase tabla [tabla]
- Loading state con ActivityIndicator
- Error state con mensaje amigable
- FlatList para mostrar [datos]
- Pull-to-refresh
```

**Paso 3: Pedir el estilo**
```
Estiliza la pantalla [nombre]:
- Usa colores del theme (importar de src/theme/colors.ts)
- Header con titulo y boton de retroceso
- Cards con sombra y bordes redondeados
- Espaciado consistente (16px base)
```

### 3.2 Ejemplo de prompt completo

```
Crea la pantalla de detalle de escenario en src/app/scenario/[id].tsx.

Contexto:
- Recibe el ID del escenario por URL params
- Consulta la tabla "escenarios" en Supabase
- Tambien consulta "escenario_deportes" y "eventos"
- Muestra: nombre, imagen, descripcion, capacidad, direccion,
  deportes, horarios, eventos
- Tiene boton de favorito (tabla "favoritos")
- Header con boton de retroceso

Tipos disponibles en src/types/scenario.ts:
- Scenario: { id, nombre, tipo, descripcion, capacidad, direccion, latitud, longitud }

Supabase client esta en src/services/supabase.ts
```

### 3.3 Prompts que NO funcionan

| Mal prompt | Por que |
|---|---|
| "Crea una app de escenarios deportivos" | Demasiado vago |
| "Haz el login" | No dice tecnologia ni ubicacion |
| "Arregla esto" | No dice que esta mal |
| "Crea todo el proyecto" | Demasiado de una vez |

### 3.4 Prompts que SI funcionan

| Buen prompt | Por que funciona |
|---|---|
| "Crea src/services/auth.ts con funciones login y register usando @supabase/supabase-js" | Especifico en ubicacion y tecnologia |
| "Crea ScenarioCard en src/components/ScenarioCard.tsx que reciba Scenario y muestre imagen, nombre y tipo" | Dice donde, que nombre, que recibe |
| "En src/app/(tabs)/index.tsx, agrega fetch de escenarios desde Supabase y muestra en FlatList" | Dice donde, que hacer y de donde |

---

## 4. Flujo de Trabajo Efectivo

### 4.1 Para cada pantalla

```
1. Definir que necesita (datos, acciones, navegacion)
2. Pedir al agente que cree la pantalla base
3. Revisar si compila (npx expo start)
4. Pedir logica de datos (fetch, mutaciones)
5. Probar en el emulador/dispositivo
6. Pedir estilos
7. Probar de nuevo
8. Merge a develop
```

### 4.2 Para cada funcionalidad de Supabase

```
1. Crear la tabla en Supabase Dashboard (o pedir SQL al agente)
2. Configurar RLS policies
3. Probar en Supabase Dashboard (SQL editor)
4. Pedir al agente que cree el servicio en el frontend
5. Probar la integracion
```

### 4.3 Manejo de errores comunes

| Error | Solucion |
|---|---|
| "Cannot find module" | Verificar import paths |
| "Type 'X' is not assignable" | Los tipos no coinciden, pedir ajuste |
| App crashea al abrir pantalla | Revisar params de navegacion |
| Supabase retorna null | Verificar RLS policies y datos existentes |
| Estilos no se aplican | Verificar StyleSheet.create y imports |

---

## 5. Patrones de Codigo para Agentes

### 5.1 Servicio de Supabase

Pedir que cree `src/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 5.2 Auth Context

Pedir que cree `src/context/AuthContext.tsx`:

```
Crea un AuthContext que:
- Use supabase.auth.onAuthStateChange para escuchar sesion
- Provea: user, session, signIn, signUp, signOut
- Loading state mientras verifica sesion
- Redirigir a login si no hay sesion
```

### 5.3 Hook para datos

Pedir que cree `src/hooks/useScenarios.ts`:

```
Crea useScenarios que:
- Fetch escenarios desde Supabase tabla "escenarios"
- Retorne { scenarios, loading, error, refetch }
- Use useEffect para cargar al montar
- Soporte filtros opcionales
```

### 5.4 Pantalla con Expo Router

```typescript
// src/app/scenario/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function ScenarioDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // ... logica
}
```

---

## 6. Estrategia de Desarrollo con Agentes

### 6.1 Desarrollo en Paralelo

Cada miembro usa un agente para diferentes partes:

```
Nicolas: "Crea el esquema SQL completo con tablas y RLS"
David:   "Crea la navegacion con Expo Router: tabs + stack"
Angel:   "Crea las pantallas de login y register con Supabase Auth"
```

### 6.2 Iteracion Rapida

```
Iteracion 1: Agente genera codigo base (5 min)
Iteracion 2: Tu revisas y pides ajustes (10 min)
Iteracion 3: Pruebas en dispositivo (5 min)
Iteracion 4: Fix final con agente (5 min)
Total: ~25 min por pantalla (vs 2-3 horas manual)
```

### 6.3 Cuando NO usar el agente

- Decisiones de arquitectura
- Configuracion de Supabase (Dashboard)
- Debugging complejo (lee errores tu primero)
- Merge de ramas
- Testing manual

---

## 7. Errores Comunes al Usar Agentes

### 7.1 Codigo que no compila
**Solucion:** Copia el error completo:
```
El codigo que generaste tiene este error:
[paste el error]
Corrigelo.
```

### 7.2 Dependencias que no existen
**Solucion:** Verifica antes:
```
Verifica que estas dependencias estan en package.json:
- @supabase/supabase-js
- expo-router
- react-native-maps
```

### 7.3 Olvida el contexto
**Solucion:** Inclui info relevante en el prompt:
```
Archivo existente en src/services/supabase.ts:
[pega contenido]

Ahora crea src/hooks/useScenarios.ts que use este supabase client.
```

### 7.4 Genera demasiado codigo
**Solucion:** Pide una cosa a la vez:
```
PRIMERO: Solo crea la estructura con tipos.
DESPUES: Agrega fetch de datos.
DESPUES: Agrega estilos.
```

---

## 8. Templates de Prompts Reutilizables

### Crear pantalla
```
Crea [nombre-pantalla] en [ruta].

Componentes: [lista]
Datos: Tabla [nombre], campos [lista]
Acciones: [acciones del usuario]
Navegacion: Viene de [pantalla], navega a [pantalla]
```

### Crear componente
```
Crea [NombreComponente] en [ruta].

Props: [nombre]: [tipo] - [descripcion]
Renderiza: [descripcion visual]
Estilo: [descripcion]
```

### Crear servicio/hook
```
Crea [nombre] en [ruta].

Funcionalidad: [que hace]
Depende de: [que necesita]
Retorna: [que devuelve]
```

### Corregir error
```
En [archivo], tengo este error:
[paste error]

Codigo actual:
[paste codigo]

Corrigelo sin cambiar la funcionalidad.
```

---

## 9. Checklist Antes de Merge

- [ ] El codigo compila
- [ ] No hay imports de paquetes inexistentes
- [ ] Los tipos TypeScript son correctos
- [ ] Los paths de navegacion son correctos
- [ ] Supabase client esta configurado
- [ ] Los estilos se ven razonablemente bien
- [ ] La funcionalidad basica funciona
- [ ] No hay console.logs innecesarios
- [ ] Los archivos estan en la ubicacion correcta

---

## 10. Recursos

- **Expo Docs:** https://docs.expo.dev
- **Supabase Docs:** https://supabase.com/docs
- **React Native Docs:** https://reactnative.dev
- **Expo Router:** https://docs.expo.dev/router/introduction
- **Supabase JS:** https://supabase.com/docs/reference/javascript
