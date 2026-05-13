# EcoModa S.A. — Demo

Sitio demo de moda sostenible con pasarela de pago Niubiz (sandbox).

## Stack

- HTML5 + CSS3 + JavaScript (sin framework)
- Lucide Icons (CDN) + Google Fonts
- Backend: Funciones Serverless de Vercel (Node 18+)
- Pasarela: Niubiz (sandbox)

## Estructura

```
/                           Raíz (deploy estático)
├── index.html              Home
├── tienda.html             Listado de productos
├── producto.html           Detalle de producto
├── carrito.html            Carrito
├── checkout.html           Datos + pago
├── gracias.html            Confirmación
├── blog.html, nosotros.html, contacto.html
├── assets/
│   ├── css/                styles.css + 1 hoja por página
│   ├── js/                 main.js, tienda.js, producto.js, niubiz.js, checkout.js, etc.
│   └── img/                logo + favicon
├── api/                    Funciones serverless de Vercel
│   ├── security.js         GET → obtiene access token de Niubiz
│   └── session.js          POST → genera session token para el pago
├── vercel.json
└── package.json
```

## Cómo correrlo en local

### Opción A — Solo frontend (sin pasarela real)

Cualquier servidor estático sirve. La más rápida:

```bash
npx serve .
```

Abrí `http://localhost:3000`. El flujo de Niubiz funciona en **modo simulado** (los `console.log` muestran las URLs y los pasos, pero no llaman a Niubiz de verdad).

### Opción B — Con backend Niubiz real (recomendado)

Necesitás Node 18+ y la CLI de Vercel:

```bash
npm install -g vercel
vercel dev
```

La primera vez te pedirá login. Luego abrí `http://localhost:3000`. Ahora `/api/security` y `/api/session` corren localmente y golpean Niubiz sandbox de verdad.

**Tarjetas de prueba para el modal:**

| Tarjeta | CVV | Resultado |
|---|---|---|
| 4551 7281 9181 6275 | 123 | Aprobada |
| 4111 1111 1111 1111 | 123 | Rechazada |
| 5111 4848 0570 7176 | 123 | Aprobada (Mastercard) |

Cualquier fecha futura (ej: `12/28`) sirve.

## Cómo subir a Vercel

### Opción 1 — Con Git/GitHub (recomendada)

```bash
# Dentro de la carpeta del proyecto:
git init
git add .
git commit -m "Inicial EcoModa demo"

# Creá un repo en https://github.com/new (privado o público)
git remote add origin https://github.com/<TU-USUARIO>/ecomoda-demo.git
git branch -M main
git push -u origin main
```

Luego en Vercel:
1. https://vercel.com/new → **Import Git Repository**
2. Elegí el repo recién subido
3. Framework Preset: **Other**
4. Build Command: vacío
5. Output Directory: vacío
6. Click **Deploy**

A partir de ahí, cada `git push` re-deploya solo.

### Opción 2 — CLI

```bash
npm install -g vercel
vercel
```

Te pregunta nombre del proyecto, equipo, etc. Para subir cambios:

```bash
vercel --prod
```

## Credenciales Niubiz (hardcoded en `api/*.js`)

```
User:        integraciones@niubiz.com.pe
Password:    _7z3@8fF
Merchant ID: 456879852
```

Son credenciales sandbox públicas oficiales de Niubiz. **No usar en producción** — solo demo.

## Funcionalidades

- Carrito persistente (localStorage)
- Cart drawer en header (acordeón lateral)
- Página de carrito completa con edición de cantidades
- Checkout con formulario validado
- Modal de pago estilo Niubiz con simulación realista
- Flujo Niubiz real cuando hay backend (`/api/security` + `/api/session`)
- Fallback simulado cuando se corre como HTML estático puro
- Página de confirmación con detalle de orden
- Animaciones de entrada tipo AOS (sin librería)
- Responsive mobile-first
- Logos de marcas de tarjetas (Visa, MasterCard, Amex)

## Notas

- Las imágenes vienen de Unsplash (CDN externa, no pesan en tu hosting).
- Si querés Google Analytics, agregá el snippet en el `<head>` de las páginas con tu `G-XXXXXXXXXX`.
