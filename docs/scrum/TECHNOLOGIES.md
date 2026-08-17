# Tecnologias y Herramientas

## Proyecto: Lugares Interactivos (DeporteYa)

> Stack tecnologico completo para el desarrollo del MVP.

---

## 1. Stack Principal

### Frontend

| Tecnologia | Version | Uso | Docs |
| --- | --- | --- | --- |
| **React Native** | 0.86 | Framework UI movil multiplataforma | https://reactnative.dev |
| **Expo SDK** | 57 | Plataforma de desarrollo para React Native | https://docs.expo.dev |
| **Expo Router** | 57 | Navegacion basada en archivos (file-based) | https://docs.expo.dev/router |
| **TypeScript** | 6.0 | Tipado estatico para JavaScript | https://www.typescriptlang.org |

### Backend (BaaS)

| Tecnologia | Uso | Docs |
| --- | --- | --- |
| **Supabase** | Backend completo: Auth, PostgreSQL, PostGIS, Storage, Realtime | https://supabase.com/docs |
| **@supabase/supabase-js** | Cliente JavaScript para conectar desde la app | https://supabase.com/docs/reference/javascript |
| **Supabase CLI** | Herramienta de desarrollo local y migraciones | https://supabase.com/docs/guides/local-development/cli |

---

## 2. Librerias de Produccion

### Validacion y Formularios

| Paquete | Uso | Ejemplo |
| --- | --- | --- |
| **zod** | Definir esquemas de validacion y tipos | Validar formularios, respuestas de API |
| **react-hook-form** | Gestion de formularios con performance | Formularios de login, registro, busqueda |
| **@hookform/resolvers** | Integrar Zod con React Hook Form | `zodResolver(schema)` |

**Ejemplo de uso:**
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Definir esquema
const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
});

// Tipar el formulario
type LoginFormData = z.infer<typeof loginSchema>;

// Usar en el componente
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

### Data Fetching y Caching

| Paquete | Uso | Docs |
| --- | --- | --- |
| **@tanstack/react-query** | Fetch, cache, sincronizar datos del servidor | https://tanstack.com/query/latest |

**Por que usar React Query con Supabase:**
- Cacheautomatico de queries
- Refetch en background
- Loading y error states listos
- Optimistic updates para favoritos
- Paginacion y infinite scroll

**Ejemplo de uso:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

// Query: obtener escenarios
function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('escenarios').select('*');
      if (error) throw error;
      return data;
    },
  });
}

