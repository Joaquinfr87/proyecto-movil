# Guia para Correr la App en tu Celular (Expo + Android)

## 1. Requisitos Previos

Ya tienes leido el README del proyecto, asi que deberias tener Node.js, pnpm y las dependencias basicas instaladas.

Lo que **adicionalmente** necesitas:

- **Android Studio** instalado (con SDK Manager y AVD Manager)
- **JDK 17** (`openjdk version "17.0.x"` o superior 17.x)

Para verificar que los tienes:

```bash
# Verificar Java
java -version

# Verificar Android SDK
ls ~/Android/Sdk/platforms/
```

Si no tienes JDK 17:

```bash
# CachyOS / Arch Linux
sudo pacman -S jdk17-openjdk

# Ubuntu / Debian
sudo apt install openjdk-17-jdk
```

## 2. Variables de Entorno del Sistema

Necesitas tener configuradas estas variables en tu `~/.zshrc` (o `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

Despues de agregarlas, recarga tu terminal:

```bash
source ~/.zshrc
```

Verifica:

```bash
echo $ANDROID_HOME
# Debe mostrar: /home/TU_USUARIO/Android/Sdk

java -version
# Debe mostrar: openjdk version "17.0.x"
```

## 3. Variables de Entorno del Proyecto

Crea un archivo `.env` en la raiz del proyecto con el siguiente contenido:

```
# Supabase - Produccion
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key-aqui

# MapTiler - Mapas gratuitos (100k cargas/mes, sin tarjeta de credito)
EXPO_PUBLIC_MAPTILER_API_KEY=jR9MqSVaj9mAgJfOIRaz
```

> **Nota:** Reemplaza `TU-PROYECTO` y `tu-supabase-anon-key-aqui` con los datos reales de tu proyecto Supabase. Consulta con el equipo para obtenerlos.
>
> El API key de MapTiler ya viene indicado arriba. Es gratuito (100,000 cargas/mes) y no necesita tarjeta de credito.

## 4. Prebuild Nativo

Antes de correr la app por primera vez, necesitas generar la carpeta `android/`:

```bash
pnpm exec expo prebuild --clean
```

Esto genera toda la configuracion nativa de Android (gradle, manifest, etc.).

> **Cuando ejecutar esto de nuevo:** Solo si cambias algo en `app.json` (plugins, permisos, nombre del paquete, etc.).

## 5. Conectar tu Celular

1. En tu celular, ve a **Ajustes > Acerca del telefono** y toca 7 veces el **Numero de compilacion** hasta que active las **Opciones de desarrollador**.

2. En **Ajustes > Opciones de desarrollador**:
   - Activa **Depuracion por USB**
   - Activa **Permitir via USB**

3. Conecta el celular al PC con cable USB.

4. En tu terminal, verifica que aparece conectado:

```bash
adb devices
```

Deberia mostrar algo como:

```
List of devices attached
XXXXXXXX    device
```

Si aparece `unauthorized`, desenchufa y vuelve a enchufar el celular. Acepta la alerta que aparece en la pantalla del telefono.

Si `adb` no se encuentra, asegurate de que `ANDROID_HOME` esta configurado (ver paso 2).

## 6. Compilar e Instalar la App

Con el celular conectado, ejecuta:

```bash
pnpm exec expo run:android
```

Esto:
1. Compila el codigo nativo de Android con Gradle (puede tardar 3-5 minutos la primera vez)
2. Instala la app en tu celular
3. Abre la app automaticamente

> **Importante:** Se usa `expo run:android` (build nativo) y **NO** Expo Go, porque la app usa librerias nativas (MapLibre, expo-location, etc.) que no estan soportadas en Expo Go.
>
> **Si ves `ERR_PNPM_IGNORED_BUILDS`:** Ejecuta `pnpm approve-builds dtrace-provider` antes de continuar (ver seccion 8).

## 7. Tecnologias del Mapa

### MapLibre (`@maplibre/maplibre-react-native`)

Se usa **MapLibre** en vez de `react-native-maps` por estas razones:

- **No necesita API key de Google Maps** (no requiere tarjeta de credito ni cuenta de Google Cloud).
- Es open-source (fork de Mapbox GL).
- Soporta vectores, raster, y estilos personalizados.

### MapTiler (Proveedor de Tiles)

**MapTiler** es el servicio que provee los mapas (calles, ciudades, etc.).

- Plan gratuito: **100,000 cargas/mes** sin tarjeta de credito.
- API Key del proyecto: `jR9MqSVaj9mAgJfOIRaz` (ya esta en el `.env`).
- Documentacion: https://maptiler.com

### Como funciona

1. La app descarga un **style JSON** desde MapTiler que define como se ve el mapa.
2. MapLibre renderiza los **tiles** (imagenes de mapa por secciones) en el celular.
3. Los marcadores de escenarios se dibujan encima del mapa usando el componente `<Marker>`.

## 8. Errores Comunes y Soluciones

### `ERR_PNPM_IGNORED_BUILDS` (dtrace-provider)

**Causa:** pnpm v10+ bloquea scripts de build de paquetes por defecto por seguridad. El paquete `dtrace-provider` (usado por Supabase CLI) necesita compilarse.

**Solucion:**
```bash
# Aprobar el build del paquete
pnpm approve-builds dtrace-provider

# Luego ejecutar la app normalmente
pnpm exec expo run:android
```

> **Nota:** Este error solo aparece la primera vez. Una vez aprobado, no vuelve a salir.

### Mapa en negro

**Causa:** El estilo del mapa no se esta cargando correctamente.

**Soluciones:**
- Verifica que `EXPO_PUBLIC_MAPTILER_API_KEY` este bien escrito en `.env`.
- Verifica que tu celular tenga conexion a internet.
- Ejecuta de nuevo: `pnpm exec expo prebuild --clean && pnpm exec expo run:android`

### "0 escenarios encontrados"

**Causa:** La sesion de Supabase no se persiste correctamente o los datos no estan en la base de datos.

**Soluciones:**
- Asegurate de que el `.env` tenga las credenciales correctas de Supabase.
- Haz logout y vuelve a hacer login para renovar la sesion.
- Verifica en el dashboard de Supabase (https://supabase.com) que la tabla `scenarios` tenga datos.
- Si es la primera vez, ejecuta las migraciones y seed de Supabase.

### `adb` no encontrado

**Causa:** `ANDROID_HOME` no esta configurado o no apunta al directorio correcto.

**Solucion:**
```bash
# Verificar
echo $ANDROID_HOME

# Si esta vacio, agregar a ~/.zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
source ~/.zshrc
```

### Version de Java incorrecta

**Causa:** La app necesita JDK 17 y tienes otra version instalada.

**Solucion:**
```bash
# Verificar version actual
java -version

# Instalar JDK 17
sudo pacman -S jdk17-openjdk    # CachyOS/Arch
sudo apt install openjdk-17-jdk  # Ubuntu/Debian
```

### Celular no aparece en `adb devices`

**Soluciones:**
- Cambia el cable USB (algunos cables son solo de carga).
- Cambia el modo USB a "Transferencia de archivos" en la notificacion del celular.
- Reinicia el servicio adb: `adb kill-server && adb start-server`.
- Acepta la alerta de "Depuracion por USB" en el celular.

### `expo run:android` falla con error de Gradle

**Soluciones:**
```bash
# Limpiar cache de Gradle
cd android && ./gradlew clean && cd ..

# Regenerar prebuild
pnpm exec expo prebuild --clean

# Volver a intentar
pnpm exec expo run:android
```

### App se cierra sola al abrir

**Causa:** Puede ser un error de compilacion o un crash nativo.

**Solucion:**
```bash
# Reinstalar desde cero
pnpm exec expo prebuild --clean
pnpm exec expo run:android
```

### No se muestra la ubicacion en el mapa

**Causa:** El permiso de ubicacion no fue otorgado.

**Solucion:**
- Ve a Ajustes > Apps > Lugares Interactivos > Permisos > Ubicacion > Permitir siempre.
- O acepta el popup de permisos cuando la app lo solicite.

## 9. Comandos Utiles

```bash
# Correr la app en el celular (compilar + instalar + abrir)
pnpm exec expo run:android

# Regenerar la carpeta android/ desde cero
pnpm exec expo prebuild --clean

# Verificar dispositivos conectados
adb devices

# Instalar un APK manualmente
adb install -r path/to/app.apk

# Ver logs de la app en tiempo real
adb logcat | grep -i "ReactNativeJS"

# Verificar version de Node, pnpm, Java
node --version && pnpm --version && java -version

# Verificar variables de entorno
echo $ANDROID_HOME && echo $JAVA_HOME
```

## 10. Procesos Java (Gradle Daemon) - Guia Rapida

### ¿Que son?

Son procesos background que Gradle levanta automaticamente para compilar tu app Android.
Se inician cuando ejecutas un build o abres Android Studio con el proyecto cargado.

### Procesos que aparecen

| Proceso | Funcion | RAM Consumida |
|---------|---------|---------------|
| **Gradle Daemon** | Maneja la compilacion del proyecto | ~3 GB |
| **Kotlin Compile Daemon** | Compila el codigo Kotlin | ~1.5 GB |
| **Total** | | **~4.5 GB** |

### ¿Por que se prenden solos?

- Se activan automaticamente al ejecutar `./gradlew build` o al abrir el proyecto en Android Studio.
- **Tambien se prenden** al ejecutar `pnpm exec expo run:android` (Expo usa Gradle internamente para compilar la app).
- Se quedan corriendo en background para que la proxima compilacion sea mas rapida.
- Se apagan solos despues de **2 horas de inactividad**.

### ¿Cuando apagarlos?

Apagarlos cuando:
- No estas compilando ni trabajando en el proyecto.
- Necesitas liberar RAM.
- Tu celular esta desconectado y no estas haciendo nada de desarrollo.

NO es necesario apagarlos si:
- Estas trabajando activamente en el proyecto.

### ¿Como apagarlos?

Desde la terminal:

```bash
cd tu-proyecto/android && ./gradlew --stop
```

Esto detiene todos los daemon de Gradle y libera la RAM.

### ¿Que pasa si los apago?

**No pasa nada malo.** La proxima vez que ejecutes un build, Gradle automaticamente
levanta los daemon de nuevo. Es como apagar el horno cuando no estas cocinando.

### Monitorear procesos Java

Para ver si hay procesos Java corriendo:

```bash
ps aux | grep -i java | grep -v grep
```
