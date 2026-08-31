# Carpeta Provisional para Fotos Panorámicas 360°

Coloca aquí las imágenes equirectangulares (formato `.jpg` o `.png` en relación de aspecto 2:1, ej. 4096x2048 o 2048x1024) organizadas por escenario o sector.

### Estructura de fotos de referencia:
```
fotos360/
├── fotocanchaestadio.jpg   (Cancha Central / Cancha Principal)
├── Curvanorte.jpg          (Curva Norte / Gradería Norte)
├── generalSiles.jpg        (Tribuna General / Gradería General)
├── curva-sur.jpg           (Curva Sur)
└── preferencia.jpg         (Tribuna Preferencia)
```

Posteriormente, estas imágenes se suben al bucket de Supabase Storage (`scenario-images` o `fotos-360`) para obtener la URL pública que se guarda en el campo `foto_360_url` de la tabla `scenario_sectors`.
