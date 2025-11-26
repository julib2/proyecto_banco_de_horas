// Obtener elementos del DOM
const formularioPublicar = document.getElementById('formularioPublicar');

if (formularioPublicar) {
  formularioPublicar.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener token del usuario autenticado
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No se ha iniciado sesión. Por favor, inicia sesión para publicar una tutoría.');
      window.location.href = 'login.html';
      return;
    }

    // Decodificar token para obtener documento del usuario
    function parseJwt (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      } catch {
        return null;
      }
    }

    const userData = parseJwt(token);
    if (!userData || !userData.documento) {
      alert('Token inválido o expirado. Por favor, vuelve a iniciar sesión.');
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    const EstudianteDocumento = userData.documento;

    // Obtenemos datos del formulario
    const formData = new FormData(formularioPublicar);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Añadimos usuario documento al cuerpo de la solicitud
    data.UsuarioDocumento = EstudianteDocumento;

    try {
      const response = await fetch('/api/asesorias/tutorias/registrar-asesoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Tutoría publicada correctamente con ID: ' + result.id);
        // Opcional: redirigir o limpiar formulario
      } else {
        alert('Error al publicar tutoría: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al conectar con el servidor. Por favor intenta nuevamente.');
    }
  });
}
