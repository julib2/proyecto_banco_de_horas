// elementos del dom
const formularioRegistro = document.getElementById('formularioRegistro');
const campoNombre = document.getElementById('nombre');
const campoApellido1 = document.getElementById('apellido1');
const campoApellido2 = document.getElementById('apellido2');
const entradasTipoDocumento = document.querySelectorAll('input[name="tipoDocumento"]');
const campoNumeroDocumento = document.getElementById('numeroDocumento');
const divMensajeRegistro = document.getElementById('mensajeRegistro');

// función para mostrar mensajes
function mostrarMensajeRegistro(mensaje, tipo = 'error') {
    divMensajeRegistro.textContent = mensaje;
    divMensajeRegistro.className = `mensaje ${tipo}`;
    divMensajeRegistro.style.display = 'block';

    // ocultar mensaje después de 5 segundos
    setTimeout(() => {
        divMensajeRegistro.style.display = 'none';
    }, 5000);
}

// función para habilitar/deshabilitar el campo de número de documento
function manejarTipoDocumento() {
    const tipoSeleccionado = document.querySelector('input[name="tipoDocumento"]:checked');
    if (tipoSeleccionado) {
        campoNumeroDocumento.disabled = false;
        campoNumeroDocumento.placeholder = `Número de ${tipoSeleccionado.value === 'TI' ? 'Tarjeta de Identidad' : 'Cédula de Ciudadanía'}`;
    } else {
        campoNumeroDocumento.disabled = true;
        campoNumeroDocumento.placeholder = 'Número de Documento';
    }
}

// event listeners para los radio buttons de tipo de documento
entradasTipoDocumento.forEach(entrada => {
    entrada.addEventListener('change', manejarTipoDocumento);
});

// event listener para el formulario de registro
formularioRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = campoNombre.value.trim();
    const apellido1 = campoApellido1.value.trim();
    const apellido2 = campoApellido2.value.trim();
    const tipoDocumento = document.querySelector('input[name="tipoDocumento"]:checked')?.value;
    const numeroDocumento = campoNumeroDocumento.value.trim();

    // validación básica
    if (!nombre || !apellido1 || !apellido2 || !tipoDocumento || !numeroDocumento) {
        mostrarMensajeRegistro('Por favor, completa todos los campos.');
        return;
    }

    // generar correo y contraseña
    const correoGenerado = `${nombre.toLowerCase()}.${apellido1.toLowerCase()}@pascual.edu`;
    const contrasenaGenerada = numeroDocumento;

    try {
        // aquí iría la llamada a la api
        // por ahora, simulamos una respuesta
        console.log('Intentando registro con:', { nombre, apellido1, apellido2, tipoDocumento, numeroDocumento, correoGenerado, contrasenaGenerada });

        // mostrar mensaje emergente con las credenciales generadas
        alert(`Su correo generado es (${correoGenerado}) y la contraseña ${contrasenaGenerada}`);

        // simulación de registro exitoso
        mostrarMensajeRegistro('Registro exitoso. Redirigiendo al login...', 'success');

        // redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Error en registro:', error);
        mostrarMensajeRegistro('Error al registrarse. Inténtalo de nuevo.');
    }
});

// función para inicializar la página
function initRegistro() {
    console.log('Página de registro inicializada');
    manejarTipoDocumento(); // inicializar el estado del campo de documento
}

// inicializar cuando el dom esté listo
document.addEventListener('DOMContentLoaded', initRegistro);
