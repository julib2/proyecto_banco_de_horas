// elementos del dom
const opcionVerOfertas = document.getElementById('ver-ofertas');
const opcionPublicarTutoria = document.getElementById('publicar-tutoria');
const historialHorasBtn = document.getElementById('historial-horas');
const modalHistorial = document.getElementById('modal-historial');
const cerrarModal = document.getElementById('cerrar-modal');
const btnMisTutorias = document.getElementById('btn-mis-tutorias');
const btnTutoriasTomadas = document.getElementById('btn-tutorias-tomadas');
const contenidoHistorial = document.getElementById('contenido-historial');

// variable para rastrear el tipo de modal actual
let currentModalType = null;

// Verificar si los elementos existen antes de agregar event listeners
if (opcionVerOfertas) opcionVerOfertas.addEventListener('click', manejarVerOfertas);
if (opcionPublicarTutoria) opcionPublicarTutoria.addEventListener('click', manejarPublicarTutoria);
if (historialHorasBtn) historialHorasBtn.addEventListener('click', abrirModalHistorial);
if (cerrarModal) cerrarModal.addEventListener('click', cerrarModalHistorial);
if (btnMisTutorias) btnMisTutorias.addEventListener('click', cargarMisTutorias);
if (btnTutoriasTomadas) btnTutoriasTomadas.addEventListener('click', cargarTutoriasTomadas);

// función para obtener el token del localStorage
function getToken() {
    return localStorage.getItem('token');
}

// función para cargar información del usuario
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

// función para mostrar información del usuario en el header
function mostrarInfoUsuario(user) {
    const usuarioInfo = document.getElementById('usuario-info');
    usuarioInfo.innerHTML = `
        <div class="usuario-nombre">${user.nombre}</div>
        <div class="usuario-correo">${user.correo}</div>
        <button class="cerrar-sesion" onclick="cerrarSesion()">Cerrar Sesión</button>
    `;
}

// función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// función para manejar clic en ver ofertas
function manejarVerOfertas() {
    console.log('Redirigiendo a ver ofertas de tutorías');
    // aquí redirigirías a la página de ofertas
    window.location.href = 'tutorias.html';
}

// función para manejar clic en publicar tutoría
function manejarPublicarTutoria() {
    console.log('Redirigiendo a publicar tutoría');
    // aquí redirigirías a la página de publicar
    // window.location.href = 'publicar.html';
    console.log('Redirigiendo a publicar tutoría');
  window.location.href = 'publicar.html';
    //alert('Funcionalidad: Publicar tutoría (pendiente de implementar)');
}

// función para abrir el modal del historial
function abrirModalHistorial() {
    modalHistorial.style.display = 'block';
    currentModalType = 'historial';
}

// función para cerrar el modal del historial
function cerrarModalHistorial() {
    modalHistorial.style.display = 'none';
    contenidoHistorial.innerHTML = ''; // Limpiar contenido al cerrar
}

// --- DEBUG + RENDER ROBUSTO ---

// helper: devuelve el primer campo existente entre varias opciones
function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj == null) continue;
    if (k in obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
    // check lowercase/uppercase variations
    const lower = k.toLowerCase();
    const upper = k.toUpperCase();
    const camel = k[0]?.toLowerCase() + k.slice(1);
    if (lower in obj && obj[lower] !== undefined && obj[lower] !== null) return obj[lower];
    if (upper in obj && obj[upper] !== undefined && obj[upper] !== null) return obj[upper];
    if (camel in obj && obj[camel] !== undefined && obj[camel] !== null) return obj[camel];
  }
  return undefined;
}

async function cargarMisTutorias() {
    const token = getToken();
    if (!token) { window.location.href = 'login.html'; return; }

    try {
        const response = await fetch('/api/tutorias/mis-tutorias', {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        console.log('🔁 cargarMisTutorias response status:', response.status);

        // intentar parsear JSON aunque venga error
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('Error parseando JSON en cargarMisTutorias:', e);
            if (contenidoHistorial) contenidoHistorial.innerHTML = '<p>Error: la respuesta no es JSON. Mira la consola.</p>';
            return;
        }

        console.log('🔍 mis-tutorias raw data:', data);

        if (response.ok) {
            mostrarTutoriasEnModal(data, 'mis-tutorias');
        } else {
            // mostrar mensaje con detalle si existe
            if (contenidoHistorial) contenidoHistorial.innerHTML = `<p>Error al cargar las tutorías: ${data.error || JSON.stringify(data)}</p>`;
        }
    } catch (error) {
        console.error('Error al cargar mis tutorías:', error);
        if (contenidoHistorial) contenidoHistorial.innerHTML = '<p>Error al cargar las tutorías. Revisa la consola.</p>';
    }
}

async function cargarTutoriasTomadas() {
    const token = getToken();
    if (!token) { window.location.href = 'login.html'; return; }

    try {
        const response = await fetch('/api/tutorias/tutorias-tomadas', {
            method: 'GET',
            headers: { 'Authorization': token }
        });

        console.log('🔁 cargarTutoriasTomadas response status:', response.status);

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('Error parseando JSON en cargarTutoriasTomadas:', e);
            if (contenidoHistorial) contenidoHistorial.innerHTML = '<p>Error: la respuesta no es JSON. Mira la consola.</p>';
            return;
        }

        console.log('🔍 tutorias-tomadas raw data:', data);

        if (response.ok) {
            mostrarTutoriasEnModal(data, 'tutorias-tomadas');
        } else {
            if (contenidoHistorial) contenidoHistorial.innerHTML = `<p>Error al cargar las tutorías: ${data.error || JSON.stringify(data)}</p>`;
        }
    } catch (error) {
        console.error('Error al cargar tutorías tomadas:', error);
        if (contenidoHistorial) contenidoHistorial.innerHTML = '<p>Error al cargar las tutorías. Revisa la consola.</p>';
    }
}

