# 🚀 Configuración Obligatoria en Firebase Console

## Pasos críticos para que funcione Google Sign-In

### 1. Firebase Authentication Configuration

#### a) Activar Google Sign-In:
1. Ve a **Firebase Console** → https://console.firebase.google.com/
2. Selecciona tu proyecto: `blancalergic-app`
3. Ve a **Authentication** → **Sign-in method**
4. Haz clic en **Google**
5. **Actívalo** y configura:
   - ✅ **Habilitar**
   - **Email de soporte del proyecto**: tu-email@gmail.com
   - Haz clic en **Guardar**

#### b) Configurar Dominios Autorizados:
En **Authentication** → **Settings** → **Dominios autorizados**, añade:

```
localhost
127.0.0.1
shb21.github.io
```

### 2. Google Cloud Console Configuration

#### a) OAuth 2.0 Client ID:
1. Ve a **Google Cloud Console** → https://console.cloud.google.com/
2. Selecciona tu proyecto: `blancalergic-app`
3. Ve a **APIs & Services** → **Credentials**
4. Busca tu **OAuth 2.0 Client ID** (Web application)
5. Haz clic en **Editar** y en **URIs de redirección autorizadas**, añade:

```
http://localhost:5173


https://shb21.github.io
```

#### b) OAuth Consent Screen:
1. Ve a **APIs & Services** → **OAuth consent screen**
2. Asegúrate de que esté **Publicación** y verificada
3. En **Alcances (Scopes)**, asegúrate de tener:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### 3. Firestore Database Rules

Ve a **Firestore Database** → **Rules** y asegúrate de tener:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden acceder a sus propios documentos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Subcolecciones del usuario
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Denegar todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 4. Problemas Comunes y Soluciones

#### ❌ Error: "Cross-Origin-Opener-Policy policy would block the window.closed call"
**Solución**: Los headers COOP/COEP ya están configurados en index.html

#### ❌ Error: "400 Bad Request" en identitytoolkit.googleapis.com
**Solución**: Verificar que el dominio esté autorizado en Firebase Auth

#### ❌ Error: "400 Bad Request" en firestore.googleapis.com
**Solución**: Verificar reglas de Firestore y que el usuario esté autenticado

### 5. Verificación Paso a Paso

#### ✅ Desarrollo Local:
1. Ejecuta: `npm run dev`
2. Abre: `http://localhost:5173/BlancAlergic-APP/`
3. Ve a: `/historial-medico`
4. Click en "Continuar con Google"
5. Debería redirigir a Google y volver con sesión iniciada

#### ✅ Producción (GitHub Pages):
1. Haz commit y push de los cambios
2. Espera el deployment de GitHub Actions
3. Abre: `https://shb21.github.io/BlancAlergic-APP/`
4. Sigue los mismos pasos que en local

### 6. Debugging Tips

#### Chrome DevTools:
```javascript
// Verificar configuración de Firebase
console.log('Firebase Config:', firebaseConfig);

// Verificar estado de autenticación
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  console.log('Usuario:', user);
});

// Verificar errores de Firestore
import { getFirestore } from 'firebase/firestore';
const db = getFirestore();
console.log('Firestore DB:', db);
```

#### Network Tab:
- Busca peticiones a `identitytoolkit.googleapis.com`
- Deben ser status 200, no 400
- Revisa los headers y payloads

### 7. Si sigue sin funcionar:

1. **Limpia caché del navegador**:
   - Chrome DevTools → Application → Storage → Clear storage
   - O usa Ctrl+Shift+R para hard reload

2. **Verifica todas las configuraciones** una por una

3. **Revisa la consola de Firebase** por errores de configuración

4. **Asegúrate de que los GitHub Secrets** estén correctamente configurados

---

## ✅ Checklist Final:

- [ ] Google Sign-In activado en Firebase Auth
- [ ] Dominios autorizados configurados (localhost y shb21.github.io)
- [ ] OAuth 2.0 Client ID configurado en Google Cloud
- [ ] OAuth Consent Screen verificado
- [ ] Reglas de Firestore configuradas
- [ ] Headers COOP/COEP en index.html
- [ ] Service Worker actualizado para ignorar Firebase
- [ ] GitHub Secrets configurados para producción

Una vez completados todos estos pasos, el login con Google debería funcionar perfectamente tanto en desarrollo como en producción.