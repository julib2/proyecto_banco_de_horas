// elementos del dom
const formularioLogin = document.getElementById('formularioLogin');
const campoCorreo = document.getElementById('correo');
const campoContrasena = document.getElementById('contrasena');
const entradasRol = document.querySelectorAll('input[name="rol"]');
const divMensaje = document.getElementById('mensaje');

// función para mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'error') {
    divMensaje.textContent = mensaje;
    divMensaje.className = `mensaje ${tipo}`;
    divMensaje.style.display = 'block';

    // ocultar mensaje después de 5 segundos
    setTimeout(() => {
        divMensaje.style.display = 'none';
    }, 5000);
}

// función para obtener el rol seleccionado
function obtenerRolSeleccionado() {
    for (const entradaRol of entradasRol) {
        if (entradaRol.checked) {
            return entradaRol.value;
        }
    }
    return 'usuario'; // valor por defecto
}

// event listener para el formulario de login
formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = campoCorreo.value.trim();
    const contrasena = campoContrasena.value;
    const rol = obtenerRolSeleccionado();

    // validación básica
    if (!usuario || !contrasena) {
        mostrarMensaje('Por favor, completa todos los campos.');
        return;
    }

    // construir el correo completo
    const correo = `${usuario}@pascual.edu`;

    try {
        // aquí iría la llamada a la api
        // por ahora, simulamos una respuesta
        console.log('Intentando login con:', { correo, contrasena, rol });

        // simulación de login exitoso
        mostrarMensaje('Login exitoso. Redirigiendo...', 'success');

        // redirigir al index después de un breve delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Error en login:', error);
        mostrarMensaje('Error al iniciar sesión. Inténtalo de nuevo.');
    }
});

// función para inicializar la página
function init() {
    console.log('Página de login inicializada');
    // aquí puedes agregar más inicializaciones si es necesario
}

// inicializar cuando el dom esté listo
document.addEventListener('DOMContentLoaded', init);
