// ---------------------------
// ELEMENTOS DEL DOM
// ---------------------------
const opcionVerOfertas = document.getElementById('ver-ofertas');
const opcionPublicarTutoria = document.getElementById('publicar-tutoria');

// Historial Tutorías
const historialTutoriasBtn = document.getElementById('historial-horas');
const modalHistorial = document.getElementById('modal-historial');
const cerrarModalHistorialBtn = document.getElementById('cerrar-modal');
const btnMisTutorias = document.getElementById('btn-mis-tutorias');
const btnTutoriasTomadas = document.getElementById('btn-tutorias-tomadas');
const contenidoHistorial = document.getElementById('contenido-historial');

// Historial Horas
const btnHistorialHoras = document.getElementById('btn-historial-horas');
const modalHoras = document.getElementById('modal-horas');
const cerrarModalHorasBtn = document.getElementById('cerrar-modal-horas');
const contenidoHoras = document.getElementById('contenido-horas');

let currentModalType = null;

// ---------------------------
// EVENT LISTENERS
// ---------------------------
if (opcionVerOfertas) opcionVerOfertas.addEventListener('click', () => window.location.href = 'tutorias.html');
if (opcionPublicarTutoria) opcionPublicarTutoria.addEventListener('click', () => window.location.href = 'publicar.html');

if (historialTutoriasBtn) historialTutoriasBtn.addEventListener('click', abrirModalHistorial);
if (cerrarModalHistorialBtn) cerrarModalHistorialBtn.addEventListener('click', cerrarModalHistorial);
if (btnMisTutorias) btnMisTutorias.addEventListener('click', () => cargarTutorias('/api/asesorias/tutorias/mis-tutorias', 'mis-tutorias'));
if (btnTutoriasTomadas) btnTutoriasTomadas.addEventListener('click', () => cargarTutorias('/api/asesorias/tutorias/tutorias-tomadas', 'tutorias-tomadas'));

if (btnHistorialHoras) btnHistorialHoras.addEventListener('click', abrirModalHoras);
if (cerrarModalHorasBtn) cerrarModalHorasBtn.addEventListener('click', cerrarModalHoras);

// Cerrar modales al hacer clic fuera
window.addEventListener('click', e => {
    if (e.target === modalHistorial) cerrarModalHistorial();
    if (e.target === modalHoras) cerrarModalHoras();
});

// ---------------------------
// TOKEN
// ---------------------------
function getToken() {
    return localStorage.getItem('token');
}

