# Carpeta Provisional para Fotos Panorámicas 360°

Coloca aquí las imágenes equirectangulares (formato `.jpg` o `.png` en relación de aspecto 2:1, ej. 4096x2048 o 2048x1024) organizadas por escenario o sector.

### Estructura sugerida:
```
fotos360/
├── felix-capriles/ (o con UUID: e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e01/)
│   ├── cancha.jpg
│   ├── curva-norte.jpg
│   ├── curva-sur.jpg
│   ├── general.jpg
│   └── preferencia.jpg
└── [otro-escenario-id]/
    └── [sector].jpg
```

Posteriormente, estas imágenes se suben al bucket de Supabase Storage (`scenario-images` o `fotos-360`) para obtener la URL pública que se guarda en el campo `foto_360_url` de la tabla `scenario_sectors`.
