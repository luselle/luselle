LUSELLE - INSTALACIÓN DE LA PRIMERA VERSIÓN
==========================================

IMPORTANTE
- El frontend se publica en GitHub Pages.
- El backend corre en Cloudflare Workers.
- Los datos se guardan en Cloudflare D1 (luselle_db).
- Nunca pongas la clave BOOTSTRAP_TOKEN dentro de HTML o JavaScript público.
- Esta versión implementa cuentas, tickets, asignación y estados básicos. No implementa pagos reales ni recuperación de contraseña.

PARTE A. PREPARAR LA BASE DE DATOS (UNA SOLA VEZ)
1. Entra a Cloudflare > Storage & databases > D1 SQL Database > luselle_db.
2. Abre Console.
3. Abre el archivo backend/database.sql en VS Code.
4. Copia TODO su contenido y pégalo en la consola SQL de D1.
5. Ejecuta el script. Deben crearse las tablas users, services, tickets, sessions y ticket_events, además de los 10 servicios iniciales.
No ejecutes el script repetidamente si no es necesario; usa IF NOT EXISTS, pero los INSERT OR IGNORE evitan duplicar servicios.

PARTE B. PUBLICAR EL BACKEND
1. En Cloudflare > Workers & Pages > luselle-api > Edit code.
2. Reemplaza el código actual por TODO el contenido de backend/worker.js.
3. Guarda y pulsa Deploy.
4. En Settings > Variables and Secrets agrega:
   - Variable de texto ALLOWED_ORIGIN = el origen exacto de tu GitHub Pages. Ejemplo: https://luselle.github.io (usa el origen real de tu sitio; sin ruta final).
   - Secret BOOTSTRAP_TOKEN = una contraseña larga y aleatoria que solo tú conozcas. No la compartas ni la escribas en archivos del proyecto.
5. Guarda y vuelve a desplegar si Cloudflare lo solicita.
6. Prueba https://luselle-api.luselle7.workers.dev/api/health. Debe responder {"status":"ok","database":"connected"}.

PARTE C. CREAR LA PRIMERA CUENTA GERENTE
1. Sube todos los archivos de esta carpeta a tu repositorio GitHub, conservando la estructura.
2. Espera a que GitHub Pages termine el despliegue.
3. Abre https://TU-USUARIO.github.io/TU-REPOSITORIO/crear-gerente.html (ajusta la dirección a tu sitio real).
4. Escribe el mismo BOOTSTRAP_TOKEN que guardaste como Secret en Cloudflare, nombre, correo, usuario y una contraseña segura.
5. Esta operación solo funciona mientras no exista un gerente. Después de crearla, elimina crear-gerente.html del repositorio o cámbiale el nombre y vuelve a desplegar.
6. Inicia sesión en login.html con la cuenta gerente creada.

PARTE D. PROBAR EL SISTEMA
1. Registra un cliente desde registro.html.
2. Inicia sesión como cliente, crea un ticket y revisa que aparezca como Pendiente.
3. Cierra sesión. Inicia sesión como gerente y aprueba el ticket.
4. En el panel gerente crea un usuario Empleado con contraseña temporal.
5. Asigna el ticket aprobado a ese empleado.
6. Inicia sesión como empleado y prueba Iniciar y Finalizar.
7. Regresa al cliente y comprueba que el estado se actualice.

PARTE E. PUBLICAR EN GITHUB PAGES
1. Copia los archivos nuevos y reemplaza los existentes dentro de tu carpeta local del proyecto.
2. Abre la terminal de VS Code en la carpeta del repositorio.
3. Ejecuta:
   git add .
   git commit -m "Implementa login y sistema de tickets de Luselle"
   git push
4. En GitHub > Actions espera a que Pages aparezca en verde.

NOTAS IMPORTANTES
- En js/config.js la URL del Worker ya está configurada con https://luselle-api.luselle7.workers.dev. Si tu Worker tiene otra URL, cámbiala allí.
- ALLOWED_ORIGIN debe coincidir exactamente con el origen que aparece en la barra del navegador al abrir la web. Si tu sitio está en un repositorio, puede ser https://usuario.github.io; si usas un dominio personalizado, usa ese dominio.
- Las contraseñas se procesan en el Worker con PBKDF2; nunca se guardan en texto plano.
- El navegador conserva un token de sesión. Cierra sesión en equipos compartidos.
- Para producción conviene añadir recuperación de contraseña, protección contra intentos repetidos, reglas de disponibilidad de agenda, política de privacidad, backups y validación de pagos.
