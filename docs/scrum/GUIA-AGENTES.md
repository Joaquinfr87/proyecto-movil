# Guia de Desarrollo con Agentes de IA

## Proyecto: Lugares Interactivos (DeporteYa)

> Como usar agentes de IA (opencode, Cursor, Copilot, etc.) para desarrollar un MVP funcional de forma rapida y efectiva.

---

## 1. Principios Fundamentales

### El agente es tu junior mas rapido del mundo
- Genera codigo mucho mas rapido que un humano
- No tiene contexto de tu proyecto除非 se lo des
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

> Un agente sin contexto genera codigo generico. Con contexto genera codigo especifico para tu proyecto.

### 2.2 Crea un AGENTS.md en la raiz del proyecto

Este archivo le dice al agente todo sobre tu proyecto. Crea uno con esta estructura:

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

Cada vez que cambies la estructura, tecnologia o convencion, actualiza el archivo. Los agentes leen este archivo antes de generar codigo.

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
- Usa react-native-maps para mostrar ubicacion
- Header con boton de retroceso

Tipos disponibles en src/types/scenario.ts:
- Scenario: { id, nombre, tipo, descripcion, capacidad, direccion, latitud, longitud }
- Sport: { id, nombre }
- Event: { id, nombre, fecha, hora, descripcion }

Supabase client esta en src/services/supabase.ts
```

### 3.3 Prompts que NO funcionan bien

| Mal prompt | Por que no funciona |
|---|---|
| "Crea una app de escenarios deportivos" | Demasiado vago, el agente no sabe por donde empezar |
| "Haz el login" | No dice que tecnologias usar, ni donde poner el archivo |
| "Arregla esto" | No dice que esta mal ni que esperas |
| "Crea todo el proyecto" | El agente no puede mantener contexto de tanto codigo a la vez |

### 3.4 Prompts que SI funcionan

| Buen prompt | Por que funciona |
|---|---|
| "Crea src/services/auth.ts con funciones login y register usando @supabase/supabase-js" | Especifico en ubicacion, nombre y tecnologia |
| "Crea el componente ScenarioCard en src/components/ScenarioCard.tsx que reciba un Scenario y muestre imagen, nombre y tipo" | Dice donde, que nombre, que recibe y que muestra |
| "En src/app/(tabs)/index.tsx, agrega fetch de escenarios desde Supabase y muestra en FlatList" | Dice donde, que hacer y de donde sacar los datos |

---

## 4. Flujo de Trabajo Efectivo

### 4.1 Para cada pantalla, sigue este orden

```
1. Definir que necesita la pantalla (datos, acciones, navegacion)
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
| "Cannot find module" | Verificar import paths, puede que el agente genero la ruta mal |
| "Type 'X' is not assignable" | Los tipos no coinciden, pedir al agente que los ajuste |
| App crashea al abrir pantalla | Revisar que los params de navegacion estan correctos |
| Supabase retorna null | Verificar RLS policies y que los datos existen en la DB |
| Estilos no se aplican | Verificar que StyleSheet.create esta exportado y bien importado |

---

## 5. Patrones de Codigo para Agentes

### 5.1 Servicio de Supabase

Pedir al agente que cree `src/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 5.2 Auth Context

Pedir al agente que cree `src/context/AuthContext.tsx`:

```
Crea un AuthContext que:
- Use supabase.auth.onAuthStateChange para escuchar sesion
- Provea: user, session, signIn(email, password), signUp(email, password, name), signOut
- Loading state mientras verifica sesion
- Redirigir a login si no hay sesion
```

### 5.3 Hook para datos

Pedir al agente que cree hooks como `src/hooks/useScenarios.ts`:

```
Crea un hook useScenarios que:
- Fetch escenarios desde Supabase tabla "escenarios"
- Retorne { scenarios, loading, error, refetch }
- Use useEffect para cargar al montar
- Soporte filtros opcionales por tipo y deporte
```

### 5.4 Pantalla con Expo Router

Pedir al agente que cree pantallas con el formato correcto:

```typescript
// src/app/scenario/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function ScenarioDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // ... logica
}
```

---

## 6. Strategia de Desarrollo con Agentes

### 6.1 Desarrollo en Paralelo

Cada miembro del equipo puede usar un agente en paralelo para generar diferentes partes:

```
Nicolas: "Crea el esquema SQL completo con todas las tablas y RLS"
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