// ---------------------------
// USUARIO
// ---------------------------
async function cargarInfoUsuario() {
    const token = getToken();
    if (!token) return window.location.href = 'login.html';

    try {
        const res = await fetch('/api/auth/profile', { headers: { 'Authorization': token } });
        if (res.ok) {
            const user = await res.json();
            mostrarInfoUsuario(user.user);
        } else {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    } catch (e) {
        console.error('Error cargando usuario:', e);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

function mostrarInfoUsuario(user) {
    const usuarioInfo = document.getElementById('usuario-info');
    if (!usuarioInfo) return;
    usuarioInfo.innerHTML = `
        <div class="usuario-nombre">${user.Nombre || user.nombre}</div>
        <div class="usuario-correo">${user.Correo || user.correo}</div>
        <button class="cerrar-sesion" onclick="cerrarSesion()">Cerrar Sesión</button>
    `;
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// ---------------------------
// MODAL HISTORIAL TUTORÍAS
// ---------------------------
function abrirModalHistorial() {
    if (!modalHistorial || !contenidoHistorial) return;
    modalHistorial.style.display = 'block';
    contenidoHistorial.innerHTML = '<p>Cargando historial de tutorías...</p>';
    currentModalType = 'historial';
    cargarTutorias('/api/asesorias/tutorias/mis-tutorias', 'mis-tutorias'); // carga inicial
}

function cerrarModalHistorial() {
    if (!modalHistorial || !contenidoHistorial) return;
    modalHistorial.style.display = 'none';
    contenidoHistorial.innerHTML = '';
}

// ---------------------------
// MODAL HISTORIAL HORAS
// ---------------------------
function abrirModalHoras() {
    if (!modalHoras || !contenidoHoras) return;
    modalHoras.style.display = 'block';
    contenidoHoras.innerHTML = '<p>Cargando historial de horas...</p>';
    cargarHistorialHoras();
}

function cerrarModalHoras() {
    if (!modalHoras || !contenidoHoras) return;
    modalHoras.style.display = 'none';
    contenidoHoras.innerHTML = '';
}

// ---------------------------
// FUNCIONES AUXILIARES
// ---------------------------
function pick(obj, ...keys) {
    for (const k of keys) {
        if (!obj) continue;
        if (obj[k] !== undefined && obj[k] !== null) return obj[k];
        const lower = k.toLowerCase();
        const camel = k[0].toLowerCase() + k.slice(1);
        if (obj[lower] != null) return obj[lower];
        if (obj[camel] != null) return obj[camel];
    }
    return undefined;
}

// ---------------------------
// TUTORÍAS
// ---------------------------
async function cargarTutorias(url, tipo) {
    const token = getToken();
    if (!token) return window.location.href = 'login.html';

    try {
        const res = await fetch(url, { headers: { 'Authorization': token } });
        let data;
        try { data = await res.json(); } catch(e) {
            console.error('Error parseando JSON:', e);
            if (contenidoHistorial) contenidoHistorial.innerHTML = '<p>Error: la respuesta no es JSON.</p>';
            return;
        }

        if (res.ok) mostrarTutoriasEnModal(data, tipo);
        else if (contenidoHistorial) contenidoHistorial.innerHTML = `<p>Error al cargar tutorías: ${data.error || JSON.stringify(data)}</p>`;
    } catch (e) {
        console.error('Error de red:', e);
        if (contenidoHistorial) contenidoHistorial.innerHTML = '<p>Error de conexión al cargar tutorías.</p>';
    }
}

function mostrarTutoriasEnModal(tutorias, tipo) {
    if (!contenidoHistorial) return;
    if (!Array.isArray(tutorias) || tutorias.length === 0) {
        contenidoHistorial.innerHTML = '<p>No hay tutorías disponibles.</p>';
        return;
    }

    contenidoHistorial.innerHTML = tutorias.map(t => {
        const id = pick(t, 'id', 'Id');
        const tema = pick(t, 'tema', 'Tema') || 'Sin tema';
        const estado = pick(t, 'estado', 'Estado') || 'Pendiente';
        const estudianteNombre = pick(t, 'estudiantenombre', 'estudianteNombre', 'nombre');
        const tutorNombre = pick(t, 'tutornombre', 'tutorNombre', 'tutor_nombre');
        const categoriaNombre = pick(t, 'categorianombre', 'categoriaNombre', 'categoria');
        const fechaRaw = pick(t, 'fechaasesoria', 'FechaAsesoria', 'fecha');
        const horas = pick(t, 'horassolicitadas', 'HorasSolicitadas', 'horas') || 0;

        const fecha = fechaRaw ? (isNaN(Date.parse(fechaRaw)) ? fechaRaw : new Date(fechaRaw).toLocaleString()) : 'N/A';
        const nombrePersona = tipo === 'mis-tutorias' ? (estudianteNombre || 'N/A') : (tutorNombre || 'N/A');
        const labelPersona = tipo === 'mis-tutorias' ? 'Estudiante:' : 'Tutor:';

        const accionesHTML = tipo === 'tutorias-tomadas' ? `
            <div class="tutoria-acciones">
                <button class="boton-accion" onclick="confirmarTutoria(${id}, '${tipo}')">Confirmar</button>
                <button class="boton-accion" onclick="rechazarTutoria(${id}, '${tipo}')">Rechazar</button>
            </div>` : '';

        return `
            <div class="tutoria-item">
                <h4>${tema}</h4>
                <p><strong>${labelPersona}</strong> ${nombrePersona}</p>
                <p><strong>Categoría:</strong> ${categoriaNombre || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Horas:</strong> ${horas}</p>
                <p><strong>Estado:</strong> <span class="estado">${estado}</span></p>
                ${accionesHTML}
            </div>`;
    }).join('');
}

// ---------------------------
// HISTORIAL DE HORAS
// ---------------------------
async function cargarHistorialHoras() {
    const token = getToken();
    if (!token) return window.location.href = 'login.html';

    try {
        const res = await fetch('/api/horas/historial', { headers: { 'Authorization': token } });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
            if (contenidoHoras) contenidoHoras.innerHTML = `<p>Error al cargar historial: ${errorData.error || 'Desconocido'}</p>`;
            return;
        }

        const horas = await res.json();

        // Mapear de la tabla Transaccion
        mostrarHistorialHoras(horas.map(h => ({
            fecha: h.Fecha || h.fecha,
            tipo: h.Tipo || h.tipo,
            cantidad: h.Horas || h.horas
        })));
    } catch (e) {
        console.error('Error de red al cargar historial de horas:', e);
        if (contenidoHoras) contenidoHoras.innerHTML = '<p>Error de conexión al cargar historial de horas.</p>';
    }
}

function mostrarHistorialHoras(horas) {
    if (!contenidoHoras) return;

    if (!Array.isArray(horas) || horas.length === 0) {
        contenidoHoras.innerHTML = '<p>No hay registros de horas.</p>';
        return;
    }

    contenidoHoras.innerHTML = horas.map(h => {
        const fecha = h.fecha ? new Date(h.fecha).toLocaleString() : 'N/A';
        const tipo = h.tipo || 'N/A';
        const cantidad = h.cantidad || 0;
        return `
            <div class="historial-item">
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Tipo:</strong> ${tipo}</p>
                <p><strong>Cantidad de horas:</strong> ${cantidad}</p>
                <hr>
            </div>`;
    }).join('');
}

// ---------------------------
// INICIALIZAR PÁGINA
// ---------------------------
function initIndex() {
    console.log('Banco de Horas inicializado');
    cargarInfoUsuario();
}

document.addEventListener('DOMContentLoaded', initIndex);