function mostrarTutoriasEnModal(tutorias, tipo) {
    console.log('▶ mostrarTutoriasEnModal recibido:', tutorias, 'tipo:', tipo);

    if (!contenidoHistorial) {
        console.error('contenidoHistorial no existe en el DOM');
        return;
    }

    if (!Array.isArray(tutorias) || tutorias.length === 0) {
        contenidoHistorial.innerHTML = '<p>No hay tutorías disponibles.</p>';
        return;
    }

    contenidoHistorial.innerHTML = tutorias.map(tutoria => {
        // recoger campos probables
        const id = pick(tutoria, 'id', 'Id');
        const tema = pick(tutoria, 'tema', 'Tema');
        const estado = pick(tutoria, 'estado', 'Estado') || 'Pendiente';
        const estudianteDocumento = pick(tutoria, 'estudiantedocumento', 'usuariodocumento', 'UsuarioDocumento', 'estudianteDocumento');
        const estudianteNombre = pick(tutoria, 'estudiantenombre', 'estudianteNombre', 'estudiante_nombre', 'nombre');
        const tutorNombre = pick(tutoria, 'tutornombre', 'tutorNombre', 'tutor_nombre');
        const categoriaNombre = pick(tutoria, 'categorianombre', 'categoriaNombre', 'categoria_nombre', 'categoria');
        const fechaRaw = pick(tutoria, 'fechaasesoria', 'FechaAsesoria', 'fecha', 'fecha_asesoria');
        const horas = pick(tutoria, 'horassolicitadas', 'HorasSolicitadas', 'horas', 'horas_solicitadas') || 0;

        const fecha = fechaRaw ? (isNaN(Date.parse(fechaRaw)) ? fechaRaw : new Date(fechaRaw).toLocaleString()) : 'N/A';

        const nombrePersona = tipo === 'mis-tutorias' ? (estudianteNombre || estudianteDocumento || 'N/A') : (tutorNombre || estudianteDocumento || 'N/A');
        const labelPersona = tipo === 'mis-tutorias' ? 'Estudiante:' : 'Tutor:';

        const accionesHTML = tipo === 'tutorias-tomadas' ? `
                <div class="tutoria-acciones">
                    <button class="boton-accion" onclick="confirmarTutoria(${id}, '${tipo}')">Confirmar</button>
                    <button class="boton-accion" onclick="rechazarTutoria(${id}, '${tipo}')">Rechazar</button>
                </div>` : '';

        return `
            <div class="tutoria-item">
                <h4>${tema || 'Sin tema'}</h4>
                <p><strong>${labelPersona}</strong> ${nombrePersona}</p>
                <p><strong>Categoría:</strong> ${categoriaNombre || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Horas:</strong> ${horas}</p>
                <p><strong>Estado:</strong> <span class="estado">${estado}</span></p>
                ${accionesHTML}
            </div>
        `;
    }).join('');
}

// funciones para confirmar y rechazar tutorías
async function confirmarTutoria(id, tipo) {
    if (confirm('¿Estás seguro de que quieres confirmar esta tutoría?')) {
        try {
            const response = await fetch(`/api/tutorias/${id}/confirmar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getToken()
                }
            });

            if (response.ok) {
                alert('Tutoría confirmada exitosamente.');
                // recargar la lista según el tipo
                if (tipo === 'mis-tutorias') {
                    cargarMisTutorias();
                } else if (tipo === 'tutorias-tomadas') {
                    cargarTutoriasTomadas();
                }
            } else {
                alert('Error al confirmar la tutoría.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión.');
        }
    }
}

async function rechazarTutoria(id, tipo) {
    if (confirm('¿Estás seguro de que quieres rechazar esta tutoría?')) {
        try {
            const response = await fetch(`/api/tutorias/${id}/rechazar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getToken()
                }
            });

            if (response.ok) {
                alert('Tutoría rechazada.');
                // recargar la lista según el tipo
                if (tipo === 'mis-tutorias') {
                    cargarMisTutorias();
                } else if (tipo === 'tutorias-tomadas') {
                    cargarTutoriasTomadas();
                }
            } else {
                alert('Error al rechazar la tutoría.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión.');
        }
    }
}

// event listeners (ya agregados arriba con verificación de existencia)

// cerrar modal al hacer clic fuera de él
window.addEventListener('click', function(event) {
    if (event.target === modalHistorial) {
        cerrarModalHistorial();
    }
});

// función para inicializar la página
function initIndex() {
    console.log('Página de inicio del Banco de Horas inicializada');
    cargarInfoUsuario();
    // aquí puedes agregar más inicializaciones si es necesario
}

// inicializar cuando el dom esté listo
document.addEventListener('DOMContentLoaded', initIndex);
