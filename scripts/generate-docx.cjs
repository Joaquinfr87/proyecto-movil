const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} = require('docx');

const PRIMARY_COLOR = '1E3A8A';
const SECONDARY_COLOR = 'D97706';
const DARK_GRAY = '374151';
const ALERT_BG = 'FEF2F2';
const ALERT_BORDER = 'EF4444';

function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 36,
        color: PRIMARY_COLOR,
        font: 'Calibri',
      }),
    ],
  });
}

function createSubtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 400 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 24,
        color: SECONDARY_COLOR,
        font: 'Calibri',
      }),
    ],
  });
}

function createMetaLine(label, value) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: label + ': ',
        bold: true,
        size: 22,
        color: PRIMARY_COLOR,
        font: 'Calibri',
      }),
      new TextRun({
        text: value,
        size: 22,
        color: DARK_GRAY,
        font: 'Calibri',
      }),
    ],
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 150 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 28,
        color: PRIMARY_COLOR,
        font: 'Calibri',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 24,
        color: SECONDARY_COLOR,
        font: 'Calibri',
      }),
    ],
  });
}

function createBodyParagraph(text) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text: text,
        size: 22,
        color: DARK_GRAY,
        font: 'Calibri',
      }),
    ],
  });
}

function createBulletItem(boldPrefix, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({
        text: boldPrefix ? boldPrefix + ': ' : '',
        bold: true,
        size: 22,
        color: DARK_GRAY,
        font: 'Calibri',
      }),
      new TextRun({
        text: text,
        size: 22,
        color: DARK_GRAY,
        font: 'Calibri',
      }),
    ],
  });
}

function createCodeBlock(code) {
  const lines = code.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'F9FAFB', type: ShadingType.CLEAR, color: 'auto' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
              left: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY_COLOR },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
            },
            children: lines.map(
              (line) =>
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [
                    new TextRun({
                      text: line,
                      size: 18,
                      font: 'Consolas',
                      color: '1F2937',
                    }),
                  ],
                }),
            ),
          }),
        ],
      }),
    ],
  });
}

