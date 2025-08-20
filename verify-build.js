#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando build para GitHub Pages...\n');

const distPath = path.join(__dirname, 'dist');
const requiredFiles = [
  'index.html',
  '404.html',
  'CNAME',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml'
];

const requiredDirs = [
  'assets'
];

let allGood = true;

// Verificar archivos requeridos
console.log('📁 Verificando archivos requeridos:');
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allGood = false;
  }
});

// Verificar directorios requeridos
console.log('\n📂 Verificando directorios requeridos:');
requiredDirs.forEach(dir => {
  const dirPath = path.join(distPath, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    console.log(`✅ ${dir}/ (${files.length} archivos)`);
  } else {
    console.log(`❌ ${dir}/ - FALTANTE`);
    allGood = false;
  }
});

// Verificar contenido del index.html
console.log('\n🔍 Verificando index.html:');
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Verificar que tenga el script de SPA routing
  if (indexContent.includes('Single Page Apps for GitHub Pages')) {
    console.log('✅ Script de SPA routing presente');
  } else {
    console.log('❌ Script de SPA routing faltante');
    allGood = false;
  }
  
  // Verificar que tenga las rutas correctas
  if (indexContent.includes('/assets/')) {
    console.log('✅ Rutas de assets correctas');
  } else {
    console.log('❌ Rutas de assets incorrectas');
    allGood = false;
  }
  
  // Verificar meta tags
  if (indexContent.includes('Excel Pages - Advanced Excel Data Processing')) {
    console.log('✅ Título correcto');
  } else {
    console.log('❌ Título incorrecto');
    allGood = false;
  }
}

// Verificar CNAME
console.log('\n🌐 Verificando CNAME:');
const cnamePath = path.join(distPath, 'CNAME');
if (fs.existsSync(cnamePath)) {
  const cnameContent = fs.readFileSync(cnamePath, 'utf8').trim();
  if (cnameContent === 'andrewgo12.github.io') {
    console.log('✅ CNAME correcto: andrewgo12.github.io');
  } else {
    console.log(`❌ CNAME incorrecto: ${cnameContent}`);
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 ¡TODO PERFECTO! El build está listo para GitHub Pages');
  console.log('🚀 URL del sitio: https://andrewgo12.github.io/');
} else {
  console.log('❌ Hay problemas que necesitan ser corregidos');
  process.exit(1);
}
console.log('='.repeat(50));
