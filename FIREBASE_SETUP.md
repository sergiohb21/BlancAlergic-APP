# Configuración de Firebase para BlancAlergic-APP

## Configuración Local ✅ (Ya completado)

### Archivos configurados:
- `.env.local` - Variables para desarrollo local
- `.env.example` - Plantilla con credenciales reales
- `src/firebase/config.ts` - Configuración de Firebase actualizada
- `.github/workflows/deploy.yaml` - Workflow con variables de entorno

### Desarrollo local:
```bash
# El servidor ya está funcionando con las credenciales reales
npm run dev
# http://localhost:5174/BlancAlergic-APP/
```

## Configuración para GitHub Pages 🚀

Paso a paso para configurar las variables de entorno en producción:

### 1. Ir a configuración del repositorio
1. Entra a tu repositorio en GitHub
2. Ve a **Settings** (Configuración)
3. En el menú lateral, ve a **Secrets and variables > Actions**

### 2. Crear los Secrets
Crea los siguientes **Repository secrets** con estos valores exactos:

| Nombre del Secret | Valor |
|-------------------|-------|
| `FIREBASE_API_KEY` | `AIzaSyDrQqbURED37ggiDUQATsgiWdVK9LiMz4o` |
| `FIREBASE_AUTH_DOMAIN` | `blancalergic-app.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `blancalergic-app` |
| `FIREBASE_STORAGE_BUCKET` | `blancalergic-app.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `176916737065` |
| `FIREBASE_APP_ID` | `1:176916737065:web:a398bb32636920cec7c038` |
| `FIREBASE_MEASUREMENT_ID` | `G-2PEQVSYG9W` |

### 3. Verificar configuración del Workflow
El archivo `.github/workflows/deploy.yaml` ya está configurado para:
- Leer las variables de entorno desde los Secrets
- Inyectarlas durante el build
- Desplegar a GitHub Pages

### 4. Probar el despliegue
```bash
# Subir los cambios al repositorio
git add .
git commit -m "Configurar Firebase para producción"
git push origin main
```

El workflow automáticamente:
1. Leerá los Secrets
2. Compilará la aplicación con las credenciales reales
3. Desplegará a GitHub Pages

## Flujo de Variables de Entorno

### Desarrollo Local:
`.env.local` → Vite → Firebase Config ✅

### Producción (GitHub Pages):
GitHub Secrets → GitHub Actions → Vite → Firebase Config ✅

## Verificación

### En desarrollo local:
- Ve a http://localhost:5174/BlancAlergic-APP/
- Navega a `/historial-medico`
- Intenta iniciar sesión con Google
- Debería funcionar con el proyecto real de Firebase

### En producción:
- Visita tu GitHub Pages site
- El proceso debería ser idéntico
- Los datos se guardarán en tu proyecto real de Firebase

## Seguridad 🔒

- ✅ Las credenciales de Firebase son públicas y seguras para uso en cliente
- ✅ `apiKey` está diseñado para ser público (sirve para identificar tu proyecto)
- ✅ Las reglas de seguridad en Firestore protegen el acceso a los datos
- ✅ Los Secrets de GitHub están cifrados y no son visibles públicamente

## Soporte

Si encuentras algún problema:
1. Revisa que las variables estén correctamente configuradas en GitHub Secrets
2. Verifica que el workflow se esté ejecutando correctamente
3. Revisa los logs del deployment en la pestaña Actions de tu repositorio

## Resumen

✅ **Local**: Funcionando con credenciales reales
🚀 **Producción**: Listo para configurar con los pasos anteriores
🔒 **Seguridad**: Configurado según las mejores prácticas de Firebase y GitHub