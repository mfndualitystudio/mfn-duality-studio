# MFN Duality Studio · sitio web

Landing estática (HTML, CSS y JavaScript sin dependencias) más una función serverless que envía los formularios por email. Pensada para Vercel.

## Estructura de carpetas
```
index.html  terminos.html  privacidad.html  404.html
css/styles.css          estilos: @layer, tokens en 3 niveles, mobile-first
js/init.js              marca la página como "con JavaScript" (se carga en el head)
js/main.js              punto de entrada (módulos ES)
js/modules/             header.js · scrollspy.js · forms.js · dom.js
api/contacto.js         función de Vercel: recibe los formularios y envía el email (Resend)
api/_lib/validate.js    validación y armado del correo (lógica pura, con tests)
tests/                  pruebas automáticas (node:test, sin dependencias)
scripts/verify.mjs      comprueba que no falte ningún archivo referenciado por las páginas
fonts/                  Montserrat e Inter alojadas en el propio sitio (licencia OFL)
img/                    logos (azul, blanco, currentColor), icons.svg (íconos y logos de marcas), og-image.png
favicon.svg  apple-touch-icon.png  robots.txt  sitemap.xml
vercel.json  _headers   cabeceras de seguridad y caché (Vercel / Cloudflare Pages)
package.json  .env.example  .gitignore  .editorconfig
```

## Importante: subí la carpeta completa
Este proyecto depende de sus subcarpetas (`css/`, `js/`, `js/modules/`, `api/`, `fonts/`, `img/`). Si copiás los archivos sueltos a una sola carpeta, el sitio pierde estilos, menú, formularios y logos. Descomprimí el ZIP y subí **todo el contenido respetando las carpetas** (en GitHub: arrastrá las carpetas enteras, no los archivos uno por uno). Antes de subir, `npm run verify` confirma que no falta nada.

## Cómo cambiar cosas habituales
- **Textos y secciones**: `index.html`.
- **Colores, tipografías y espaciados**: tokens al inicio de `css/styles.css`.
- **Número de WhatsApp**: buscá `5492954217129` en `index.html`, `terminos.html`, `privacidad.html` y `404.html` (el botón flotante está en todas las páginas).
- **Agregar un proyecto**: copiá un `<li class="project ...">` en `index.html`, cambiá la URL y el nombre, **y agregá el dominio a `frame-src`** en `vercel.json` y `_headers`; si no, el navegador bloquea la vista previa.
- **Probar el sitio en tu computadora**: `npx vercel dev` (los formularios funcionan) o `python3 -m http.server` (solo diseño).

## Despliegue: reemplazar la página actual por esta

Tu sitio actual está publicado en Vercel (mfndualitystudio.vercel.app). La idea es probar el nuevo sin tocar el que está en línea y recién después cambiarlo.

### 0. Antes de empezar
1. **Hacé una copia de seguridad del sitio actual**: descargá el repositorio (o, si lo subiste a mano, la carpeta con sus archivos). Si algo sale mal, es tu vuelta atrás.
2. Anotá cómo está configurado hoy en Vercel (Project > Settings > General): framework, comando de build y dominio.

### 1. Completar lo pendiente
- `terminos.html` y `privacidad.html`: reemplazá `[NOMBRE]`, `[CUIT]`, `[DOMICILIO]`, `[FECHA]` y `[CIUDAD]`. Que los revise un abogado antes de cobrar o publicar.
- Creá una cuenta en https://resend.com y generá una **API key**.
- Si tu dominio actual cambia, ejecutá en la carpeta (reemplazando el dominio nuevo):
  `grep -rl "mfndualitystudio.vercel.app" --include="*.html" --include="*.xml" --include="*.txt" . | xargs sed -i 's#mfndualitystudio.vercel.app#TU-DOMINIO.com#g'`

### 2. Subirlo a una rama nueva (no a la principal)
Si el sitio actual está en un repositorio de GitHub:
```
git checkout -b rediseno
# borrá los archivos viejos del proyecto y copiá todo el contenido de esta carpeta
git add -A
git commit -m "Rediseño del sitio"
git push -u origin rediseno
```
Vercel crea solo una **URL de vista previa** para esa rama (la ves en la pestaña Deployments). El sitio actual sigue intacto.

Si el sitio actual no está en GitHub: subí esta carpeta a un repositorio nuevo y en Vercel elegí Add New > Project > Import, o usá `npx vercel` dentro de la carpeta.

### 3. Ajustar el proyecto en Vercel (importante si el sitio viejo usaba un framework)
Project > Settings > General:
- **Framework Preset**: Other.
- **Build Command**, **Output Directory** e **Install Command**: vacíos (desactivá "Override" si aparece activado).
Si no, Vercel intenta compilar algo que ya no existe y falla.