// Mutation: agregar favorito
function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, scenarioId }: { userId: string; scenarioId: string }) => {
      const { error } = await supabase.from('favoritos').insert({
        usuario_id: userId,
        escenario_id: scenarioId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
```

### Almacenamiento

| Paquete | Uso | Docs |
| --- | --- | --- |
| **@react-native-async-storage/async-storage** | Storage local no sensible (preferencias, cache) | https://react-native-async-storage.github.io/async-storage |
| **expo-secure-store** | Storage encriptado (tokens, credenciales) | https://docs.expo.dev/versions/latest/sdk/securestore/ |

**Cuando usar cual:**
- **AsyncStorage**: preferencias de UI, cache de datos, estado temporal
- **SecureStore**: tokens de sesion, refresh tokens, datos sensibles

### UI y Media

| Paquete | Uso | Docs |
| --- | --- | --- |
| **expo-image** | Image loading con cache y placeholders | https://docs.expo.dev/versions/latest/sdk/image/ |
| **expo-font** | Cargar fuentes personalizadas | https://docs.expo.dev/versions/latest/sdk/font/ |
| **react-native-svg** | Renderizar SVGs (iconos, graficos) | https://github.com/software-mansion/react-native-svg |
| **react-native-reanimated** | Animaciones de 60fps en background thread | https://docs.expo.dev/versions/latest/sdk/reanimated/ |
| **react-native-gesture-handler** | Gestos nativos (swipe, pinch, drag) | https://docs.expo.dev/versions/latest/sdk/gesture-handler/ |

---

## 3. Herramientas de Desarrollo

### Linting y Formatting

| Paquete | Uso | Comando |
| --- | --- | --- |
| **ESLint** | Detectar errores y malas practicas | `pnpm lint` |
| **Prettier** | Formateo automatico de codigo | `pnpm format` |
| **eslint-config-expo** | Reglas ESLint optimizadas para Expo | Config en `.eslintrc.js` |
| **eslint-config-prettier** | Desactivar reglas de ESLint que chocan con Prettier | Config en `.eslintrc.js` |

**Configuracion de Prettier** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Scripts disponibles:**
```bash
pnpm lint          # Ver errores
pnpm lint:fix      # Corregir errores automaticamente
pnpm format        # Formatear todo el codigo
pnpm format:check  # Verificar si esta formateado
```

### TypeScript

| Config | Valor | Por que |
| --- | --- | --- |
| `strict: true` | Obligatorio | Detecta bugs en tiempo de compilacion |
| `noUncheckedIndexedAccess` | Recomendado | Array[i] puede ser undefined |

**Generar tipos desde Supabase:**
```bash
pnpm db:types
# Genera src/types/database.ts con los tipos de todas las tablas
```

### Supabase CLI

| Comando | Uso |
| --- | --- |
| `pnpm supabase start` | Levantar Supabase local |
| `pnpm supabase stop` | Detener Supabase local |
| `pnpm supabase db reset` | Resetear DB (migraciones + seed) |
| `pnpm supabase db push` | Push migraciones al cloud |
| `pnpm supabase db pull` | Traer esquema del cloud |
| `pnpm supabase db diff` | Ver diferencia local vs cloud |
| `pnpm supabase config push` | Push config.toml al cloud |
| `pnpm supabase config pull` | Traer config del cloud |

---

## 4. Estructura de Directorios

```
src/
├── app/                    # Pantallas (Expo Router - file-based routing)
│   ├── _layout.tsx         # Layout raiz (providers + stack)
│   ├── (tabs)/             # Navegacion por tabs
│   │   ├── _layout.tsx     # Config de tabs
│   │   ├── index.tsx       # Tab: Inicio (mapa)
│   │   ├── search.tsx      # Tab: Buscar
│   │   ├── favorites.tsx   # Tab: Favoritos
│   │   └── profile.tsx     # Tab: Perfil
│   ├── auth/               # Pantallas de autenticacion
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── scenario/           # Detalle de escenario
│       └── [id].tsx        # Ruta dinamica: /scenario/123
├── components/             # Componentes reutilizables
│   ├── common/             # Botones, Inputs, Cards
│   └── layout/             # Headers, Headers
├── context/                # React Context (estado global)
│   └── AuthContext.tsx      # Sesion de usuario
├── hooks/                  # Custom hooks
│   ├── useScenarios.ts     # Hook para escenarios
│   ├── useFavorites.ts     # Hook para favoritos
│   └── useLocation.ts      # Hook para geolocalizacion
├── services/               # Conexion con servicios externos
│   └── supabase.ts         # Cliente de Supabase
├── theme/                  # Tema visual
│   ├── colors.ts           # Paleta de colores
│   ├── spacing.ts          # Espaciado y tipografia
│   └── index.ts            # Exportaciones
└── types/                  # Definiciones de tipos
    ├── database.ts          # Tipos de Supabase (generados)
    └── index.ts             # Tipos de la app
```

---

## 5. Convenciones de Codigo

### Naming

| Tipo | Convencion | Ejemplo |
| --- | --- | --- |
| Archivos de componentes | PascalCase | `ScenarioCard.tsx` |
| Archivos de hooks | camelCase con `use` | `useScenarios.ts` |
| Archivos de servicios | camelCase | `supabase.ts` |
| Archivos de tipos | camelCase | `database.ts` |
| Variables | camelCase | `scenarioName` |
| Componentes | PascalCase | `ScenarioCard` |
| Funciones | camelCase | `fetchScenarios` |
| Types/Interfaces | PascalCase | `Scenario`, `UserData` |
| Constantes | UPPER_SNAKE_CASE | `API_URL` |
| Enums | PascalCase | `UserRole` |

### Imports

```typescript
// 1. React y React Native
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Librerias externas
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Componentes internos
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

// 4. Servicios y hooks
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

// 5. Tema y tipos
import { colors, spacing } from '../theme';
import type { Scenario } from '../types';

// 6. Estilos (al final)
import { styles } from './styles';
```

### Componentes

```typescript
// Componente funcional con tipos
interface ScenarioCardProps {
  scenario: Scenario;
  onPress: (id: string) => void;
}

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(scenario.id)}>
      <View style={styles.card}>
        <Text style={styles.title}>{scenario.nombre}</Text>
        <Text style={styles.subtitle}>{scenario.tipo}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
```

### Manejo de Errores

```typescript
// Siempre usar try-catch o .catch() en llamadas a Supabase
async function fetchScenarios() {
  const { data, error } = await supabase
    .from('escenarios')
    .select('*');

  if (error) {
    console.error('Error fetching scenarios:', error.message);
    throw new Error(error.message);
  }

  return data;
}

// En componentes, usar Error Boundaries o estados de error
function ScenarioList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return <FlatList data={data} renderItem={...} />;
}
```

---

## 6. Scripts Disponibles

| Comando | Descripcion |
| --- | --- |
| `pnpm start` | Iniciar Expo |
| `pnpm android` | Abrir en Android |
| `pnpm ios` | Abrir en iOS |
| `pnpm web` | Abrir en navegador |
| `pnpm lint` | Ver errores ESLint |
| `pnpm lint:fix` | Corregir errores ESLint |
| `pnpm format` | Formatear codigo con Prettier |
| `pnpm format:check` | Verificar formateo |
| `pnpm db:start` | Levantar Supabase local |
| `pnpm db:stop` | Detener Supabase local |
| `pnpm db:reset` | Resetear DB |
| `pnpm db:push` | Push migraciones al cloud |
| `pnpm db:pull` | Traer esquema del cloud |
| `pnpm db:types` | Generar tipos TypeScript |
| `pnpm config:push` | Push config al cloud |
| `pnpm config:pull` | Traer config del cloud |

---

## 7. Referencia Rapida de Zod

### Esquemas basicos

```typescript
import { z } from 'zod';

// String
z.string().min(1, 'Requerido');
z.string().email('Email invalido');

// Number
z.number().positive();
z.number().min(0).max(100);

// Boolean
z.boolean();

// Array
z.array(z.string());

// Object
z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  edad: z.number().int().positive(),
});

