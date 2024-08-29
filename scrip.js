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

    if (edadMeses < 0) {
        edadAnios--;
        edadMeses += 12;
    }

    if (fechaActual.getDate() < nacimiento.getDate()) {
        edadMeses--;
    }

    return { anios: edadAnios, meses: edadMeses };
};

// Función para obtener los datos del formulario
const getFormData = () => {
    const formData = {};
    document.querySelectorAll('.form-field input, .form-field select, .form-field textarea').forEach(input => {
        if (input.name) {
            formData[input.name] = input.type === 'checkbox' ? (input.checked ? 'si' : 'no') : input.value;
        }
    });
    console.log('Datos del formulario:', formData);
    return formData;
};

// Función para limpiar el formulario
const limpiarFormulario = () => {
    document.querySelectorAll('.form-field input, .form-field select, .form-field textarea').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
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

            // Asignar datos del paciente
            Object.entries(data).forEach(([key, value]) => {
                const field = document.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === "checkbox") {
                        field.checked = value === 'si';
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

            // Mostrar datos patológicos
            const fechaDiagnosticoField = document.querySelector('[name="fecha_diagnostico"]');
            if (fechaDiagnosticoField) {
                fechaDiagnosticoField.value = data.fecha_diagnostico ? formatDate(data.fecha_diagnostico) : "";
            }

            // Obtener el campo del tipo de diabetes
            const tipoDiabetesField = document.querySelector('[name="tipo_diabetes"]');
            if (tipoDiabetesField) {
                const opciones = tipoDiabetesField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text === data.tipo_diabetes) {
                        tipoDiabetesField.value = opciones[i].value;
                        break;
                    }
                }
                handleDiabetesTypeChange();
            }

            const debutField = document.querySelector('[name="debut"]');
            if (debutField) {
                debutField.value = data.debut || "";
            }

            const observacionField = document.querySelector('[name="observacion"]');
            if (observacionField) {
                observacionField.value = data.observacion || "";
            }

            // Datos de retinopatía
            const consultationDateField = document.querySelector('#consultationDate');
            if (consultationDateField) {
                consultationDateField.value = formatDate(data.fecha_consulta);
            }

            const lastEyeExamDateField = document.querySelector('#lastEyeExamDate');
            if (lastEyeExamDateField) {
                lastEyeExamDateField.value = formatDate(data.fecha_ultima_evaluacion);
            }

            const retinopathyDiagnosisField = document.querySelector('[name="retinopathyDiagnosis"]');
            if (retinopathyDiagnosisField) {
                const opciones = retinopathyDiagnosisField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.dx_retinopatia.toLowerCase()) {
                        retinopathyDiagnosisField.value = opciones[i].value;
                        break;
                    }
                }
            }


            const edemaMacularField = document.querySelector('#edemaMacular');
            if (edemaMacularField) {
                edemaMacularField.value = data.edema_macular || "";
            }

            document.querySelector('#diabeticRetinopathy').value = data.tiene_evaluacion_oftalmologica || "";

            // Mostrar u ocultar la sección de retinopatía
            toggleRetinopathySection();

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

// Función para crear un nuevo paciente
async function crearPaciente() {
    const data = getFormData();

    if (data.motivo_consulta) {
        data.motivo_consulta = parseInt(data.motivo_consulta, 10);
    }

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
            alert("Error al crear el paciente: " + errorData.error);
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

    // Convertir el valor de motivo_consulta a un número entero si existe
    if (data.motivo_consulta) {
        data.motivo_consulta = parseInt(data.motivo_consulta, 10);
    }

    // Manejo del campo tipo_diabetes
    const tipoDiabetesField = document.querySelector('[name="tipo_diabetes"]');
    if (tipoDiabetesField) {
        const tipoDiabetesValue = tipoDiabetesField.value;
        const opciones = tipoDiabetesField.options;
        for (let i = 0; i < opciones.length; i++) {
            if (opciones[i].value === tipoDiabetesValue) {
                data.tipo_diabetes = opciones[i].text;
                break;
            }
        }
    }

    // Manejo del campo observacion
    const observacionField = document.querySelector('[name="observacion"]');
    if (tipoDiabetesField && observacionField) {
        if (tipoDiabetesField.value === "7") {
            data.observacion = observacionField.value;
        } else {
            data.observacion = "";
        }
    }

    // Manejo de la sección de retinopatía diabética
    const retinopathyDiagnosisField = document.querySelector('#retinopathyDiagnosis');
    if (retinopathyDiagnosisField) {
        data.dx_retinopatia = retinopathyDiagnosisField.value;
    }

    const edemaMacularField = document.querySelector('#edemaMacular');
    if (edemaMacularField) {
        data.edema_macular = edemaMacularField.value;
    }

    const consultationDateField = document.querySelector('#consultationDate');
    if (consultationDateField) {
        data.fecha_consulta = consultationDateField.value;
    }

    const lastEyeExamDateField = document.querySelector('#lastEyeExamDate');
    if (lastEyeExamDateField) {
        data.fecha_ultima_evaluacion = lastEyeExamDateField.value;
    }

    // Manejo del campo tiene_evaluacion_oftalmologica
    data.tiene_evaluacion_oftalmologica = document.querySelector('#diabeticRetinopathy').value;

    try {
        const response = await fetch(`${apiUrl}/${numeroDocumento}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Paciente actualizado exitosamente.");
        } else {
            const errorData = await response.json();
            console.error('Error al actualizar el paciente:', errorData.error);
            alert("Error al actualizar el paciente: " + errorData.error);
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

// Función para manejar la visibilidad del campo "observacion"
const handleDiabetesTypeChange = () => {
    const diabetesTypeField = document.getElementById("tipo_diabetes");
    const observacionField = document.getElementById("observacion");

    if (diabetesTypeField) {
        if (diabetesTypeField.value === "7") {
            observacionField.classList.remove("hidden");
        } else {
            observacionField.classList.add("hidden");
            observacionField.value = "";
        }

        diabetesTypeField.addEventListener("change", function () {
            if (this.value === "7") {
                observacionField.classList.remove("hidden");
            } else {
                observacionField.classList.add("hidden");
                observacionField.value = "";
            }
        });
    }
};

// Mostrar u ocultar la sección según el valor del <select> retinopatia
function toggleRetinopathySection() {
    const selectElement = document.querySelector('#diabeticRetinopathy');
    const retinopathySection = document.querySelector('#retinopathySection');
    if (selectElement && retinopathySection) {
        if (selectElement.value === 'si') {
            retinopathySection.classList.remove('hidden');
        } else {
            retinopathySection.classList.add('hidden');
        }
    }
}

// Inicialización de eventos cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("buscar-btn").addEventListener("click", buscarPaciente);
    document.getElementById("crear-btn").addEventListener("click", crearPaciente);
    document.getElementById("actualizar-btn").addEventListener("click", actualizarPaciente);
    document.getElementById("eliminar-btn").addEventListener("click", eliminarPaciente);
    document.getElementById("limpiar-btn").addEventListener("click", limpiarFormulario);

    handleDiabetesTypeChange(); // Manejo de la visibilidad del campo "observacion"

    const eyeExamSelect = document.getElementById("diabeticRetinopathy");
    if (eyeExamSelect) {
        toggleRetinopathySection(); // Inicializar la visibilidad de la sección
        eyeExamSelect.addEventListener('change', toggleRetinopathySection);
    }
});
