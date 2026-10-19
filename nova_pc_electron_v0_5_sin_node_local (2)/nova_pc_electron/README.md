# Nova PC 0.4

Aplicación de escritorio Windows basada en Electron. Conserva la interfaz web del proyecto y usa un `webview` de Electron para la navegación integrada.

## Desarrollo

Requiere Node.js LTS y conexión a Internet la primera vez.

```bash
npm install
npm start
```

## Instalador de Windows

En Windows, ejecuta `CREAR_INSTALADOR.bat` o usa `npm run dist`. El instalador NSIS se genera en `dist/`.

No evita ni desactiva Microsoft Family Safety ni otros controles de Windows.
