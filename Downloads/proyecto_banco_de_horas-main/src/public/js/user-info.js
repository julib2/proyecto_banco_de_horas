// Función para obtener el token del localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Función para cargar información del usuario
async function cargarInfoUsuario() {
    const token = getToken();
    if (!token) {
        // Si no hay token, redirigir al login
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (response.ok) {
            const user = await response.json();
            mostrarInfoUsuario(user.user);
        } else {
            // Si el token no es válido, redirigir al login
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error al cargar información del usuario:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Función para mostrar información del usuario en el header
function mostrarInfoUsuario(user) {
    const usuarioInfo = document.getElementById('usuario-info');
    if (usuarioInfo) {
        usuarioInfo.innerHTML = `
            <div class="usuario-nombre">${user.nombre}</div>
            <div class="usuario-correo">${user.correo}</div>
            <button class="cerrar-sesion" onclick="cerrarSesion()">Cerrar Sesión</button>
        `;
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarInfoUsuario);
