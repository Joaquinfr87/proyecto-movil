const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de .env manualmente si existe
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  });
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'scenario-images';
const FOTOS_DIR = path.join(__dirname, '..', 'fotos360');

const filesToUpload = [
  { file: 'fotocanchaestadio.jpg', target: 'fotos360/fotocanchaestadio.jpg' },
  { file: 'Curvanorte.jpg', target: 'fotos360/Curvanorte.jpg' },
  { file: 'generalSiles.jpg', target: 'fotos360/generalSiles.jpg' },
  { file: 'curva-sur.jpg', target: 'fotos360/curva-sur.jpg' },
  { file: 'preferencia.jpg', target: 'fotos360/preferencia.jpg' },
];

async function upload360Photos() {
  console.log(`📡 Conectando a Supabase: ${supabaseUrl}`);

  // Iniciar sesión como admin para permisos RLS de storage
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'password123',
  });

  if (authError) {
    console.error('❌ Error de autenticación admin:', authError.message);
    return;
  }
  console.log('🔑 Autenticado como admin correctamente.');

  for (const item of filesToUpload) {
    const filePath = path.join(FOTOS_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️ Archivo no encontrado: ${item.file}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log(`📤 Subiendo ${item.file} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB) a ${item.target}...`);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(item.target, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`❌ Error al subir ${item.file}:`, error.message);
    } else {
      const { data: pub } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.target);
      console.log(`✅ Subido exitosamente: ${pub.publicUrl}`);
    }
  }

  console.log('\n🎉 Proceso de subida de fotos 360 finalizado.');
}

upload360Photos().catch((err) => {
  console.error('Error fatal:', err);
});
