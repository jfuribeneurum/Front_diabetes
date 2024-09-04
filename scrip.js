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



            //datos nefropatia
            // Datos de nefropatía

            document.querySelector('#diabeticNephropathy').value = data.tiene_nefropatia || "";

            const transplantField = document.querySelector('#transplant');
            if (transplantField) {
                transplantField.value = data.trasplante || "";
            }

            const creatinineField = document.querySelector('#creatinine');
            if (creatinineField) {
                creatinineField.value = data.creatinina || "";
            }

            const tfgField = document.querySelector('#tfg');
            if (tfgField) {
                tfgField.value = data.tfg || "";
            }

            const albuminuriaField = document.querySelector('#albuminuria');
            if (albuminuriaField) {
                albuminuriaField.value = data.albuminuria || "";
            }

            const classificationField = document.querySelector('#classification');
            if (classificationField) {
                classificationField.value = data.clasificacion || "";
            }

            const trrField = document.querySelector('#trr');
            if (trrField) {
                const opciones = trrField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.trr.toLowerCase()) {
                        trrField.value = opciones[i].value;
                        break;
                    }
                }
            }

            toggleNephropathySection();

            // Datos de síntomas sensoriales
            const sensorySymptomsField = document.querySelector('#sensorySymptoms');
            if (sensorySymptomsField) {
                sensorySymptomsField.value = data.tiene_evaluacion_neurologica || "";
            } else {
                console.error('Elemento con id "sensorySymptoms" no encontrado.');
            }

            const fechaConsultaField = document.querySelector('#consultationDate');
            if (fechaConsultaField) {
                fechaConsultaField.value = data.fecha_consulta ? formatDate(data.fecha_consulta) : "";
            } else {
                console.error('Elemento con id "consultationDate" no encontrado.');
            }



            const localizacionField = document.querySelector('#localizacion');
            if (localizacionField) {
                const opciones = localizacionField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.localizacion.toLowerCase()) {
                        localizacionField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "location" no encontrado.');
            }

            const intensidadField = document.querySelector('#intensidad');
            if (intensidadField) {
                const opciones = intensidadField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].value === data.intensidad) {
                        intensidadField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "intensity" no encontrado.');
            }

            const compromisoField = document.querySelector('#compromiso_dolor');
            if (compromisoField) {
                const opciones = compromisoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.compromiso_dolor.toLowerCase()) {
                        compromisoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "compromiso_dolor" no encontrado.');
            }

            const lateralidadField = document.querySelector('#lateralidad_dolor');
            if (lateralidadField) {
                const opciones = lateralidadField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.lateralidad_dolor.toLowerCase()) {
                        lateralidadField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "lateralidad_dolor" no encontrado.');
            }

            const presentaDolorField = document.querySelector('#presentaDolor');
            if (presentaDolorField) {
                presentaDolorField.value = data.presenta_dolor || "";
            } else {
                console.error('Elemento con id "presentaDolor" no encontrado.');
            }

            //seccion hormigueo
            const presentaHormigueoField = document.querySelector('#tingling');
            if (presentaHormigueoField) {
                presentaHormigueoField.value = data.presenta_hormigueo || "";
            } else {
                console.error('Elemento con id "presentaHormigueo" no encontrado.');
            }


            const localizacionhormigueoField = document.querySelector('#localizacionhormigueo');
            if (localizacionhormigueoField) {
                const opciones = localizacionhormigueoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.localizacion_hormigueo.toLowerCase()) {
                        localizacionhormigueoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "localizacionhormigueoField" no encontrado.');
            }

            const intensidadhormigueoField = document.querySelector('#intensidadhormigueo');
            if (intensidadhormigueoField) {
                const opciones = intensidadhormigueoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].value === data.intensidad_hormigueo) {
                        intensidadhormigueoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "intensityhormigueo" no encontrado.');
            }

            const compromisohormigueoField = document.querySelector('#compromisohormigueo');
            if (compromisohormigueoField) {
                const opciones = compromisohormigueoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.compromiso_hormigueo.toLowerCase()) {
                        compromisohormigueoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "compromiso_dolor" no encontrado.');
            }

            const lateralidadhormigueoField = document.querySelector('#lateralidadhormigueo');
            if (lateralidadhormigueoField) {
                const opciones = lateralidadhormigueoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.lateralidad_hormigueo.toLowerCase()) {
                        lateralidadhormigueoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "lateralidad_dolor" no encontrado.');
            }


            // Sección entumecimiento
            const presentaEntumecimientoField = document.querySelector('#entumecimiento');
            if (presentaEntumecimientoField) {
                presentaEntumecimientoField.value = data.presenta_entumecimiento || "";
            } else {
                console.error('Elemento con id "entumecimiento" no encontrado.');
            }

            const localizacionEntumecimientoField = document.querySelector('#localizacionentumecimiento');
            if (localizacionEntumecimientoField) {
                const opciones = localizacionEntumecimientoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.localizacion_entumecimiento.toLowerCase()) {
                        localizacionEntumecimientoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "localizacionentumecimiento" no encontrado.');
            }

            const intensidadEntumecimientoField = document.querySelector('#intensidadentumecimiento');
            if (intensidadEntumecimientoField) {
                const opciones = intensidadEntumecimientoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].value === data.intensidad_entumecimiento) {
                        intensidadEntumecimientoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "intensidadentumecimiento" no encontrado.');
            }

            const compromisoEntumecimientoField = document.querySelector('#compromisoentumecimiento');
            if (compromisoEntumecimientoField) {
                const opciones = compromisoEntumecimientoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.compromiso_entumecimiento.toLowerCase()) {
                        compromisoEntumecimientoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "compromisoentumecimiento" no encontrado.');
            }

            const lateralidadEntumecimientoField = document.querySelector('#lateralidadentumecimiento');
            if (lateralidadEntumecimientoField) {
                const opciones = lateralidadEntumecimientoField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.lateralidad_entumecimiento.toLowerCase()) {
                        lateralidadEntumecimientoField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "lateralidadentumecimiento" no encontrado.');
            }


            // Sección Pérdida de Sensibilidad
            const presentaSensibilidadField = document.querySelector('#sensitivityLoss');
            if (presentaSensibilidadField) {
                presentaSensibilidadField.value = data.presenta_perdida_sensibilidad || "";
            } else {
                console.error('Elemento con id "sensitivityLoss" no encontrado.');
            }

            const localizacionSensibilidadField = document.querySelector('#sensitivityLossLocation');
            if (localizacionSensibilidadField) {
                const opciones = localizacionSensibilidadField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.localizacion_perdida_sensibilidad.toLowerCase()) {
                        localizacionSensibilidadField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "sensitivityLossLocation" no encontrado.');
            }

            const intensidadSensibilidadField = document.querySelector('#sensitivityLossIntensity');
            if (intensidadSensibilidadField) {
                const opciones = intensidadSensibilidadField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].value === data.intensidad_perdida_sensibilidad) {
                        intensidadSensibilidadField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "sensitivityLossIntensity" no encontrado.');
            }

            const compromisoSensibilidadField = document.querySelector('#sensitivityLossLocationType');
            if (compromisoSensibilidadField) {
                const opciones = compromisoSensibilidadField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.compromiso_perdida_sensibilidad.toLowerCase()) {
                        compromisoSensibilidadField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "sensitivityLossLocationType" no encontrado.');
            }

            const lateralidadSensibilidadField = document.querySelector('#sensitivityLossSymmetry');
            if (lateralidadSensibilidadField) {
                const opciones = lateralidadSensibilidadField.options;
                for (let i = 0; i < opciones.length; i++) {
                    if (opciones[i].text.toLowerCase() === data.lateralidad_perdida_sensibilidad.toLowerCase()) {
                        lateralidadSensibilidadField.value = opciones[i].value;
                        break;
                    }
                }
            } else {
                console.error('Elemento con id "sensitivityLossSymmetry" no encontrado.');
            }


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

            // Sección Otras Neuropatías
            const presentaOtrasNeuropatiasField = document.querySelector('#otherNeuropathies');
            if (presentaOtrasNeuropatiasField) {
                presentaOtrasNeuropatiasField.value = data.otras_neuropatias || "";
            } else {
                console.error('Elemento con id "otherNeuropathies" no encontrado.');
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

// Mostrar u ocultar la sección según el valor del <select> diabeticNephropathy
function toggleDolorSection() {
    const selectElement = document.querySelector('#diabeticNephropathy');
    const toggleDolorSection = document.querySelector('#nephropathySection');
    if (selectElement && toggleDolorSection) {
        if (selectElement.value === 'si') {
            toggleDolorSection.classList.remove('hidden');
        } else {
            toggleDolorSection.classList.add('hidden');
        }
    }
}

// Mostrar u ocultar la sección según el valor del <select> diabeticNephropathy
function toggleNephropathySection() {
    const selectElement = document.querySelector('#diabeticNephropathy');
    const nephropathySection = document.querySelector('#nephropathySection');
    if (selectElement && nephropathySection) {
        if (selectElement.value === 'si') {
            nephropathySection.classList.remove('hidden');
        } else {
            nephropathySection.classList.add('hidden');
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

    // Inicializar la visibilidad de la sección de nefropatía
    const nephropathySelect = document.getElementById("diabeticNephropathy");
    if (nephropathySelect) {
        toggleNephropathySection(); // Inicializar la visibilidad de la sección
        nephropathySelect.addEventListener('change', toggleNephropathySection);
    }
});


// Inicializar la visibilidad de la sección de síntomas sensoriales
const sensorySymptomsSelect = document.getElementById("sensorySymptoms");
if (sensorySymptomsSelect) {
    toggleSensorySymptomsSection(); // Inicializar la visibilidad de la sección
    sensorySymptomsSelect.addEventListener('change', toggleSensorySymptomsSection);
}