- **Decisiones de arquitectura:** Tu decides la estructura, el agente implementa
- **Configuracion de Supabase:** Hazlo manualmente en el Dashboard
- **Debugging complejo:** Lee los errores tu primero, luego pedi ayuda al agente con contexto
- **Merge de ramas:** Hazlo tu en Git
- **Testing manual:** El agente no puede probar en tu dispositivo

---

## 7. Errores Comunes al Usar Agentes

### 7.1 El agente genera codigo que no compila
**Solucion:** Copia el error completo y pegalo como contexto:
```
El codigo que generaste tiene este error:
[paste el error completo]
Corrigelo.
```

### 7.2 El agente genera codigo con dependencias que no existen
**Solucion:** Antes de pedir codigo, verifica que las dependencias estan en package.json:
```
Antes de generar codigo, verifica que estas dependencias estan instaladas:
- @supabase/supabase-js
- expo-router
- react-native-maps
Si falta alguna, primero crea el archivo con las importaciones correctas.
```

### 7.3 El agente olvida el contexto de archivos anteriores
**Solucion:** Siempre inclui la informacion relevante en tu prompt:
```
Archivo existente en src/services/supabase.ts:
[pega el contenido del archivo]

Ahora crea src/hooks/useScenarios.ts que use el supabase client de arriba.
```

### 7.4 El agente genera demasiado codigo de una vez
**Solucion:** Pide una cosa a la vez:
```
PRIMERO: Solo crea la estructura del componente con los tipos.
DESPUES: Agrega el fetch de datos.
DESPUES: Agrega los estilos.
```

### 7.5 El agente usa practicas que no sigues
**Solucion:** En tu prompt, se explicito sobre convenciones:
```
Usa solo:
- Functional components con hooks
- StyleSheet.create (no styled-components)
- TypeScript estricto
- Imports relativos (no alias)
```

---

## 8. Template de Prompts Reutilizables

### Crear pantalla basica
```
Crea [nombre-pantalla] en [ruta-archivo].

Componentes:
- [lista de componentes que necesita]

Datos:
- Tabla de Supabase: [nombre-tabla]
- Campos: [lista de campos]

Acciones:
- [acciones que puede realizar el usuario]

Navegacion:
- Viene de: [pantalla anterior]
- Navega a: [pantalla siguiente]
```

### Crear componente
```
Crea [NombreComponente] en [ruta].

Props:
- [nombre]: [tipo] - [descripcion]

Renderiza:
- [descripcion visual del componente]

Estilo:
- [descripcion del estilo]
```

### Crear servicio/hook
```
Crea [nombre] en [ruta].

Funcionalidad:
- [que hace]

Depende de:
- [que necesita]

Retorna:
- [que devuelve]
```

### Corregir error
```
En [archivo], tengo este error:

[paste error completo]

El codigo actual es:
[paste codigo relevante]

Corrigelo sin cambiar la funcionalidad.
```

---

## 9. Checklist Antes de Cada Merge

Antes de mergear codigo generado por un agente:

- [ ] El codigo compila (`npx expo start` sin errores)
- [ ] No hay imports de paquetes que no existen
- [ ] Los tipos de TypeScript son correctos
- [ ] Los paths de navegacion son correctos
- [ ] Supabase client esta configurado correctamente
- [ ] Los estilos se ven razonablemente bien
- [ ] La funcionalidad basica funciona (click, navegar, cargar datos)
- [ ] No hay console.logs innecesarios
- [ ] Los archivos estan en la ubicacion correcta de la estructura

---

## 10. Recursos

- **Expo Docs:** https://docs.expo.dev
- **Supabase Docs:** https://supabase.com/docs
- **React Native Docs:** https://reactnative.dev
- **Expo Router:** https://docs.expo.dev/router/introduction
- **Supabase JS:** https://supabase.com/docs/reference/javascript
