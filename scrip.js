const apiUrl = "http://localhost:3000/tblpaciente";



const formatAndCalcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return { fechaFormateada: "", edad: { anios: 0, meses: 0 } };

    const nacimiento = new Date(fechaNacimiento);
    const fechaFormateada = nacimiento.toISOString().split("T")[0];

    const fechaActual = new Date();
    let edadAnios = fechaActual.getFullYear() - nacimiento.getFullYear();
    let edadMeses = fechaActual.getMonth() - nacimiento.getMonth();

    if (edadMeses < 0) {
        edadAnios--;
        edadMeses += 12;
    }

    if (fechaActual.getDate() < nacimiento.getDate()) {
        edadMeses--;
    }

    return { fechaFormateada, edad: { anios: edadAnios, meses: edadMeses } };
};
// Función para formatear la fecha en el formato YYYY-MM-DD
const formatDate = (dateStr) => {
    if (!dateStr) return ""; // Manejo de valores vacíos
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
};


// Agregamos el evento click al botón después de que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('agregarFila').addEventListener('click', agregarFila);
});




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
    // Mostrar la animación de carga
    document.getElementById('loading').style.display = 'flex';

    const numeroDocumento = prompt("Ingrese el número de documento del paciente:");
    if (!numeroDocumento) {
        alert("Debe ingresar un número de documento.");
        // Ocultar la animación de carga si no se ingresa el número de documento
        document.getElementById('loading').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/${numeroDocumento}`, {
            method: "GET",
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Datos recibidos del backend:", data);

            // Imprimir la estructura de datos completa para depuración
            console.log("Estructura completa de datos:", data);

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

            // Función genérica para establecer el valor de un campo
            const setFieldValue = (selector, value, formatFn = null) => {
                const field = document.querySelector(selector);
                if (field) {
                    field.value = formatFn ? formatFn(value) : value || "";
                } else {
                    console.error(`Elemento con id "${selector}" no encontrado.`);
                }
            };

            // Función genérica para seleccionar la opción correcta en un campo select
            const setSelectOption = (selector, value) => {
                const selectField = document.querySelector(selector);
                if (selectField) {
                    const options = selectField.options;
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].text.toLowerCase() === value.toLowerCase()) {
                            selectField.value = options[i].value;
                            break;
                        }
                    }
                } else {
                    console.error(`Elemento con id "${selector}" no encontrado.`);
                }
            };

            // Función para inicializar los datos en campos de texto y select
            const initializeDataFields = (dataFields) => {
                dataFields.forEach(({ type, selector, value, formatFn }) => {
                    if (type === "text") {
                        setFieldValue(selector, value, formatFn);
                    } else if (type === "select") {
                        setSelectOption(selector, value);
                    }
                });
            };

            // Función para mostrar u ocultar secciones
            const initializeSections = () => {
                initializeToggleSection("diabeticRetinopathy", "retinopathySection");
                initializeToggleSection("diabeticNephropathy", "nephropathySection");
                initializeToggleSection("presentaDolor", "painDetailsTable");
                initializeToggleSection("tingling", "tinglingDetails");
                initializeToggleSection("entumecimiento", "numbnessDetails");
                initializeToggleSection("sensitivityLoss", "sensitivityLossDetails");
            };


            // Datos para retinopatía
            const retinopathyFields = [
                { type: "text", selector: '#consultationDate', value: data.fecha_consulta, formatFn: formatDate },
                { type: "text", selector: '#lastEyeExamDate', value: data.fecha_ultima_evaluacion, formatFn: formatDate },
                { type: "select", selector: '[name="retinopathyDiagnosis"]', value: data.dx_retinopatia },
                { type: "text", selector: '#edemaMacular', value: data.edema_macular },
                { type: "text", selector: '#diabeticRetinopathy', value: data.tiene_evaluacion_oftalmologica }
            ];

            // Datos para nefropatía
            const nephropathyFields = [
                { type: "text", selector: '#diabeticNephropathy', value: data.tiene_nefropatia },
                { type: "text", selector: '#transplant', value: data.trasplante },
                { type: "text", selector: '#creatinine', value: data.creatinina },
                { type: "text", selector: '#tfg', value: data.tfg },
                { type: "text", selector: '#albuminuria', value: data.albuminuria },
                { type: "text", selector: '#classification', value: data.clasificacion },
                { type: "select", selector: '#trr', value: data.trr }
            ];

            //Datos para neuropatía (corrección de nombre)
            const neuropathyFields = [
                { type: "text", selector: '#sensorySymptoms', value: data.tiene_evaluacion_neurologica }
            ];

            // Datos para dolor
            const painFields = [
                { type: "text", selector: '#presentaDolor', value: data.presenta_dolor },
                { type: "select", selector: '#localizacion', value: data.localizacion },
                { type: "select", selector: '#intensidad', value: data.intensidad },
                { type: "select", selector: '#compromiso_dolor', value: data.compromiso_dolor },
                { type: "select", selector: '#lateralidad_dolor', value: data.lateralidad_dolor }
            ];

            // Datos para hormigueo
            const tinglingFields = [
                { type: "text", selector: '#tingling', value: data.presenta_hormigueo },
                { type: "select", selector: '#localizacionhormigueo', value: data.localizacion_hormigueo },
                { type: "select", selector: '#intensidadhormigueo', value: data.intensidad_hormigueo },
                { type: "select", selector: '#compromisohormigueo', value: data.compromiso_hormigueo },
                { type: "select", selector: '#lateralidadhormigueo', value: data.lateralidad_hormigueo }
            ];

            // Datos para entumecimiento
            const numbnessFields = [
                { type: "text", selector: '#entumecimiento', value: data.presenta_entumecimiento },
                { type: "select", selector: '#localizacionentumecimiento', value: data.localizacion_entumecimiento },
                { type: "select", selector: '#intensidadentumecimiento', value: data.intensidad_entumecimiento },
                { type: "select", selector: '#compromisoentumecimiento', value: data.compromiso_entumecimiento },
                { type: "select", selector: '#lateralidadentumecimiento', value: data.lateralidad_entumecimiento }
            ];


            // Asegúrate de que el objeto data tenga los valores correctos
            console.log("Datos iniciales:", data);
            // Datos para pérdida de sensibilidad
            const sensitivityLossFields = [
                { type: "text", selector: '#sensitivityLoss', value: data.presenta_perdida_sensibilidad },
                { type: "select", selector: '#sensitivityLossLocation', value: data.localizacion_perdida_sensibilidad },
                { type: "select", selector: '#sensitivityLossIntensity', value: data.intensidad_perdida_sensibilidad },
                { type: "select", selector: '#sensitivityLossLocationType', value: data.compromiso_perdida_sensibilidad },
                { type: "select", selector: '#sensitivityLossSymmetry', value: data.lateralidad_perdida_sensibilidad }
            ];

            // Inicializar todos los campos
            initializeDataFields(retinopathyFields);
            initializeDataFields(nephropathyFields);
            initializeDataFields(neuropathyFields); // Cambio de "neuroipatiafields" a "neuropathyFields"
            initializeDataFields(painFields);
            initializeDataFields(tinglingFields);
            initializeDataFields(numbnessFields);
            initializeDataFields(sensitivityLossFields); // Agregar campos de pérdida de sensibilidad


            // Inicializar secciones
            initializeSections();






            // Sección Calambres
            const presentaCalambresField = document.querySelector('#calambres');
            if (presentaCalambresField) {
                presentaCalambresField.value = data.presenta_calambres || "";
            } else {
                console.error('Elemento con id "calambres" no encontrado.');
            }

            const localizacionCalambresField = document.querySelector('#calambresLocation');
            if (localizacionCalambresField) {
                const opciones = localizacionCalambresField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.localizacion_calambres.trim().toLowerCase()) {
                        localizacionCalambresField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "calambresLocation" no encontrado.');
            }

            const intensidadCalambresField = document.querySelector('#calambresIntensity');
            if (intensidadCalambresField) {
                const opciones = intensidadCalambresField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].value === data.intensidad_calambres) {
                        intensidadCalambresField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "calambresIntensity" no encontrado.');
            }

            const compromisoCalambresField = document.querySelector('#calambresLocationType');
            if (compromisoCalambresField) {
                const opciones = compromisoCalambresField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.compromiso_calambres.trim().toLowerCase()) {
                        compromisoCalambresField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "calambresLocationType" no encontrado.');
            }

            const lateralidadCalambresField = document.querySelector('#calambresSymmetry');
            if (lateralidadCalambresField) {
                const opciones = lateralidadCalambresField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.lateralidad_calambres.trim().toLowerCase()) {
                        lateralidadCalambresField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "calambresSymmetry" no encontrado.');
            }

            initializeToggleSection("calambres", "crampsDetails");

            // Presenta Fasciculaciones
            const presentaFasciculacionesField = document.querySelector('#fasciculaciones');
            if (presentaFasciculacionesField) {
                const valorRecibido = data.presenta_fasciculaciones ? data.presenta_fasciculaciones.trim().toLowerCase() : "";
                console.log('Valor ajustado para presenta_fasciculaciones:', valorRecibido);

                // Verificar si el valor es "si" o "no" y asignar
                if (valorRecibido === "si" || valorRecibido === "no") {
                    presentaFasciculacionesField.value = valorRecibido;
                } else {
                    console.error('El valor recibido no coincide con las opciones del select:', valorRecibido);
                }
            } else {
                console.error('Elemento con id "fasciculaciones" no encontrado.');
            }

            // Localización Fasciculaciones
            const localizacionFasciculacionesField = document.querySelector('#fasciculacionesLocation');
            if (localizacionFasciculacionesField) {
                const opciones = localizacionFasciculacionesField.options;
                let found = false;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.localizacion_fasciculaciones.trim().toLowerCase()) {
                        localizacionFasciculacionesField.value = opciones[i].value;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.error('Valor de localización de fasciculaciones no encontrado:', data.localizacion_fasciculaciones);
                }
            } else {
                console.error('Elemento con id "fasciculacionesLocation" no encontrado.');
            }

            // Intensidad Fasciculaciones
            const intensidadFasciculacionesField = document.querySelector('#fasciculacionesIntensity');
            if (intensidadFasciculacionesField) {
                const opciones = intensidadFasciculacionesField.options;
                let found = false;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].value === data.intensidad_fasciculaciones) {
                        intensidadFasciculacionesField.value = opciones[i].value;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.error('Valor de intensidad de fasciculaciones no encontrado:', data.intensidad_fasciculaciones);
                }
            } else {
                console.error('Elemento con id "fasciculacionesIntensity" no encontrado.');
            }

            // Compromiso Fasciculaciones
            const compromisoFasciculacionesField = document.querySelector('#fasciculacionesLocationType');
            if (compromisoFasciculacionesField) {
                const opciones = compromisoFasciculacionesField.options;
                let found = false;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.compromiso_fasciculaciones.trim().toLowerCase()) {
                        compromisoFasciculacionesField.value = opciones[i].value;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.error('Valor de compromiso de fasciculaciones no encontrado:', data.compromiso_fasciculaciones);
                }
            } else {
                console.error('Elemento con id "fasciculacionesLocationType" no encontrado.');
            }

            // Lateralidad Fasciculaciones
            const lateralidadFasciculacionesField = document.querySelector('#fasciculacionesSymmetry');
            if (lateralidadFasciculacionesField) {
                const opciones = lateralidadFasciculacionesField.options;
                let found = false;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.lateralidad_fasciculaciones.trim().toLowerCase()) {
                        lateralidadFasciculacionesField.value = opciones[i].value;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.error('Valor de lateralidad de fasciculaciones no encontrado:', data.lateralidad_fasciculaciones);
                }
            } else {
                console.error('Elemento con id "fasciculacionesSymmetry" no encontrado.');
            }

            initializeToggleSection("fasciculaciones", "fasciculationsDetails");

            // Sección Disminución de la Fuerza
            const presentaDisminucionFuerzaField = document.querySelector('#disminucionFuerza');
            if (presentaDisminucionFuerzaField) {
                presentaDisminucionFuerzaField.value = data.presenta_disminucion_fuerza || "";
            } else {
                console.error('Elemento con id "disminucionFuerza" no encontrado.');
            }

            const localizacionDisminucionFuerzaField = document.querySelector('#disminucionFuerzaLocation');
            if (localizacionDisminucionFuerzaField) {
                const opciones = localizacionDisminucionFuerzaField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.localizacion_disminucion_fuerza.trim().toLowerCase()) {
                        localizacionDisminucionFuerzaField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "disminucionFuerzaLocation" no encontrado.');
            }

            const intensidadDisminucionFuerzaField = document.querySelector('#disminucionFuerzaIntensity');
            if (intensidadDisminucionFuerzaField) {
                const opciones = intensidadDisminucionFuerzaField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].value === data.intensidad_disminucion_fuerza) {
                        intensidadDisminucionFuerzaField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "disminucionFuerzaIntensity" no encontrado.');
            }

            const compromisoDisminucionFuerzaField = document.querySelector('#disminucionFuerzaLocationType');
            if (compromisoDisminucionFuerzaField) {
                const opciones = compromisoDisminucionFuerzaField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.compromiso_disminucion_fuerza.trim().toLowerCase()) {
                        compromisoDisminucionFuerzaField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "disminucionFuerzaLocationType" no encontrado.');
            }

            const lateralidadDisminucionFuerzaField = document.querySelector('#disminucionFuerzaSymmetry');
            if (lateralidadDisminucionFuerzaField) {
                const opciones = lateralidadDisminucionFuerzaField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.lateralidad_disminucion_fuerza.trim().toLowerCase()) {
                        lateralidadDisminucionFuerzaField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "disminucionFuerzaSymmetry" no encontrado.');
            }

            initializeToggleSection("disminucionFuerza", "strengthReductionDetails");

            // Sección Otras Neuropatías
            const presentaOtrasNeuropatiasField = document.querySelector('#otherNeuropathies');
            if (presentaOtrasNeuropatiasField) {
                presentaOtrasNeuropatiasField.value = data.otras_neuropatias || "";
            } else {
                console.error('Elemento con id "otherNeuropathies" no encontrado.');
            }

            const tiponeuropatiafield = document.querySelector('#neuropathyType');
            if (tiponeuropatiafield) {
                const opciones = tiponeuropatiafield.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === data.tipo_neuropatia.trim().toLowerCase()) {
                        tiponeuropatiafield.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "neuropathyType" no encontrado.');
            }

            // Inicializar solo con los parámetros necesarios
            initializeToggleSection("otherNeuropathies", "neuropathyType");

            // Sección Pie Diabético
            const presentaPieDiabeticoField = document.querySelector('#piediabetico');
            if (presentaPieDiabeticoField) {
                presentaPieDiabeticoField.value = data.piediabetico || "";
            } else {
                console.error('Elemento con id "piediabetico" no encontrado.');
            }

            // Campo de antecedente de úlcera
            const antecedenteUlceraField = document.querySelector('#ulcerHistory');
            if (antecedenteUlceraField) {
                antecedenteUlceraField.value = data.antecedente_ulcera || "";
            } else {
                console.error('Elemento con id "ulcerHistory" no encontrado.');
            }

            // Campo de localización de úlcera
            const localizacionUlceraField = document.querySelector('#ulcerLocation');
            if (localizacionUlceraField) {
                const opciones = localizacionUlceraField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === (data.localizacion_ulcera || "").trim().toLowerCase()) {
                        localizacionUlceraField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "ulcerLocation" no encontrado.');
            }

            // Campo de antecedente de amputación
            const antecedenteAmputacionField = document.querySelector('#amputationHistory');
            if (antecedenteAmputacionField) {
                antecedenteAmputacionField.value = data.antecedente_amputacion || "";
            } else {
                console.error('Elemento con id "amputationHistory" no encontrado.');
            }

            // Campo de localización de amputación
            const localizacionAmputacionField = document.querySelector('#amputationLocation');
            if (localizacionAmputacionField) {
                const opciones = localizacionAmputacionField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === (data.localizacion_amputacion || "").trim().toLowerCase()) {
                        localizacionAmputacionField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "amputationLocation" no encontrado.');
            }

            initializeToggleSection("piediabetico", "footSection");


            // Sección Complicaciones Macrovasculares
            const presentaEnfermedadCoronariaField = document.querySelector('#coronaryDisease');
            if (presentaEnfermedadCoronariaField) {
                presentaEnfermedadCoronariaField.value = data.enfermedad_coronaria || "";
            } else {
                console.error('Elemento con id "coronaryDisease" no encontrado.');
            }

            const presentaInsuficienciaCardiacaField = document.querySelector('#heartFailure');
            if (presentaInsuficienciaCardiacaField) {
                presentaInsuficienciaCardiacaField.value = data.insuficiencia_cardiaca || "";
            } else {
                console.error('Elemento con id "heartFailure" no encontrado.');
            }

            const presentaEnfermedadNeurologicaField = document.querySelector('#neurologicalDisease');
            if (presentaEnfermedadNeurologicaField) {
                presentaEnfermedadNeurologicaField.value = data.enfermedad_neurologica || "";
            } else {
                console.error('Elemento con id "neurologicalDisease" no encontrado.');
            }

            const presentaFibrilacionAuricularField = document.querySelector('#atrialFibrillation');
            if (presentaFibrilacionAuricularField) {
                presentaFibrilacionAuricularField.value = data.fibrilacion_auricular || "";
            } else {
                console.error('Elemento con id "atrialFibrillation" no encontrado.');
            }

            const presentaEnfermedadVascularPerifericaField = document.querySelector('#peripheralVascularDisease');
            if (presentaEnfermedadVascularPerifericaField) {
                presentaEnfermedadVascularPerifericaField.value = data.enfermedad_vascular_periferica || "";
            } else {
                console.error('Elemento con id "peripheralVascularDisease" no encontrado.');
            }

            // Sección HTA
            const tieneHtaField = document.querySelector('#hta');
            if (tieneHtaField) {
                tieneHtaField.value = data.tiene_hta || ""; // Asignar el valor del campo si/no
            } else {
                console.error('Elemento con id "hta" no encontrado.');
            }

            const fechaDiagnosticoHtaField = document.querySelector('#htaDate');
            if (fechaDiagnosticoHtaField) {
                fechaDiagnosticoHtaField.value = data.fecha_diagnostico || ""; // Asignar la fecha del diagnóstico
            } else {
                console.error('Elemento con id "htaDate" no encontrado.');
            }

            // Sección Dislipidemia
            const tieneDislipidemiaField = document.querySelector('#dislipidemia');
            if (tieneDislipidemiaField) {
                tieneDislipidemiaField.value = data.tiene_dislipidemia || ""; // Asignar el valor del campo si/no
            } else {
                console.error('Elemento con id "dislipidemia" no encontrado.');
            }

            const fechaDiagnosticoDislipidemiaField = document.querySelector('#dislipidemiaDate');
            if (fechaDiagnosticoDislipidemiaField) {
                fechaDiagnosticoDislipidemiaField.value = data.fecha_diagnostico_dislipidemia || ""; // Asignar la fecha del diagnóstico
            } else {
                console.error('Elemento con id "dislipidemiaDate" no encontrado.');
            }

            // Sección Esteatosis Hepática
            const tieneEsteatosisField = document.querySelector('#esteatosis');
            if (tieneEsteatosisField) {
                tieneEsteatosisField.value = data.tiene_esteatosis || "";
            } else {
                console.error('Elemento con id "esteatosis" no encontrado.');
            }

            const fechaDiagnosticoEsteatosisField = document.querySelector('#esteatosisConsultationDate');
            if (fechaDiagnosticoEsteatosisField) {
                fechaDiagnosticoEsteatosisField.value = data.fecha_diagnostico_esteatosis || "";
            } else {
                console.error('Elemento con id "esteatosisConsultationDate" no encontrado.');
            }

            const fib4ValueField = document.querySelector('#fib4Value');
            if (fib4ValueField) {
                fib4ValueField.value = data.fib4 || "";
            } else {
                console.error('Elemento con id "fib4Value" no encontrado.');
            }


            // Sección SAHOS
            const tieneSahosField = document.querySelector('#sahos');
            if (tieneSahosField) {
                tieneSahosField.value = data.tiene_sahos || "";
            } else {
                console.error('Elemento con id "sahos" no encontrado.');
            }

            const fechaSahosField = document.querySelector('#sahosDate');
            if (fechaSahosField) {
                fechaSahosField.value = data.fecha_consulta_sahos || "";
            } else {
                console.error('Elemento con id "sahosDate" no encontrado.');
            }


            // Sección Tabaquismo
            const tieneTabaquismoField = document.querySelector('#tabaquismo');
            if (tieneTabaquismoField) {
                tieneTabaquismoField.value = data.tiene_tabaquismo || "";
            } else {
                console.error('Elemento con id "tabaquismo" no encontrado.');
            }

            const fechaTabaquismoField = document.querySelector('#tabaquismoConsultationDate');
            if (fechaTabaquismoField) {
                fechaTabaquismoField.value = data.fecha_consulta_tabaquismo || "";
            } else {
                console.error('Elemento con id "tabaquismoConsultationDate" no encontrado.');
            }

            const cigPorDiaField = document.querySelector('#cigPerDay');
            if (cigPorDiaField) {
                cigPorDiaField.value = data.cigarrillos_por_dia || "";
            } else {
                console.error('Elemento con id "cigPerDay" no encontrado.');
            }

            const anosFumandoField = document.querySelector('#yearsSmoking');
            if (anosFumandoField) {
                anosFumandoField.value = data.anos_fumando || "";
            } else {
                console.error('Elemento con id "yearsSmoking" no encontrado.');
            }


            // Sección Comorbilidades
            const comorbilidadField = document.querySelector('#nombreComorbilidad');
            if (comorbilidadField) {
                comorbilidadField.value = data.nombre_comorbilidad || "";
            } else {
                console.error('Elemento con id "nombreComorbilidad" no encontrado.');
            }

            const fechaComorbilidadField = document.querySelector('#fechaComorbilidad');
            if (fechaComorbilidadField) {
                fechaComorbilidadField.value = data.fecha_consulta_comorbilidad || "";
            } else {
                console.error('Elemento con id "fechaComorbilidad" no encontrado.');
            }

            // Sección insulina
            const insulinaField = document.querySelector('#insulina');
            if (insulinaField) {
                if (data.recibe_insulina === "si" || data.recibe_insulina === "no") {
                    insulinaField.value = data.recibe_insulina;
                } else {
                    insulinaField.value = ""; 
                }
            } else {
                console.error('Elemento con id "insulina" no encontrado.');
            }



            // Sección Bombas de insulina
            const bombaField = document.querySelector('#Bombainsulina');
            if (bombaField) {
                if (data.tiene_bomba_insulina === "si" || data.tiene_bomba_insulina === "no") {
                    bombaField.value = data.tiene_bomba_insulina;
                } else {
                    bombaField.value = ""; // Valor por defecto si no es "si" o "no"
                }
            } else {
                console.error('Elemento con id "Bombainsulina" no encontrado.');
            }


            const modeloactualField = document.querySelector('#modelo');
            if (modeloactualField) {
                modeloactualField.value = data.modelo_actual || "";
            } else {
                console.error('Elemento con id "nombremodeloactual" no encontrado.');
            }

            const fechainstalacionField = document.querySelector('#instalacionDate');
            if (fechainstalacionField) {
                fechainstalacionField.value = data.fecha_instalacion_modelo || "";
            } else {
                console.error('Elemento con id "fecha_instalacion" no encontrado.');
            }


            const otrosmodelosField = document.querySelector('#otrosModelos');
            if (otrosmodelosField) {
                if (data.ha_tenido_otros_modelos === "si" || data.ha_tenido_otros_modelos === "no") {
                    otrosmodelosField.value = data.ha_tenido_otros_modelos;
                } else {
                    otrosmodelosField.value = ""; // Valor por defecto si no es "si" o "no"
                }
            } else {
                console.error('Elemento con id "ha_tenido_otros_modelos" no encontrado.');
            }


            const fechainstalacionprimeraField = document.querySelector('#primeraInstalacionDate');
            if (fechainstalacionprimeraField) {
                fechainstalacionprimeraField.value = data.fecha_instalacion_primera_bomba || "";
            } else {
                console.error('Elemento con id "fecha_instalacion" no encontrado.');
            }


            const indicacionField = document.querySelector('#indicacion');
            if (indicacionField) {
                const opciones = indicacionField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === (data.indicacion || "").trim().toLowerCase()) {
                        indicacionField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "indicacionField" no encontrado.');
            }


            const analogoinField = document.querySelector('#analogoin');
            if (analogoinField) {
                const opciones = analogoinField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.trim().toLowerCase() === (data.analogoin || "").trim().toLowerCase()) {
                        analogoinField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "indicacionField" no encontrado.');
            }


            // Sección insulina basal
            const insulinabasalField = document.querySelector('#insulinaBasal');
            if (insulinabasalField) {
                if (data.recibe_insulina_basal=== "si" || data.recibe_insulina_basal === "no") {
                    insulinabasalField.value = data.recibe_insulina_basal;
                } else {
                    insulinabasalField.value = ""; // Valor por defecto si no es "si" o "no"
                }
            } else {
                console.error('Elemento con id "insulinabasalField" no encontrado.');
            }


            // Asignar valor a la fecha
const fechaField = document.querySelector('#consultationDateinsu');
if (fechaField) {
    fechaField.value = data.fecha_insulina || "";
} else {
    console.error('Elemento con id "consultationDateinsu" no encontrado.');
}

// Asignar valor al tipo de insulina
const tipoInsulinaField = document.querySelector('#tipoInsulina');
if (tipoInsulinaField) {
    const opciones = tipoInsulinaField.options;
    for (let i = 0; i < opciones.length; i++) {
        if (opciones[i].text.trim().toLowerCase() === (data.tipo_insulina || "").trim().toLowerCase()) {
            tipoInsulinaField.value = opciones[i].value;
            break;
        }
    }
} else {
    console.error('Elemento con id "tipoInsulina" no encontrado.');
}

// Asignar valor a unidades por día
const unidadesDiaField = document.querySelector('#unidadesDia');
if (unidadesDiaField) {
    unidadesDiaField.value = data.unidades_dia || 0; // Usar 0 si no hay valor
} else {
    console.error('Elemento con id "unidadesDia" no encontrado.');
}

// Asignar valor a dosis #1
const dosis1Field = document.querySelector('#dosis1');
if (dosis1Field) {
    dosis1Field.value = data.dosis1 || 0; // Usar 0 si no hay valor
} else {
    console.error('Elemento con id "dosis1" no encontrado.');
}

// Asignar valor a dosis #2
const dosis2Field = document.querySelector('#dosis2');
if (dosis2Field) {
    dosis2Field.value = data.dosis2 || 0; // Usar 0 si no hay valor
} else {
    console.error('Elemento con id "dosis2" no encontrado.');
}

// Asignar valor a dosis #3
const dosis3Field = document.querySelector('#dosis3');
if (dosis3Field) {
    dosis3Field.value = data.dosis3 || 0; // Usar 0 si no hay valor
} else {
    console.error('Elemento con id "dosis3" no encontrado.');
}




           







            // Calcular y mostrar la edad
            if (data.fecha_nacimiento) {
                const { anios, meses } = calcularEdad(data.fecha_nacimiento);
                document.getElementById("ageYears").value = anios;
                document.getElementById("ageMonths").value = meses;
            }

            //  'data' contiene los datos del paciente directamente
            if (data && data.id) {  // Verificar si 'data' tiene el campo 'id' que indica que hay datos del paciente
                console.log("Datos del paciente:", data);
            } else {
                alert("Paciente no encontrado.");
                console.log("Paciente no encontrado o la respuesta está vacía.");
            }
        } else {
            alert("Paciente no encontrado.");
            console.log("Respuesta del servidor no es correcta.");
        }
    } catch (error) {
        console.error("Error al buscar el paciente", error);
        alert("Error al buscar el paciente.");
    } finally {
        // Ocultar la animación de carga
        document.getElementById('loading').style.display = 'none';
    }
}


// Función para agregar una nueva fila de comorbilidad
const agregarFila = () => {
    // Seleccionamos el tbody de la tabla
    const tbody = document.querySelector('#tablaComorbilidades tbody');

    // Creamos una nueva fila
    const nuevaFila = document.createElement('tr');

    // Creamos las celdas para la fecha y la comorbilidad
    const celdaFecha = document.createElement('td');
    const celdaComorbilidad = document.createElement('td');

    // Creamos los inputs para cada celda
    const inputFecha = document.createElement('input');
    inputFecha.type = 'date';
    inputFecha.name = 'fechaComorbilidad';
    inputFecha.required = true;

    const inputComorbilidad = document.createElement('input');
    inputComorbilidad.type = 'text';
    inputComorbilidad.name = 'nombreComorbilidad';
    inputComorbilidad.required = true;

    // Añadimos los inputs a sus respectivas celdas
    celdaFecha.appendChild(inputFecha);
    celdaComorbilidad.appendChild(inputComorbilidad);

    // Añadimos las celdas a la nueva fila
    nuevaFila.appendChild(celdaFecha);
    nuevaFila.appendChild(celdaComorbilidad);

    // Añadimos la nueva fila al tbody
    tbody.appendChild(nuevaFila);
};



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

    // Manejo de la sección evaluacion_oftalmologica_retinopatia
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

    // Manejo del campo tiene_evaluacion_oftalmologica_retinopatia
    data.tiene_evaluacion_oftalmologica = document.querySelector('#diabeticRetinopathy').value;

    // Manejo de los datos de nefropatía
    data.tiene_nefropatia = document.querySelector('#diabeticNephropathy').value || "";

    const transplantField = document.querySelector('#transplant');
    if (transplantField) {
        data.trasplante = transplantField.value || "";
    }

    const creatinineField = document.querySelector('#creatinine');
    if (creatinineField) {
        data.creatinina = creatinineField.value || "";
    }

    const tfgField = document.querySelector('#tfg');
    if (tfgField) {
        data.tfg = tfgField.value || "";
    }

    const albuminuriaField = document.querySelector('#albuminuria');
    if (albuminuriaField) {
        data.albuminuria = albuminuriaField.value || "";
    }

    const classificationField = document.querySelector('#classification');
    if (classificationField) {
        data.clasificacion = classificationField.value || "";
    }


    // Manejo de los datos de síntomas sensoriales
    data.tiene_evaluacion_neurologica = document.querySelector('#sensorySymptoms').value || "";


    // Localización del dolor
    const localizacionField = document.querySelector('#localizacion');
    if (localizacionField) {
        data.localizacion = localizacionField.value || "";
    }

    // Intensidad del dolor
    const intensidadField = document.querySelector('#intensidad');
    if (intensidadField) {
        data.intensidad = intensidadField.value || "";
    }

    // Compromiso del dolor
    const compromisoField = document.querySelector('#compromiso_dolor');
    if (compromisoField) {
        data.compromiso_dolor = compromisoField.value || "";
    }

    // Lateralidad del dolor
    const lateralidadField = document.querySelector('#lateralidad_dolor');
    if (lateralidadField) {
        data.lateralidad_dolor = lateralidadField.value || "";
    }

    // Presencia de dolor
    const presentaDolorField = document.querySelector('#presentaDolor');
    if (presentaDolorField) {
        data.presenta_dolor = presentaDolorField.value || "";
    }


    // Manejo de los datos de síntomas de hormigueo
    data.presenta_hormigueo = document.querySelector('#tingling').value || "";

    // Localización del hormigueo
    const localizacionHormigueoField = document.querySelector('#localizacionhormigueo');
    if (localizacionHormigueoField) {
        data.localizacion_hormigueo = localizacionHormigueoField.value || "";
    }

    // Intensidad del hormigueo
    const intensidadHormigueoField = document.querySelector('#intensidadhormigueo');
    if (intensidadHormigueoField) {
        data.intensidad_hormigueo = intensidadHormigueoField.value || "";
    }

    // Compromiso del hormigueo
    const compromisoHormigueoField = document.querySelector('#compromisohormigueo');
    if (compromisoHormigueoField) {
        data.compromiso_hormigueo = compromisoHormigueoField.value || "";
    }

    // Lateralidad del hormigueo
    const lateralidadHormigueoField = document.querySelector('#lateralidadhormigueo');
    if (lateralidadHormigueoField) {
        data.lateralidad_hormigueo = lateralidadHormigueoField.value || "";
    }


    // Manejo de los datos de síntomas de entumecimiento
    data.presenta_entumecimiento = document.querySelector('#entumecimiento')?.value || "";

    // Localización del entumecimiento
    const localizacionEntumecimientoField = document.querySelector('#localizacionentumecimiento');
    data.localizacion_entumecimiento = localizacionEntumecimientoField ? localizacionEntumecimientoField.value || "" : "";

    // Intensidad del entumecimiento
    const intensidadEntumecimientoField = document.querySelector('#intensidadentumecimiento');
    data.intensidad_entumecimiento = intensidadEntumecimientoField ? intensidadEntumecimientoField.value || "" : "";

    // Compromiso del entumecimiento
    const compromisoEntumecimientoField = document.querySelector('#compromisoentumecimiento');
    data.compromiso_entumecimiento = compromisoEntumecimientoField ? compromisoEntumecimientoField.value || "" : "";

    // Lateralidad del entumecimiento
    const lateralidadEntumecimientoField = document.querySelector('#lateralidadentumecimiento');
    data.lateralidad_entumecimiento = lateralidadEntumecimientoField ? lateralidadEntumecimientoField.value || "" : "";

    // Manejo de los datos de pérdida de sensibilidad
    data.presenta_perdida_sensibilidad = document.querySelector('#sensitivityLoss')?.value || "";

    // Localización de la pérdida de sensibilidad
    const localizacionPerdidaSensibilidadField = document.querySelector('#sensitivityLossLocation');
    data.localizacion_perdida_sensibilidad = localizacionPerdidaSensibilidadField ? localizacionPerdidaSensibilidadField.value || "" : "";

    // Intensidad de la pérdida de sensibilidad
    const intensidadPerdidaSensibilidadField = document.querySelector('#sensitivityLossIntensity');
    data.intensidad_perdida_sensibilidad = intensidadPerdidaSensibilidadField ? intensidadPerdidaSensibilidadField.value || "" : "";

    // Tipo de compromiso de la pérdida de sensibilidad
    const compromisoPerdidaSensibilidadField = document.querySelector('#sensitivityLossLocationType');
    data.compromiso_perdida_sensibilidad = compromisoPerdidaSensibilidadField ? compromisoPerdidaSensibilidadField.value || "" : "";

    // Lateralidad de la pérdida de sensibilidad
    const lateralidadPerdidaSensibilidadField = document.querySelector('#sensitivityLossSymmetry');
    data.lateralidad_perdida_sensibilidad = lateralidadPerdidaSensibilidadField ? lateralidadPerdidaSensibilidadField.value || "" : "";

    // Verificación de los datos
    console.log("Datos enviados:", data);


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

// Función genérica para mostrar/ocultar secciones
function toggleSection(selectId, sectionId) {
    const selectElement = document.getElementById(selectId);
    const sectionElement = document.getElementById(sectionId);

    if (selectElement && sectionElement) {
        if (selectElement.value === 'si') {
            sectionElement.classList.remove('hidden');
        } else {
            sectionElement.classList.add('hidden');
        }
    }
}

// Inicializa el evento de cambio para el select
function initializeToggleSection(selectId, sectionId) {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
        toggleSection(selectId, sectionId); // Inicializar la visibilidad de la sección
        selectElement.addEventListener('change', () => toggleSection(selectId, sectionId));
    }
}



// Inicialización de eventos cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    // Inicialización de los botones
    document.getElementById("buscar-btn").addEventListener("click", buscarPaciente);
    document.getElementById("crear-btn").addEventListener("click", crearPaciente);
    document.getElementById("actualizar-btn").addEventListener("click", actualizarPaciente);
    document.getElementById("eliminar-btn").addEventListener("click", eliminarPaciente);
    document.getElementById("limpiar-btn").addEventListener("click", limpiarFormulario);

    handleDiabetesTypeChange(); // Manejo de la visibilidad del campo "observacion"

    // Manejo de la visibilidad de las secciones
    initializeToggleSection("diabeticRetinopathy", "retinopathySection");
    initializeToggleSection("diabeticNephropathy", "nephropathySection");
    initializeToggleSection("presentaDolor", "painDetailsTable");
    initializeToggleSection("tingling", "tinglingDetails");
    initializeToggleSection("entumecimiento", "numbnessDetails");
    initializeToggleSection("sensitivityLoss", "sensitivityLossDetails");
    initializeToggleSection("calambres", "crampsDetails");
    initializeToggleSection("fasciculaciones", "fasciculationsDetails");
    initializeToggleSection("disminucionFuerza", "strengthReductionDetails");
    initializeToggleSection("otherNeuropathies", "neuropathyType");
    initializeToggleSection("piediabetico", "footSection");

    

});