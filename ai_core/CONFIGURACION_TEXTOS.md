# Personalización de Textos - ChatBot Punto A

## Cómo Personalizar los Textos de la UI

Los textos de la interfaz del usuario pueden ser personalizados desde un archivo `.env` sin necesidad de modificar el código.

### Ubicación del Archivo .env

El archivo `.env` debe estar en la carpeta de instalación:
```
C:\ChatBot_Punto_A\.env
```

### Ejemplo de Archivo .env

Copia el contenido del archivo `.env.ejemplo` y guárdalo como `.env` en la carpeta `C:\ChatBot_Punto_A`:

```bash
APP_TITLE=Mi ChatBot Personalizado
APP_SUBTITLE=Sistema de Atención al Cliente
APP_DESCRIPTION=Tu descripción aquí
EMPRESA_LABEL=Tu etiqueta aquí
WHATSAPP_BTN=Mi Botón Personalizado
```

### Variables Disponibles

#### Títulos Principales
- `APP_TITLE` - Nombre de la aplicación
- `APP_SUBTITLE` - Subtítulo principal
- `APP_DESCRIPTION` - Descripción de la app

#### Ventana del Instalador
- `INSTALLER_TITLE` - Título de la ventana
- `HARDWARE_TITLE` - Título de sección de hardware
- `CONFIG_TITLE` - Título de configuración

#### Campos del Formulario
- `EMPRESA_LABEL` - Label "Nombre de la empresa"
- `EMPRESA_PLACEHOLDER` - Placeholder ejemplo para empresa
- `TRAFICO_LABEL` - Label para tráfico diario
- `TRAFICO_PLACEHOLDER` - Placeholder ejemplo para tráfico
- `TRAFICO_HELP` - Texto de ayuda del tráfico

#### WhatsApp
- `WHATSAPP_LABEL` - Label de WhatsApp
- `WHATSAPP_BTN` - Texto del botón de vinculación
- `WHATSAPP_LINKED` - Texto cuando está vinculado
- `WHATSAPP_NOT_LINKED` - Texto cuando no está vinculado

#### Botones de Configuración
- `CONFIG_TITLE_BUTTONS` - Título de botones de configuración
- `BTN_CONVERSACIONES` - Botón de Conversaciones
- `BTN_CONFIG_A1` - Botón de Menú A1
- `BTN_CONFIG_A2` - Botón de IA A2
- `BTN_CONFIG_A3` - Botón de Tickets A3

#### Botones Generales
- `INSTALL_BTN` - Texto del botón "Instalar"
- `INSTALLING` - Texto durante la instalación

#### Ventana QR
- `QR_WINDOW_TITLE` - Título de la ventana QR
- `QR_WINDOW_TITLE2` - Subtítulo en ventana QR
- `QR_INSTRUCTIONS` - Instrucciones para escanear
- `QR_LOADING` - Texto "Cargando QR"
- `QR_WAITING` - Texto "Esperando QR"
- `QR_READY` - Texto QR listo
- `QR_CONNECTED` - Texto vinculado correctamente
- `QR_REFRESH` - Botón refrescar
- `QR_CLOSE` - Botón cerrar

### Ejemplo Práctico

Para crear una app para un negocio llamado "Ejemplo S.A.", crea el archivo `.env` con:

```env
# Títulos
APP_TITLE=Ejemplo S.A. - Atención al Cliente
APP_SUBTITLE=Sistema Automatizado WhatsApp
APP_DESCRIPTION=Servicio de atención al cliente disponible 24/7

# Formulario
EMPRESA_LABEL=Nombre de tu tienda:
EMPRESA_PLACEHOLDER=Ej: Tienda Central
CONFIG_TITLE=Configura tu Sistema de Apoyo

# Botones
INSTALL_BTN=Instalar Sistema Ejemplo S.A.
BTN_CONVERSACIONES=💬 Ver Chats
BTN_CONFIG_A1=🔘 Menú Principal
BTN_CONFIG_A2=🤖 Entrenar IA
BTN_CONFIG_A3=🎫 Gestión de Casos
```

### Notas

- Los cambios se aplican al reiniciar la aplicación
- Si una variable no está definida en `.env`, se usa el valor por defecto
- El archivo `.env` debe estar en formato UTF-8
- Los valores deben estar entre comillas si contienen espacios

### Comandos para Crear el .env

**Windows PowerShell:**
```powershell
Copy-Item "C:\RouthLocal\punto_a\.env.ejemplo" "C:\ChatBot_Punto_A\.env"
# Luego edita el archivo con tu editor favorito
```

**Windows CMD:**
```cmd
copy "C:\RouthLocal\punto_a\.env.ejemplo" "C:\ChatBot_Punto_A\.env"
```

**Editor de Texto:**
1. Abre Bloc de notas
2. Abre el archivo `.env.ejemplo`
3. Modifica los valores según necesites
4. Guarda como `.env` en `C:\ChatBot_Punto_A\`
