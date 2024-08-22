const apiUrl = "http://localhost:3000/tblpaciente";

// Función para formatear la fecha en el formato YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return ""; // Manejo de valores vacíos
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
};

// Función para calcular la edad en años y meses
const calcularEdad = (fechaNacimiento) => {
  const fechaActual = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edadAnios = fechaActual.getFullYear() - nacimiento.getFullYear();
  let edadMeses = fechaActual.getMonth() - nacimiento.getMonth();

  // Ajustar la edad si el mes actual es antes del mes de nacimiento
  if (edadMeses < 0) {
    edadAnios--;
    edadMeses += 12;
  }

  // Ajustar la edad en meses si el día actual es antes del día de nacimiento
  if (fechaActual.getDate() < nacimiento.getDate()) {
    edadMeses--;
  }

  return { anios: edadAnios, meses: edadMeses };
};

// Función para obtener los datos del formulario
const getFormData = () => {
    const formData = {};
    document.querySelectorAll('.form-field input, .form-field select').forEach(input => {
      formData[input.name] = input.value;
    });
    return formData;
  };

// Función para limpiar el formulario
const limpiarFormulario = () => {
  document.querySelectorAll('.form-field input').forEach(input => {
    input.value = '';
  });
};


// Función para buscar un paciente
async function buscarPaciente() {
    const numeroDocumento = prompt("Ingrese el número de documento del paciente:");
    if (!numeroDocumento) {
        alert("Debe ingresar un número de documento.");
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/${numeroDocumento}`, {
            method: "GET",
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Datos recibidos del backend:", data);

            Object.entries(data).forEach(([key, value]) => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === "checkbox") {
                        field.checked = value === 1;
                    } else if (field.type === "date") {
                        field.value = formatDate(value);
                    } else {
                        field.value = value;
                    }
                }
            });

            // Asignar la descripción del tipo de documento al campo de salida
            const tipoDocumentoField = document.querySelector('[name="tipo_documento"]');
            if (tipoDocumentoField) {
                tipoDocumentoField.value = data.tipo_documento_descripcion || "";
            }

            // Seleccionar el motivo de consulta en el select
            const motivoConsultaField = document.querySelector('[name="motivo_consulta"]');
            if (motivoConsultaField) {
                motivoConsultaField.value = data.motivo_consulta || "";
            }

            // Calcular y mostrar la edad
            if (data.fecha_nacimiento) {
                const { anios, meses } = calcularEdad(data.fecha_nacimiento);
                document.getElementById("ageYears").value = anios;
                document.getElementById("ageMonths").value = meses;
            }

            alert("Paciente encontrado.");
        } else {
            alert("Paciente no encontrado.");
        }
    } catch (error) {
        console.error("Error al buscar el paciente", error);
        alert("Error al buscar el paciente.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("buscar-btn").addEventListener("click", buscarPaciente);
});

// Función para crear un nuevo paciente
async function crearPaciente() {
    const data = getFormData();
  
    // Verificar y convertir el valor del motivo de consulta a entero
    if (data.motivo_consulta) {
      data.motivo_consulta = parseInt(data.motivo_consulta, 10);
    }
  
    // Validar datos requeridos
    if (!data.documento || !data.tipo_documento || !data.primer_nombre || !data.primer_apellido) {
      alert("Debe completar todos los campos requeridos.");
      return;
    }
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(`Paciente creado exitosamente con ID: ${result.id}`);
        limpiarFormulario();
      } else {
        const errorData = await response.json();
        console.error("Error al crear el paciente:", errorData.error);
        alert("Error al crear el paciente.");
      }
    } catch (error) {
      console.error("Error al crear el paciente", error);
      alert("Error al crear el paciente.");
    }
  }

// Función para actualizar un paciente existente
async function actualizarPaciente() {
    const numeroDocumento = document.querySelector('[name="documento"]').value;
    const data = getFormData();
  
    // Verificar y convertir el valor del motivo de consulta
    if (data.motivo_consulta) {
      data.motivo_consulta = parseInt(data.motivo_consulta);
    }
  
    try {
      const response = await fetch(`${apiUrl}/${numeroDocumento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        alert("Paciente actualizado exitosamente.");
      } else {
        alert("Error al actualizar el paciente.");
      }
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
      alert("Error al actualizar el paciente.");
    }
  }

// Función para eliminar un paciente
async function eliminarPaciente() {
  const numeroDocumento = document.querySelector('[name="documento"]').value;

  if (!numeroDocumento) {
    alert("Debe ingresar un número de documento para eliminar.");
    return;
  }

  const confirmacion = confirm("¿Está seguro de que desea eliminar al paciente?");
  if (!confirmacion) return;

  try {
    const response = await fetch(`${apiUrl}/${numeroDocumento}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert("Paciente eliminado exitosamente.");
      limpiarFormulario();
    } else {
      alert("Error al eliminar el paciente.");
    }
  } catch (error) {
    console.error("Error al eliminar el paciente", error);
    alert("Error al eliminar el paciente.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("buscar-btn").addEventListener("click", buscarPaciente);
  document.getElementById("crear-btn").addEventListener("click", crearPaciente);
  document.getElementById("actualizar-btn").addEventListener("click", actualizarPaciente);
  document.getElementById("eliminar-btn").addEventListener("click", eliminarPaciente);
  document.getElementById("limpiar-btn").addEventListener("click", limpiarFormulario);
});