### 4. Variables de entorno (para que lleguen los formularios)
Settings > Environment Variables (marcá Production y Preview):
| Variable | Valor |
|---|---|
| `RESEND_API_KEY` | la clave que generaste en Resend |
| `CONTACT_TO` | el email donde querés recibir los mensajes |
| `CONTACT_FROM` | `MFN Duality Studio <contacto@tu-dominio.com>` |

- Para **probar** sin dominio propio: usá `CONTACT_FROM=MFN Duality Studio <onboarding@resend.dev>` y poné en `CONTACT_TO` el mismo email con el que te registraste en Resend. Resend solo permite ese envío de prueba.
- Para **producción**: en Resend > Domains agregá tu dominio y cargá los registros DNS que te indique (SPF y DKIM) para que los correos no caigan en spam.
- Después de cargar las variables, hacé un nuevo despliegue (Deployments > ⋯ > Redeploy).

### 5. Revisar la vista previa (lista de control)
- [ ] Se ve bien en celular, tablet y computadora.
- [ ] El menú móvil abre y cierra; los enlaces del menú llevan a cada sección.
- [ ] **Formulario de contacto**: enviá una consulta de prueba y confirmá que llega el email. Probá también con campos vacíos y con un email mal escrito.
- [ ] **Lista de espera**: enviá una prueba.
- [ ] El botón verde de WhatsApp abre el chat con el mensaje inicial en todas las páginas.
- [ ] **Vistas previas de Proyectos**: se ve cada sitio dentro del marco. Si alguno queda en blanco o con un mensaje de error, ese sitio no permite que lo muestren dentro de otra página (ver "Si una vista previa no aparece").
- [ ] Los enlaces de Instagram, TikTok y LinkedIn abren los perfiles correctos.
- [ ] Términos y privacidad abren y tienen los datos completos.
- [ ] Probá una URL inexistente (por ejemplo `/prueba`) para ver la página 404.
- [ ] Pegá el enlace en WhatsApp o en LinkedIn y revisá que aparezca la imagen de vista previa.

### 6. Publicar
1. En GitHub, hacé el Pull Request de `rediseno` a la rama principal y fusionalo (merge). Vercel despliega a producción.
2. Abrí el sitio real y repetí rápido la lista de control, sobre todo el envío de formularios.
3. **Si algo falla**: en Vercel > Deployments, buscá el despliegue anterior y elegí **Promote to Production** (o "Instant Rollback"). El sitio viejo vuelve en segundos.

### 7. Después de publicar
- Registrá el sitio en **Google Search Console** y enviá `https://TU-DOMINIO/sitemap.xml`.
- Si el sitio viejo tenía otras direcciones que ya estaban en Google, agregá redirecciones en `vercel.json` (`"redirects": [{ "source": "/vieja", "destination": "/", "permanent": true }]`).
- Cuando tengas un dominio propio: Vercel > Settings > Domains, y actualizá las URLs como se indica en el paso 1.
- Cuando tengas capturas de tus proyectos y el logo final, reemplazalos en `img/` (los logos están en `img/logo-*.svg`).

## Si una vista previa de Proyectos no aparece
La vista previa carga el sitio real dentro de la tarjeta. Funciona solo si ese sitio lo permite. Si queda en blanco:
1. Si el sitio es tuyo, quitá `X-Frame-Options` o permití este dominio en su `frame-ancestors`.
2. Si no podés cambiarlo, usá una captura: guardala en `img/proyectos/nombre.webp` y reemplazá el `<iframe>` de ese proyecto por
   `<img class="browser__shot" src="/img/proyectos/nombre.webp" width="1600" height="1000" alt="Captura de Nombre" loading="lazy">`
   (y agregá en el CSS `.browser__shot { width: 100%; height: 100%; object-fit: cover; object-position: top; }`).

## Cookies y privacidad
El sitio **no instala cookies ni usa herramientas de seguimiento o publicidad**, y las tipografías se sirven desde el propio sitio, así que hoy no hace falta un cartel de cookies. El formulario guarda un borrador temporal en el navegador (`sessionStorage`), cosa que ya figura en la política de privacidad. **Si más adelante agregás Google Analytics, Meta Pixel u otra herramienta similar**, hay que sumar un aviso de cookies con consentimiento y actualizar la política.

## Comandos
```
npm run verify  # comprueba que no falte ningún archivo (correrlo antes de subir)
npm test        # corre las pruebas
npm run check   # verifica la sintaxis de todo el JavaScript
```

## Créditos de terceros
Tipografías Montserrat e Inter (SIL Open Font License, vía Fontsource). Íconos de marcas de Bootstrap Icons (MIT); las marcas WhatsApp, Instagram, TikTok y LinkedIn pertenecen a sus titulares.