function createScreenshotAlert(instruction) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: ALERT_BG, type: ShadingType.CLEAR, color: 'auto' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: ALERT_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: ALERT_BORDER },
              left: { style: BorderStyle.SINGLE, size: 18, color: ALERT_BORDER },
              right: { style: BorderStyle.SINGLE, size: 6, color: ALERT_BORDER },
            },
            children: [
              new Paragraph({
                spacing: { before: 100, after: 100 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '📷 [PONER CAPTURA DE PANTALLA AQUÍ]',
                    bold: true,
                    size: 22,
                    color: ALERT_BORDER,
                    font: 'Calibri',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 40, after: 100 },
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: instruction,
                    italic: true,
                    size: 20,
                    color: DARK_GRAY,
                    font: 'Calibri',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        createTitle('DOCUMENTACIÓN TÉCNICA Y EVALUACIÓN DEL EXAMEN FINAL'),
        createSubtitle('Módulo: "POV (Point of View) Comunitario"'),

        createMetaLine('Estudiante', 'David Cruz'),
        createMetaLine('Materia', 'Aplicaciones Móviles'),
        createMetaLine('Rama de Git', 'ExamenFinalDavidCruz'),
        createMetaLine('Proyecto', 'Lugares Interactivos (Expo / React Native + Supabase)'),
        createMetaLine('Fecha', 'Septiembre 2026'),

        createHeading1('PARTE 1. RESUMEN EJECUTIVO Y CADENA DE VALOR DEL DESARROLLO'),
        createBodyParagraph(
          'Esta implementación demuestra una integración completa de punta a punta cubriendo la expectativa técnica requerida en el examen:',
        ),
        createBodyParagraph(
          'ANÁLISIS → DISEÑO → INTERFAZ → NAVEGACIÓN → LÓGICA → VALIDACIÓN → ESTADO → PERSISTENCIA → SUPABASE → POSTGRESQL → CRUD → PRUEBAS',
        ),

        createHeading1('PARTE 2. FUNCIONALIDAD IMPLEMENTADA Y PROBLEMA QUE RESUELVE'),
        createHeading2('1. Funcionalidad Implementada'),
        createBodyParagraph(
          'Se desarrolló la sexta pestaña interactiva llamada "POV" (Point of View), orientada a la generación de contenido por parte de la comunidad. Esta pantalla integra:',
        ),
        createBulletItem('Mapa Interactivo', 'MapTiler + MapLibre GL filtrando exclusivamente puntos comunitarios.'),
        createBulletItem('Identidad Visual', 'Marcadores de color rojo (#EF4444) para diferenciarse del mapa oficial.'),
        createBulletItem('Acción Rápida', 'Botón flotante (FAB) para registro inmediato de nuevos lugares.'),
        createBulletItem('Geolocalización', 'Formulario con captura obligatoria de posición GPS en tiempo real.'),

        createHeading2('2. Problema que Resuelve'),
        createBodyParagraph(
          'Anteriormente, la aplicación solo mostraba información administrada de forma estática o por usuarios de rol avanzado (admin / gestor).',
        ),
        createBulletItem('Falta de contenido participativo', 'Los usuarios comunes (asistente) no podían mapear canchas ni espacios informales.'),
        createBulletItem('Saturación del mapa principal', 'Mezclar datos oficiales con aportes informales afectaba la legibilidad del mapa de Inicio.'),
        createBulletItem('Solución', 'La sección POV descentraliza el mapeo deportivo, empoderando a la comunidad y manteniendo aislados y ordenados los lugares oficiales frente a los comunitarios.'),

        createHeading1('PARTE 3. ARQUITECTURA Y COMPONENTES DESARROLLADOS'),
        createHeading2('1. Vistas Creadas'),
        createBulletItem('src/app/(tabs)/pov.tsx', 'Pantalla principal con mapa de marcadores rojos, tarjeta flotante de previsualización y botón FAB.'),
        createBulletItem('src/app/pov-form/[id].tsx', 'Formulario de registro con captura de GPS obligatoria, chips interactivos de selección y subida de imágenes.'),

        createHeading2('2. Navegación'),
        createBulletItem('src/app/(tabs)/_layout.tsx', 'Registro del nuevo tab "pov" situado tras "index" (Inicio), accesible para todos los roles con ícono eye-outline.'),
        createBulletItem('Navegación Parametrizada', 'Transferencia de coordenadas por URL hacia /pov-form/new?lat=...&lng=...'),

        createHeading1('PARTE 4. BASE DE DATOS, PERSISTENCIA Y SUPABASE (POSTGRESQL)'),
        createHeading2('1. Tablas Modificadas e Índices'),
        createBulletItem('Tabla public.scenarios', 'Se agregó el campo is_community (BOOLEAN NOT NULL DEFAULT false) para diferenciar puntos comunitarios.'),
        createBulletItem('Índice Parcial', 'CREATE INDEX idx_scenarios_is_community ON public.scenarios(is_community) WHERE is_community = true;'),

        createHeading2('2. Migración de Base de Datos (011_add_community_scenarios.sql)'),
        createCodeBlock(
`-- Adición de columna
ALTER TABLE public.scenarios ADD COLUMN is_community BOOLEAN NOT NULL DEFAULT false;

-- Índice optimizado
CREATE INDEX idx_scenarios_is_community ON public.scenarios(is_community) WHERE is_community = true;

-- Políticas de Seguridad RLS (Row Level Security)
CREATE POLICY "scenarios_insert_community"
  ON public.scenarios FOR INSERT TO authenticated
  WITH CHECK (is_community = true);

CREATE POLICY "scenarios_update_community_own"
  ON public.scenarios FOR UPDATE TO authenticated
  USING (is_community = true AND created_by = auth.uid())
  WITH CHECK (is_community = true AND created_by = auth.uid());`
        ),

        createHeading2('3. Datos Semilla (Seed)'),
        createBodyParagraph('Se incorporaron 5 escenarios comunitarios de prueba distribuidos geográficamente en Bolivia (La Paz, Cochabamba, Santa Cruz, Sucre y Oruro) asignados al usuario de rol asistente.'),

        createHeading2('4. Operaciones CRUD Implementadas'),
        createBulletItem('Create (Creación)', 'Inserción en scenarios con is_community=true y created_by=auth.uid(). Subida de imágenes a Supabase Storage.'),
        createBulletItem('Read (Lectura)', 'Consulta en useCommunityScenarios() filtrando estado=activo e is_community=true.'),
        createBulletItem('Update (Actualización)', 'Permitido para el creador del punto mediante la política RLS scenarios_update_community_own.'),

        createHeading1('PARTE 5. MANEJO DE ESTADO Y CACHÉ'),
        createBulletItem('React Query', 'Uso de queryKey: [scenarios-community] con caché independiente e invalidación automática tras mutaciones de inserción.'),

        createHeading1('PARTE 6. DESAFÍO ADICIONAL INCORPORADO'),
        createBulletItem('Mejora de UX', 'Mapa con marcadores rojos temáticos, tarjetas informativas dinámicas y FAB intuitivo.'),
        createBulletItem('Filtros Avanzados', 'Segregación lógica de datos en tiempo de consulta PostgreSQL entre mapa oficial y comunitario.'),
        createBulletItem('Validaciones Adicionales', 'Geolocalización GPS en tiempo real obligatoria y esquemas Zod en formularios.'),
        createBulletItem('Seguridad RLS', 'Políticas de control de acceso por fila en Supabase PostgreSQL.'),

        createHeading1('PARTE 7. DIFICULTADES ENCONTRADAS Y SOLUCIONES'),
        createBulletItem('Tipado de Supabase', 'Se actualizaron las definiciones de TypeScript en database.ts e index.ts para reconocer la nueva columna is_community.'),
        createBulletItem('Permisos para Asistente', 'Se habilitaron políticas RLS específicas permitiendo INSERT a usuarios con rol asistente siempre que is_community sea true.'),
        createBulletItem('Ubicación en Formularios', 'Se integró expo-location asegurando la presencia de coordenadas válidas antes de procesar el registro.'),

        createHeading1('PARTE 8. PLAN DE PRUEBAS DE SOFTWARE (OBLIGATORIO)'),

        createHeading2('Prueba 1: Acceso al nuevo módulo'),
        createBulletItem('Objetivo', 'Verificar que la pestaña "POV" es visible y accesible en la barra de navegación inferior.'),
        createBulletItem('Procedimiento', 'Iniciar sesión con cualquier usuario y presionar sobre el ícono del ojo ("POV").'),
        createBulletItem('Resultado Esperado', 'La aplicación navega correctamente a la pantalla /pov mostrando el mapa comunitario.'),
        createScreenshotAlert('Vista de la pestaña POV abierta mostrando la barra de tabs inferior con la opción POV seleccionada.'),

        createHeading2('Prueba 2: Ingreso de datos válidos'),
        createBulletItem('Objetivo', 'Registrar un nuevo escenario comunitario con información correcta.'),
        createBulletItem('Procedimiento', 'Presionar el botón flotante (+), ingresar Nombre: "Cancha Los Pinos", Tipo: "Cancha", Capacidad: "50", adjuntar foto y enviar.'),
        createBulletItem('Resultado Esperado', 'El formulario procesa los datos, muestra alerta de éxito y redirige al mapa.'),
        createScreenshotAlert('Formulario de creación POV llenado con datos válidos.'),

        createHeading2('Prueba 3: Ingreso de datos inválidos'),
        createBulletItem('Objetivo', 'Comprobar la respuesta del sistema al ingresar tipos de datos erróneos.'),
        createBulletItem('Procedimiento', 'Intentar ingresar texto o valores negativos en el campo de Capacidad.'),
        createBulletItem('Resultado Esperado', 'El validador Zod rechaza el envío mostrando: "Debe ser un número mayor a 0".'),
        createScreenshotAlert('Formulario mostrando error de validación en el campo Capacidad.'),

        createHeading2('Prueba 4: Validación de campos obligatorios'),
        createBulletItem('Objetivo', 'Validar la restricción al intentar enviar el formulario sin los datos requeridos.'),
        createBulletItem('Procedimiento', 'Dejar el campo "Nombre del lugar" vacío y presionar "Crear punto POV".'),
        createBulletItem('Resultado Esperado', 'Aparece un mensaje en rojo: "El nombre es obligatorio".'),
        createScreenshotAlert('Mensaje de validación en rojo debajo del campo Nombre.'),

        createHeading2('Prueba 5: Guardado de información'),
        createBulletItem('Objetivo', 'Confirmar la inserción de datos en la base de datos de Supabase.'),
        createBulletItem('Procedimiento', 'Enviar un punto válido y revisar la tabla scenarios en Supabase Studio.'),
        createBulletItem('Resultado Esperado', 'El nuevo registro aparece almacenado con is_community = true y el ID del usuario en created_by.'),
        createScreenshotAlert('Panel de Supabase Studio mostrando la fila insertada en la tabla scenarios.'),

        createHeading2('Prueba 6: Consulta de información'),
        createBulletItem('Objetivo', 'Verificar la lectura y visualización de los puntos comunitarios en el mapa.'),
        createBulletItem('Procedimiento', 'Abrir la pestaña POV y observar los marcadores desplegados.'),
        createBulletItem('Resultado Esperado', 'Se cargan únicamente los puntos comunitarios con marcadores de color rojo (#EF4444).'),
        createScreenshotAlert('Mapa POV mostrando marcadores rojos y tarjeta flotante interactiva.'),

        createHeading2('Prueba 7: Modificación de información'),
        createBulletItem('Objetivo', 'Validar la actualización de datos de un punto comunitario por su creador.'),
        createBulletItem('Procedimiento', 'Editar la descripción del punto registrado usando la cuenta del usuario creador.'),
        createBulletItem('Resultado Esperado', 'La base de datos actualiza el registro cumpliendo la política RLS scenarios_update_community_own.'),
        createScreenshotAlert('Pantalla del punto editado reflejando los nuevos datos.'),

        createHeading2('Prueba 8: Eliminación de información'),
        createBulletItem('Objetivo', 'Comprobar la restricción de eliminación para usuarios de rol estándar.'),
        createBulletItem('Procedimiento', 'Intentar eliminar un punto comunitario como usuario asistente vs. usuario admin.'),
        createBulletItem('Resultado Esperado', 'El usuario asistente no posee permisos de borrado; únicamente el rol admin puede eliminarlo (RLS scenarios_delete_admin_only).'),
        createScreenshotAlert('Vista de usuario asistente sin opción de borrado frente a la vista de usuario admin.'),

        createHeading2('Prueba 9: Comprobación de persistencia'),
        createBulletItem('Objetivo', 'Garantizar la permanencia de los datos tras reiniciar la aplicación.'),
        createBulletItem('Procedimiento', 'Registrar un punto, cerrar por completo la app/navegador, reiniciar y reabrir POV.'),
        createBulletItem('Resultado Esperado', 'El punto registrado se recupera y vuelve a mostrarse en el mapa desde Supabase.'),
        createScreenshotAlert('Mapa POV mostrando el punto guardado tras reiniciar la app.'),

        createHeading2('Prueba 10: Manejo de errores'),
        createBulletItem('Objetivo', 'Evaluar la resiliencia de la app ante la falta de permisos de GPS.'),
        createBulletItem('Procedimiento', 'Denegar el permiso de localización cuando el formulario POV intenta obtener el GPS.'),
        createBulletItem('Resultado Esperado', 'La app atrapa la excepción, muestra mensaje explicativo y regresa de forma segura al mapa.'),
        createScreenshotAlert('Alerta de error por falta de permisos de geolocalización GPS.'),
      ],
    },
  ],
});

const outputPath = path.join('/home/david/Documents/materias/aplicacionesMoviles/pfapk/proyecto-movil', 'documentacionDavid.docx');

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log('DOCX_GENERATED_SUCCESSFULLY');
});
