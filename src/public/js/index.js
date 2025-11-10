// elementos del dom
const opcionVerOfertas = document.getElementById('ver-ofertas');
const opcionPublicarTutoria = document.getElementById('publicar-tutoria');

// función para manejar clic en ver ofertas
function manejarVerOfertas() {
    console.log('Redirigiendo a ver ofertas de tutorías');
    // aquí redirigirías a la página de ofertas
    // window.location.href = 'ofertas.html';
    alert('Funcionalidad: Ver ofertas de tutorías (pendiente de implementar)');
}

// función para manejar clic en publicar tutoría
function manejarPublicarTutoria() {
    console.log('Redirigiendo a publicar tutoría');
    // aquí redirigirías a la página de publicar
    // window.location.href = 'publicar.html';
    alert('Funcionalidad: Publicar tutoría (pendiente de implementar)');
}

// event listeners
opcionVerOfertas.addEventListener('click', manejarVerOfertas);
opcionPublicarTutoria.addEventListener('click', manejarPublicarTutoria);

// función para inicializar la página
function initIndex() {
    console.log('Página de inicio del Banco de Horas inicializada');
    // aquí puedes agregar más inicializaciones si es necesario
}

// inicializar cuando el dom esté listo
document.addEventListener('DOMContentLoaded', initIndex);
