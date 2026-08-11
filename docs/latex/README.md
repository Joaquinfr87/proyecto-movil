# Informe LaTeX (normas APA · tipografía Arial)

Informe del proyecto: *Desarrollo de un Sistema Web y M\'ovil para la
Visualizaci\'on Interactiva de Escenarios Deportivos a Nivel Nacional*.

```
docs/latex/
├── main.tex                  # Integra todo: formato + portada + contenido. Datos de portada aquí.
├── formato/                  # FORMATO: todo lo que define la apariencia.
│   ├── preambulo.sty         # Paquetes y configuración APA (Arial, márgenes 1", doble espacio...).
│   ├── portada.tex           # Portada estilo APA (los datos se definen en main.tex).
│   └── referencias.bib       # Fuentes bibliográficas en BibTeX (todas citadas en el texto).
├── contenido/                # CONTENIDO: un archivo por sección, ordenados por prefijo numérico.
│   ├── 00-resumen.tex        # Resumen y palabras clave.
│   ├── 01-introduccion.tex   ... 13-tecnologias.tex
├── anexos/                   # Material complementario (tras las referencias).
│   ├── anexo-a-cronograma.tex
│   ├── anexo-b-casos-de-uso.tex
│   ├── anexo-c-modelo-de-datos.tex
│   └── anexo-d-presupuesto.tex
├── figuras/                  # Imágenes externas (wireframes finales, diagramas, logos).
└── guias/                    # Guías de la asignatura (MD y PDF), no compilan con el informe.
```

## ¿Dónde va cada cosa?
| Tipo de material | Carpeta |
|---|---|
| Secciones del cuerpo del informe | `contenido/` (archivos numerados) |
| Documentos complementarios (cronograma, casos de uso, modelo de datos, presupuesto) | `anexos/` (Anexo A, B, C...) |
| Imágenes y diagramas externos | `figuras/` (referenciar con `\includegraphics{nombre.png}`) |
| Datos de portada (autor, universidad, docente, equipo...) | `main.tex` (marcadores `[ ]` editables) |
| Paquetes y estilo (márgenes, fuentes, espaciado) | `formato/preambulo.sty` |

## Formato del documento
- **Tipografía:** Arial (se usa Helvetica del paquete `helvet`, el sustituto
  estándar de Arial en LaTeX; el paquete `uarial` fue retirado de TeX Live 2026).
- **Normas APA:** márgenes de 1 pulgada, interlineado doble, sangría de
  0.5 pulgada, número de página arriba a la derecha y títulos por niveles.
  Las referencias se generan con el estilo apacite (APA).
- **Idioma:** español (babel), con guionado y nombres de tablas/figuras en
  español.

## Cómo compilar
Desde `docs/latex/`:

```bash
pdflatex main && bibtex main && pdflatex main && pdflatex main
# o más simple:
latexmk -pdf main.tex
```

Si usas TeX Live estándar (Debian/Ubuntu), instala:
`sudo apt install texlive-latex-extra texlive-fonts-extra texlive-lang-spanish texlive-pictures latexmk`.
(`texlive-pictures` es necesario para los diagramas TikZ de flujo y wireframes).

## Datos pendientes de editar (marcadores `[ ]`)
En `main.tex`: autor, equipo, integrantes, universidad, facultad, carrera,
asignatura y docente. Los montos del presupuesto (anexo D) también son
referenciales.

## Guías de referencia
- `guias/Guía Proyecto de Grado (Actualizado).md` — guía general de la universidad.
- `guias/guia-informe.pdf` — guía del Avance N.º 1 (estructura del entregable).

## Checklist por sección
- [x] Portada (datos en main.tex)
- [x] Resumen y palabras clave
- [x] Introducción
- [x] Contextualización de la problemática
- [x] Problema identificado (con formulación y delimitación)
- [x] Justificación (social, económica, técnica y metodológica)
- [x] Objetivo general
- [x] Objetivos específicos (6)
- [x] Identificación de usuarios
- [x] Funcionalidades preliminares
- [x] Definición del MVP (incluido/excluido + priorización)
- [x] Requerimientos preliminares (RF y RNF)
- [x] Flujo inicial de navegación (diagrama)
- [x] Wireframes iniciales (5 pantallas)
- [x] Tecnologías preliminares
- [x] Referencias (APA)
- [x] Anexos A–D (cronograma, casos de uso, modelo de datos, presupuesto)
