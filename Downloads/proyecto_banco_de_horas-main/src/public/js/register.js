// elementos del dom
const formularioRegistro = document.getElementById('formularioRegistro');
const campoNombre = document.getElementById('nombre');
const campoApellido = document.getElementById('apellido');
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
    const apellido = campoApellido.value.trim();
    const tipoDocumento = document.querySelector('input[name="tipoDocumento"]:checked')?.value;
    const numeroDocumento = campoNumeroDocumento.value.trim();

    // validación básica
    if (!nombre || !apellido || !tipoDocumento || !numeroDocumento) {
        mostrarMensajeRegistro('Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                apellido,
                tipoDocumento,
                numeroDocumento
            })
        });

        const data = await response.json();

        if (response.ok) {
            // mostrar mensaje emergente con las credenciales generadas
            alert(`Registro exitoso!\nSu correo generado es: ${data.correo}\nSu contraseña es: ${data.contraseña}`);

            mostrarMensajeRegistro('Registro exitoso. Redirigiendo al login...', 'success');

            // redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarMensajeRegistro(data.error || 'Error al registrarse. Inténtalo de nuevo.');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        mostrarMensajeRegistro('Error de conexión. Inténtalo de nuevo.');
    }
});

// función para inicializar la página
function initRegistro() {
    console.log('Página de registro inicializada');
    manejarTipoDocumento(); // inicializar el estado del campo de documento
}

// inicializar cuando el dom esté listo
document.addEventListener('DOMContentLoaded', initRegistro);
