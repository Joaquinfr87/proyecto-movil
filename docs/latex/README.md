# Organización del informe LaTeX (formato APA)

```
docs/latex/
├── main.tex                  # Integra todo: carga formato + contenido. No editar contenido aquí.
├── formato/                  # FORMATO: todo lo que define la apariencia.
│   ├── preambulo.sty         # Paquetes y configuración APA (márgenes, doble espacio, tipografía...).
│   ├── portada.tex           # Plantilla de portada (datos se definen en main.tex).
│   └── referencias.bib       # Fuentes bibliográficas en BibTeX.
├── contenido/                # CONTENIDO: solo texto del informe, un archivo por sección.
│   ├── 01-introduccion.tex
│   ├── 02-contextualizacion-problematica.tex
│   ├── 03-problema-identificado.tex
│   ├── 04-justificacion.tex
│   ├── 05-objetivo-general.tex
│   ├── 06-objetivos-especificos.tex
│   ├── 07-identificacion-usuarios.tex
│   ├── 08-funcionalidades-preliminares.tex
│   ├── 09-definicion-mvp.tex
│   ├── 10-requerimientos.tex
│   ├── 11-flujo-navegacion.tex
│   ├── 12-wireframes.tex
│   └── 13-tecnologias.tex    # + 14, 15, ... para más secciones del cuerpo
├── anexos/                   # Material complementario (tras las referencias).
│   ├── anexo-a-cronograma.tex
│   ├── anexo-b-casos-de-uso.tex
│   ├── anexo-c-modelo-de-datos.tex
│   └── anexo-d-presupuesto.tex
└── figuras/                  # Imágenes: wireframes finales, diagramas, logos.
```

## ¿Dónde va cada cosa?
| Tipo de material | Carpeta |
|---|---|
| Secciones del cuerpo del informe (introducción, objetivos, requerimientos...) | `contenido/` (archivos numerados) |
| Secciones adicionales (funcionalidades futuras, casos de uso, modelo de datos...) | `contenido/` (siguiente número) |
| Documentos complementarios (cronograma, presupuesto, manual de usuario...) | `anexos/` (Anexo A, B, C...) |
| Imágenes y diagramas (wireframes, logos, ERD...) | `figuras/` (referenciar con `\includegraphics{nombre.png}`) |
| Datos de portada (autor, universidad, docente...) | `main.tex` |
| Paquetes y estilo (márgenes, fuentes, espaciado) | `formato/preambulo.sty` |

## Principio: formato y contenido separados
- **`formato/`**: cambios de estilo se hacen aquí, una sola vez.
- **`contenido/`**: se redacta únicamente texto; el orden se controla con el prefijo numérico.
- Los datos de la portada (autor, universidad, docente...) se editan en `main.tex`.

## Cómo compilar
Desde `docs/latex/`:
```bash
pdflatex main && bibtex main && pdflatex main && pdflatex main
# o más simple:
latexmk -pdf main.tex
```

## Nota sobre apa7
Se usa la clase `article` con configuraciones APA para que compile hoy. Si se
instala `texlive-publishers` (`sudo apt install texlive-publishers`), se puede
cambiar en `main.tex` a `\documentclass[stu]{apa7}` y quitar `newtxtext`/`newtxmath`
del preámbulo para usar la clase oficial de APA.

## Checklist por sección
- [ ] Portada (datos en main.tex)
- [ ] Introducción
- [ ] Contextualización de la problemática
- [ ] Problema identificado
- [ ] Justificación
- [ ] Objetivo general
- [ ] Objetivos específicos (mín. 5)
- [ ] Identificación de usuarios
- [ ] Funcionalidades preliminares
- [ ] Definición del MVP
- [ ] Requerimientos preliminares (RF y RNF)
- [ ] Flujo inicial de navegación
- [ ] Wireframes iniciales
- [ ] Tecnologías preliminares