// Enum
z.enum(['admin', 'gestor', 'asistente']);

// Optional
z.string().optional();

// Default
z.string().default('');

// Refine (validacion custom)
z.string().refine((val) => val.length >= 8, {
  message: 'Minimo 8 caracteres',
});
```

### Integrar con React Hook Form

```typescript
const schema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
  nombre: z.string().min(1, 'Nombre requerido'),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});

// errors.email?.message -> "Email invalido"
```

### Validar respuesta de Supabase

```typescript
const scenarioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  tipo: z.string(),
  latitud: z.number(),
  longitud: z.number(),
});

const scenariosSchema = z.array(scenarioSchema);

async function fetchScenarios() {
  const { data, error } = await supabase.from('escenarios').select('*');
  if (error) throw error;

  // Validar que los datos cumplen el esquema
  return scenariosSchema.parse(data);
}
```

---

## 8. Referencia Rapida de React Query

### Queries

```typescript
function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

### Mutations

```typescript
function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
}
```

### En componentes

```typescript
function ScenarioList() {
  const { data, isLoading, error } = useScenarios();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ScenarioCard scenario={item} />}
    />
  );
}
```

---

## 9. Links Utiles

| Recurso | URL |
| --- | --- |
| Expo Docs | https://docs.expo.dev |
| Expo Router | https://docs.expo.dev/router |
| React Native Docs | https://reactnative.dev |
| Supabase Docs | https://supabase.com/docs |
| Supabase JS Reference | https://supabase.com/docs/reference/javascript |
| Zod Docs | https://zod.dev |
| React Query Docs | https://tanstack.com/query/latest |
| React Hook Form | https://react-hook-form.com |
| AsyncStorage | https://react-native-async-storage.github.io/async-storage |
| ESLint Rules | https://eslint.org/docs/rules/ |
| Prettier Options | https://prettier.io/docs/en/options.html |
