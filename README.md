# Desktop Buddy 🐾

Un pequeño compañero animado que vive flotando sobre tu escritorio.

![Electron](https://img.shields.io/badge/Electron-28-blue) ![Node](https://img.shields.io/badge/Node-24-green) ![Windows](https://img.shields.io/badge/Platform-Windows-blue)

## ✨ Características

- **Mascota animada** con cuerpo blandito, ojos que siguen al mouse, cola que se mueve y cachetes
- **Cambia de humor** cada ~10 minutos: feliz, curioso, somnoliento o emocionado (cambia de color)
- **Camina sola** por la ventana — la ventana se mueve con ella para no salirse de la pantalla
- **Clic izquierdo**: lanza corazones y destellos, muestra bocadillo con la hora + saludo + mensaje divertido
- **Clic izquierdo repetido**: cambia la frase del bocadillo
- **Doble clic**: explosión de corazones y destellos
- **Clic derecho**: menú contextual centrado con opciones Reiniciar y Cerrar
- **Arrastrable**: puedes agarrarla y moverla por la pantalla
- **Auto-actualización**: detecta nuevas versiones en GitHub Releases al iniciar
- **Ventana transparente** siempre al frente, sin marco

## 🚀 Instalación

```bash
# Clonar o copiar el proyecto
cd desktop-buddy

# Instalar dependencias
npm install

# Iniciar
npm start
```

## 📦 Build

### Portable
```bash
npm run pack
```
Genera `dist/DesktopBuddy-win32-x64/DesktopBuddy.exe` (~177 MB). Copia la carpeta a cualquier PC y ejecútalo sin Node.js.

### Instalador
```bash
npm run build
```
Genera `dist/Desktop Buddy Setup 1.2.0.exe` (~152 MB). Instalador NSIS con asistente, selector de ruta y acceso directo en el escritorio.

### Desinstalar
- **Con instalador**: ejecuta `Uninstall.exe` — busca en el registro de Windows y lanza el desinstalador oficial
- **Versión portable**: elimina la carpeta `dist\DesktopBuddy-win32-x64` manualmente

## 🎮 Controles

| Acción | Resultado |
|---|---|
| Clic izquierdo | Corazones + bocadillo con hora |
| Clic izquierdo (ya visible) | Cambia la frase |
| Doble clic | Explosión de corazones |
| Clic derecho | Menú contextual (Reiniciar / Cerrar) |
| Arrastrar | Mueve la ventana |
| Clic en "Actualización lista" | Instala la nueva versión y reinicia |

## 🏗️ Estructura

```
desktop-buddy/
├── main.js          # Proceso principal de Electron
├── preload.js       # Puente seguro entre procesos
├── renderer.html    # Interfaz HTML
├── renderer.js      # Lógica de la mascota (Canvas 2D)
├── Uninstall.exe    # Desinstalador nativo
├── package.json
├── .gitignore
├── README.md
└── CHANGELOG.md
```

## 🔄 Auto-actualizacion

La app busca actualizaciones al iniciar usando GitHub Releases.

### Configurar

1. Crea un repo en GitHub y sube el proyecto
2. Edita `package.json` y reemplaza `TU_USUARIO` y `TU_REPO` con los tuyos
3. Para publicar una nueva version:

```bash
# 1. Actualiza la version en package.json (ej: 1.2.0)
# 2. Crea un tag en git: git tag v1.2.0
# 3. Sube el tag: git push origin v1.2.0
# 4. Genera el instalador y subelo a GitHub:
npm run release
```

Esto creara un Release en GitHub automaticamente con el instalador adjunto.
Los usuarios recibiran la actualizacion la proxima vez que abran la app.

## 📄 Licencia

MIT
