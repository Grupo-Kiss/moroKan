La manera más fácil y rápida de hacer esto para una partida es usar un servicio de túnel como
  ngrok. Este programa crea una dirección web pública y temporal que redirige el tráfico de internet
  a tu localhost:3000.

  Aquí tienes los pasos detallados para ti (el Host) y para tu amigo.

  Instrucciones para Ti (El Anfitrión)

  Paso 1: Mantén tu servidor funcionando

  Asegúrate de que tu servidor de Node.js está activo. Deberías tener una terminal abierta en la
  carpeta de tu proyecto ejecutando:

  node server.js

  Paso 2: Descarga ngrok

   1. Ve a la página oficial de ngrok y descarga el programa para Windows. Es un único archivo .zip.

 ╭────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔ GoogleSearch Searching the web for: "ngrok download"                                    │
 │                                                                                            │
 │    Search results for "ngrok download" returned.                                           │
 ╰────────────────────────────────────────────────────────────────────────────────────────────╯
✦  2. Descomprime el archivo. Dentro tendrás ngrok.exe.

  Paso 3: Inicia el túnel de ngrok

   1. Abre una nueva terminal (deja la de node server.js funcionando).
   2. Navega en esta nueva terminal hasta la carpeta donde descomprimiste ngrok.exe.
   3. Ejecuta el siguiente comando. Le dice a ngrok que exponga tu puerto 3000 a internet:

   1     ngrok http 3000

  Paso 4: Obtén y comparte la dirección pública

  Después de ejecutar el comando, la terminal de ngrok te mostrará algo así:

   1 Session Status                online
   2 Account                       TuNombre (Plan: Free)
   3 Version                       3.x.x
   4 Region                        United States (us)
   5 Web Interface                 http://127.0.0.1:4040
   6 Forwarding                    https://random-string-of-letters.ngrok-free.app ->
     http://localhost:3000

  La dirección que necesitas es la que dice Forwarding y empieza con https://.

  Copia esa dirección (ej: https://random-string-of-letters.ngrok-free.app) y envíasela a tu amigo.

  Instrucciones para tu Amigo (El Jugador Remoto)

  Las instrucciones para tu amigo son muy sencillas:

   1. Abre su navegador web (Chrome, Firefox, etc.).
   2. Pega la dirección https://... que le enviaste en la barra de direcciones y presiona Enter.

  ¡Y eso es todo! El modal de configuración del juego debería aparecer en su pantalla, y cuando
  ambos inicien la partida, estarán conectados a tu servidor y podrán jugar en tiempo real.




  :::::::::::::::::::::::::::::::::::

### PARA JUGAR

1. Iniciar tu servidor (node server.js).
2. Iniciar ngrok (ngrok http 3000).
3. Abrir el juego en tu navegador (http://localhost:3000).
4. Copiar el vínculo que aparece en la consola de estado y enviárselo a tu amigo.