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

async function buscarPaciente() {
  const numeroDocumento = prompt(
    "Ingrese el número de documento del paciente:"
  );
  if (!numeroDocumento) return;

  try {
    const response = await fetch(`${apiUrl}/${numeroDocumento}`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Datos recibidos del backend:", data); // Depuración: muestra los datos del backend

      Object.entries(data).forEach(([key, value]) => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
          if (field.type === "checkbox") {
            field.checked = value === 1;
          } else if (field.type === "date") {
            field.value = formatDate(value); // Formatea la fecha antes de asignar
          } else {
            field.value = value;
          }
        }
      });

      // Asignar la descripción del tipo de documento al campo de salida
      const tipoDocumentoField = document.querySelector(
        '[name="tipo_documento"]'
      );
      if (tipoDocumentoField) {
        tipoDocumentoField.value = data.tipo_documento_descripcion || ""; // Usar la descripción en lugar del ID
      }

      // Calcular y mostrar la edad
      if (data.fecha_nacimiento) {
        const { anios, meses } = calcularEdad(data.fecha_nacimiento);
        document.getElementById("ageYears").value = anios;
        document.getElementById("ageMonths").value = meses;
      }

      // Actualizar la visibilidad de las tablas basadas en los valores recuperados
      if (typeof actualizarTablas === "function") {
        actualizarTablas();
      }

      document.getElementById("mensaje").textContent = "Paciente encontrado.";
    } else {
      document.getElementById("mensaje").textContent =
        "Paciente no encontrado.";
    }
  } catch (error) {
    console.error("Error al buscar el paciente", error);
    document.getElementById("mensaje").textContent =
      "Error al buscar el paciente.";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("buscar-btn")
    .addEventListener("click", buscarPaciente);
});

