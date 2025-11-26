// elementos del dom
const formularioLogin = document.getElementById('formularioLogin');
const campoCorreo = document.getElementById('correo');
const campoContrasena = document.getElementById('contrasena');
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

// event listener para el formulario de login
formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = campoCorreo.value.trim();
    const contrasena = campoContrasena.value;

    // validación básica
    if (!usuario || !contrasena) {
        mostrarMensaje('Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario,
                contrasena
            })
        });

        const data = await response.json();

        if (response.ok) {
            // guardar token en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userDocumento', data.user.documento);

            mostrarMensaje('Login exitoso. Redirigiendo...', 'success');

            // redirigir al index después de un breve delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            mostrarMensaje(data.error || 'Error al iniciar sesión. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error en login:', error);
        mostrarMensaje('Error de conexión. Inténtalo de nuevo.');
    }
});

// función para inicializar la página
function init() {
    console.log('Página de login inicializada');
    // aquí puedes agregar más inicializaciones si es necesario
}

// inicializar cuando el dom esté listo
document.addEventListener('DOMContentLoaded', init);
