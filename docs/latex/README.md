# Informe LaTeX (normas APA · tipografía Arial)

Informe del proyecto: *Desarrollo de un Sistema M\'ovil para la
Visualizaci\'on Interactiva de Escenarios Deportivos a Nivel Nacional*.

```
docs/latex/
├── main.tex                  # Integra todo: formato + portada + capítulos + anexos. Datos de portada aquí.
├── Makefile                  # Compila el informe con un solo comando (make).
├── formato/                  # FORMATO: todo lo que define la apariencia.
│   ├── preambulo.sty         # Paquetes, configuración APA y carátulas de capítulo.
│   ├── portada.tex           # Portada estilo APA (los datos se definen en main.tex).
│   └── referencias.bib       # Fuentes bibliográficas en BibTeX (todas citadas en el texto).
├── contenido/                # CONTENIDO: un archivo por sección.
│   │                         # Capítulo I (1.1–1.13), Capítulo II (2.1–2.2) y
│   │                         # Capítulo III (3.1–3.16).
│   ├── 00-resumen.tex        # Resumen y palabras clave.
│   ├── 01-antecedentes.tex   ... 13-poblacion-y-muestra.tex   (Capítulo I)
│   └── 31-propuesta-de-la-solucion.tex,
│       14-identificacion-usuarios.tex ... 30-readme-del-proyecto.tex (Capítulo III)
├── anexos/                   # Material complementario (tras las referencias).
│   ├── anexo-a-cronograma.tex ... anexo-d-presupuesto.tex
│   └── anexo-e-encuesta.tex / anexo-f-entrevista.tex
├── figuras/                  # Imágenes externas (logo, wireframes finales, diagramas).
└── guias/                    # Guías de la asignatura (MD y PDF), no compilan con el informe.
```

## Estructura del documento
- **CAPÍTULO I: INTRODUCCIÓN** (carátula propia) — sigue la guía de la universidad:
  antecedentes, contextualización, planteamiento del problema (con árbol de
  causas y efectos), formulación del problema, objetivos de la investigación,
  definición de variables, delimitación, justificación, tipología de proyectos,
  tipo y estudio de la investigación, métodos, técnicas e instrumentos, y
  población y muestra.
- **CAPÍTULO II: MARCOS DEL PROYECTO** (carátula propia) — estructura y
  desarrollo de los marcos del proyecto: marco teórico (con bases teóricas y
  sistema de variables), marco conceptual, marco histórico y marco referencial.
- **CAPÍTULO III: PROPUESTA DEL SISTEMA** (carátula propia) — requisitos del
  avance: propuesta de la solución (datos del equipo, nombre provisional,
  descripción de la solución y mapa de funcionalidades), identificación de
  usuarios, funcionalidades preliminares, definición del MVP, requerimientos
  preliminares (RF y RNF), flujo inicial de navegación, wireframes iniciales,
  tecnologías preliminares y desarrollo de la aplicación.
- Cada capítulo comienza con una carátula que ocupa una hoja completa; el
  contenido inicia en la página siguiente.

## ¿Dónde va cada cosa?
| Tipo de material | Carpeta |
|---|---|
| Secciones del cuerpo del informe | `contenido/` (archivos numerados por capítulo) |
| Documentos complementarios (cronograma, casos de uso, modelo de datos, presupuesto, encuesta, entrevista) | `anexos/` (Anexo A, B, C...) |
| Imágenes y diagramas externos | `figuras/` (referenciar con `\includegraphics{nombre.png}`) |
| Datos de portada (equipo, universidad, docente, integrantes...) | `main.tex` |
| Paquetes y estilo (márgenes, fuentes, espaciado, carátulas de capítulo) | `formato/preambulo.sty` |

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
make            # compila el PDF completo (pdflatex + bibtex + 2 pasadas finales)
make view       # compila y abre el PDF
make clean      # borra solo los archivos auxiliares (conserva el PDF)
```

El paso `bibtex` es imprescindible: sin él las citas aparecen como `[?]` y
la sección de referencias queda vacía. Por eso el Makefile lo ejecuta siempre.

Si prefieres los comandos a mano:

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
asignatura y docente. En `contenido/31-propuesta-de-la-solucion.tex`: apartado
de datos del equipo (integrantes, roles y responsable). Los montos del
presupuesto (anexo D) también son referenciales.

## Guías de referencia
- `guias/Guía Proyecto de Grado (Actualizado).md` — guía general de la universidad.
- `guias/guia-informe.pdf` — guía del Avance N.º 1 (estructura del entregable).

## Checklist por sección
**Portada (carátula)** — universidad, facultad, carrera, logo, título, integrantes,
asignatura, docente, equipo, ciudad y año.

**Capítulo I: Introducción**
- [x] Antecedentes
- [x] Contextualización de la problemática
- [x] Planteamiento del problema (con árbol de causas y efectos)
- [x] Formulación del problema
- [x] Objetivo general
- [x] Objetivos específicos (6)
- [x] Definición de variables
- [x] Delimitación (temporal y geográfica)
- [x] Justificación (social, económica, técnica, científica y metodológica)
- [x] Tipología de proyectos
- [x] Tipo y estudio de la investigación
- [x] Métodos de investigación
- [x] Técnicas e instrumentos de investigación
- [x] Población y muestra

**Capítulo II: Marcos del proyecto**
- [x] Estructura de los marcos
- [x] Desarrollo de los marcos (teórico, conceptual, histórico y referencial)

**Capítulo III: Propuesta del sistema**
- [ ] Propuesta de la solución (datos del equipo por completar)
- [x] Mapa de funcionalidades
- [x] Identificación de usuarios
- [x] Funcionalidades preliminares
- [x] Definición del MVP
- [x] Requerimientos preliminares (RF y RNF)
- [x] Flujo inicial de navegación (diagrama)
- [x] Wireframes iniciales
- [x] Tecnologías preliminares
- [x] Referencias (APA)

**Anexos**
- [x] Anexo A: Cronograma | Anexo B: Casos de uso | Anexo C: Modelo de datos
- [x] Anexo D: Presupuesto | Anexo E: Encuesta | Anexo F: Entrevista
