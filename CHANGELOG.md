# Changelog

## [1.2.0] - 2026-06-04

### Added
- Auto-actualizador vía GitHub Releases (electron-updater)
- `Uninstall.exe` compilado en C# nativo
- `.gitignore` para el repo
- Script `npm run release` para publicar updates automáticamente

### Changed
- Package.json actualizado con config de publish para GitHub

## [1.1.0] - 2026-06-04

### Added
- Menú contextual con clic derecho (centrado): opciones Reiniciar y Cerrar
- Clic izquierdo cambia la frase del bocadillo si ya está visible
- Archivo README.md
- Script de build con electron-packager
- Instalador NSIS (electron-builder)

### Changed
- Bocadillo ahora dura 8 segundos (antes 3)
- Bocadillo aparece debajo de la mascota (con posicionamiento inteligente)
- Ventana más alta (160×220) para dar espacio al bocadillo
- Frases del bocadillo se capturan al hacer clic (no cambian a 60fps)

### Fixed
- Bocadillo cortado por posición fuera del canvas
- Ventana cmd al iniciar la app

## [1.0.0] - 2026-06-04

### Added
- Lanzamiento inicial
- Mascota animada con cuerpo, ojos que siguen al mouse, cola y cachetes
- Sistema de ánimos: feliz, curioso, somnoliento, emocionado
- Caminata autónoma dentro de la ventana
- Efectos de corazones y destellos al hacer clic
- Bocadillo con hora, saludo y mensaje divertido
- Ventana transparente siempre al frente
- Arrastre con el mouse
