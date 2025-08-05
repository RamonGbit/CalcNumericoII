// tareas.js
// Lógica para la sección de tareas

import { personal } from './personal.js';
import { materiales } from './materiales.js';
import { otrosCostos } from './otroscostos.js';

export const tareas = [];

export const estadosTarea = [
    'Sin hacer',
    'Empezado',
    'Por la mitad',
    'Casi listo',
    'Terminada'
];

export function renderTareas() {
    const listaTareas = document.getElementById('listaTareas');
    if (!listaTareas) return;
    listaTareas.innerHTML = '';
    if (tareas.length === 0) {
        listaTareas.innerHTML = '<li class="py-3 text-gray-500">No hay tareas registradas.</li>';
        return;
    }
    tareas.forEach((t, idx) => {
        const li = document.createElement('li');
        li.className = 'py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between';
        li.innerHTML = `
            <div>
                <span class="font-medium text-lg">${t.nombre}</span>
                <span class="text-xs px-2 py-1 rounded ml-2 ${t.estado === 'Terminada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${t.estado}</span>
                <div class="text-xs mt-2">Tiempo total: ${t.tiempoTotal} horas</div>
                <div class="text-xs mt-2">Personal: ${t.personal.map(p => `${p.nombre} ${p.apellido} (${p.tiempo}h)`).join(', ')}</div>
                <div class="text-xs mt-2">Materiales: ${t.materiales.map(m => `${m.nombre} (${m.cantidad})`).join(', ')}</div>
                <div class="text-xs mt-2">Otros Costos: ${t.otrosCostos.map(o => `${o.nota} (${o.unidad || ''}, $${o.costo}) x${o.cantidad}`).join(', ')}</div>
            </div>
            <div class="flex gap-2">
                <button class="bg-red-500 text-white px-2 py-1 rounded eliminar-tarea-btn" data-idx="${idx}">Eliminar</button>
                ${t.estado === 'Terminada' ? `<span class="px-2 py-1 rounded bg-gray-300 text-gray-700 cursor-not-allowed">Tarea terminada</span>` : `<button class="bg-blue-500 text-white px-2 py-1 rounded edit-tarea-btn" data-idx="${idx}">Editar</button>`}
                <!-- El estado solo se puede modificar desde el dashboard -->
            </div>
        `;
        listaTareas.appendChild(li);
    });
    // Listener para botón Eliminar en tareas
    listaTareas.querySelectorAll('.eliminar-tarea-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.idx);
            if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
                tareas.splice(idx, 1);
                renderTareas();
            }
        });
    });
    // Listener para botón Editar en tareas
    listaTareas.querySelectorAll('.edit-tarea-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.idx);
            mostrarModalEditarTarea(idx);
        });
    });
}

export function setupTareaForm() {
    const tareaForm = document.getElementById('tareaForm');
    const agregarTareaBtn = document.getElementById('agregarTareaBtn');
    if (!tareaForm || !agregarTareaBtn) return;
    agregarTareaBtn.addEventListener('click', () => {
        tareaForm.classList.toggle('hidden');
        fillTareaFormOptions();
    });
    tareaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombreTarea').value.trim();
        const estado = document.getElementById('estadoTarea').value;
        const tiempoTotal = parseFloat(document.getElementById('tiempoTotalTarea').value);
        // Validar nombre de tarea
        if (!nombre) return;
        if (nombre.length < 3 || nombre.length > 50) {
            alert('El nombre de la tarea debe tener entre 3 y 50 caracteres.');
            return;
        }
        if (tareas.some(t => t.nombre.toLowerCase() === nombre.toLowerCase())) {
            alert('Ya existe una tarea con ese nombre.');
            return;
        }
        // Personal seleccionado (solo los marcados)
        const personalSeleccionado = Array.from(document.querySelectorAll('.personal-row')).filter(row => {
            return row.querySelector('.personal-check').checked;
        }).map(row => {
            const idx = parseInt(row.querySelector('.personal-check').dataset.idx);
            const tiempo = parseFloat(row.querySelector('.tiempo-personal').value) || 0;
            return { ...personal[idx], tiempo, tiempoEstimado: tiempo };
        });
        if (personalSeleccionado.length === 0) {
            alert('Debes seleccionar al menos una persona para la tarea.');
            return;
        }
        if (personalSeleccionado.some(p => p.tiempo <= 0)) {
            alert('No puedes asignar personal con 0 horas de trabajo a la tarea.');
            return;
        }
        if (personalSeleccionado.some(p => p.tiempo > tiempoTotal)) {
            alert('Las horas asignadas a una persona no pueden ser mayores al tiempo total de la tarea.');
            return;
        }
        if (personalSeleccionado.some(p => p.tiempo > 8)) {
            alert('Advertencia: Si asignas más de 8 horas a una persona en una sola tarea, a partir de la novena hora se aplicará un recargo del 50% en el costo por hora.');
        }
        if (personalSeleccionado.some(p => p.tiempo > tiempoTotal)) {
            alert('Las horas asignadas a una persona no pueden ser mayores al tiempo total de la tarea.');
            return;
        }
        // Materiales seleccionado (solo los marcados)
        const materialesSeleccionado = Array.from(document.querySelectorAll('.material-row')).filter(row => {
            return row.querySelector('.material-check').checked;
        }).map(row => {
            const idx = parseInt(row.querySelector('.material-check').dataset.idx);
            const cantidad = parseFloat(row.querySelector('.cantidad-material').value) || 0;
            return { ...materiales[idx], cantidad, cantidadEstimado: cantidad };
        });
        if (materialesSeleccionado.some(m => m.cantidad <= 0)) {
            alert('No puedes asignar materiales con 0 unidades a la tarea.');
            return;
        }
        // Validar y actualizar reserva de materiales
        for (let m of materialesSeleccionado) {
            const mat = materiales.find(mat => mat.nombre === m.nombre);
            if (mat && m.cantidad > mat.reserva) {
                alert(`No puedes asignar más unidades de ${m.nombre} (${m.cantidad}) que las que hay en reserva (${mat.reserva}).`);
                return;
            }
        }
        // Disminuir la reserva de materiales usados
        materialesSeleccionado.forEach(m => {
            const mat = materiales.find(mat => mat.nombre === m.nombre);
            if (mat) mat.reserva -= m.cantidad;
        });
        // Otros costos seleccionado (solo los marcados, con cantidad)
        const otrosSeleccionado = Array.from(document.querySelectorAll('.otros-row')).filter(row => {
            return row.querySelector('.otros-check').checked;
        }).map(row => {
            const idx = parseInt(row.querySelector('.otros-check').dataset.idx);
            const cantidad = parseFloat(row.querySelector('.cantidad-otros').value) || 0;
            return { ...otrosCostos[idx], cantidad, cantidadEstimado: cantidad };
        });
        // Validar que no se exceda la cantidad de otros costos
        for (let o of otrosSeleccionado) {
            if (o.cantidad <= 0) {
                alert(`No puedes asignar ${o.nota} con 0 unidades a la tarea.`);
                return;
            }
            // Sumar el total usado en todas las tareas para ese gasto
            const totalUsado = tareas.reduce((acc, t) => {
                const usado = t.otrosCostos.find(oc => oc.nota === o.nota);
                return acc + (usado ? usado.cantidad : 0);
            }, 0);
            if (o.cantidad + totalUsado > o.cantidadDisponible) {
                alert(`No puedes asignar ${o.nota} con ${o.cantidad} unidades. Solo hay ${o.cantidadDisponible - totalUsado} disponibles.`);
                return;
            }
        }
        const costoEstimado = parseFloat(document.getElementById('costoEstimadoTarea')?.value) || 0;
        tareas.push({ nombre, estado, tiempoTotal, costoEstimado, personal: personalSeleccionado, materiales: materialesSeleccionado, otrosCostos: otrosSeleccionado });
        renderTareas();
        tareaForm.reset();
        tareaForm.classList.add('hidden');
    });
}

export function fillTareaFormOptions() {
    // Personal (checkbox + input horas)
    const personalContainer = document.getElementById('personalTareaContainer');
    personalContainer.innerHTML = '';
    personal.forEach((p, idx) => {
        const row = document.createElement('div');
        row.className = 'personal-row flex gap-2 mb-2 items-center';
        row.innerHTML = `<input type='checkbox' class='personal-check' data-idx='${idx}' /><span>${p.nombre} ${p.apellido}</span><input type='number' class='tiempo-personal border rounded px-2 py-1' min='0' placeholder='Horas' />`;
        personalContainer.appendChild(row);
    });
    // Materiales (checkbox + input cantidad)
    const materialesContainer = document.getElementById('materialesTareaContainer');
    materialesContainer.innerHTML = '';
    materiales.forEach((m, idx) => {
        const row = document.createElement('div');
        row.className = 'material-row flex gap-2 mb-2 items-center';
        row.innerHTML = `<input type='checkbox' class='material-check' data-idx='${idx}' /><span>${m.nombre}</span><input type='number' class='cantidad-material border rounded px-2 py-1' min='0' placeholder='Cantidad a usar' style='display:none;' />`;
        row.querySelector('.material-check').addEventListener('change', function() {
            row.querySelector('.cantidad-material').style.display = this.checked ? '' : 'none';
        });
        materialesContainer.appendChild(row);
    });
    // Otros Costos (checkbox + input cantidad)
    const otrosContainer = document.getElementById('otrosTareaContainer');
    otrosContainer.innerHTML = '';
    otrosCostos.forEach((o, idx) => {
        const row = document.createElement('div');
        row.className = 'otros-row flex gap-2 mb-2 items-center';
        row.innerHTML = `<input type='checkbox' class='otros-check' data-idx='${idx}' /><span>${o.nota} ($${o.costo})</span><input type='number' class='cantidad-otros border rounded px-2 py-1' min='0' placeholder='Cantidad' style='display:none;' />`;
        row.querySelector('.otros-check').addEventListener('change', function() {
            row.querySelector('.cantidad-otros').style.display = this.checked ? '' : 'none';
        });
        otrosContainer.appendChild(row);
    });
}
// Modal de edición de tarea
function mostrarModalEditarTarea(idx) {
    const tarea = tareas[idx];
    // Crear modal si no existe
    let modal = document.getElementById('modal-editar-tarea');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-editar-tarea';
        modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
                <h3 class="text-2xl font-bold mb-4">Editar tarea</h3>
                <form id="form-editar-tarea">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Nombre</label>
                        <input type="text" name="nombre" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Estado</label>
                        <select name="estado" class="w-full px-3 py-2 border rounded">
                            ${estadosTarea.map(e => `<option value='${e}'>${e}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Costo estimado</label>
                        <input type="number" name="costoEstimado" class="w-full px-3 py-2 border rounded" min="0">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Tiempo total (horas)</label>
                        <input type="number" name="tiempoTotal" class="w-full px-3 py-2 border rounded" min="0">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Personal</label>
                        <div id="editar-personal-container"></div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Materiales</label>
                        <div id="editar-materiales-container"></div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Otros Costos</label>
                        <div id="editar-otros-container"></div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" id="cancelarEditarTarea" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
                        <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.classList.remove('hidden');
    }
    // Precargar datos
    const form = document.getElementById('form-editar-tarea');
    form.nombre.value = tarea.nombre;
    form.estado.value = tarea.estado;
    form.costoEstimado.value = tarea.costoEstimado || 0;
    form.tiempoTotal.value = tarea.tiempoTotal || 0;
    // Personal
    const personalDiv = document.getElementById('editar-personal-container');
    personalDiv.innerHTML = '';
    import('./personal.js').then(({ personal }) => {
        personal.forEach((p, i) => {
            const asignado = tarea.personal.find(tp => tp.nombre === p.nombre && tp.apellido === p.apellido);
            personalDiv.innerHTML += `<div class='mb-2 flex gap-2 items-center'><input type='checkbox' name='personal-${i}' ${asignado ? 'checked' : ''} /><span>${p.nombre} ${p.apellido}</span><input type='number' min='1' step='1' class='border rounded px-2 py-1' name='personal-horas-${i}' value='${asignado ? asignado.tiempo : 1}' /></div>`;
        });
    });
    // Materiales
    const materialesDiv = document.getElementById('editar-materiales-container');
    materialesDiv.innerHTML = '';
    import('./materiales.js').then(({ materiales }) => {
        materiales.forEach((m, i) => {
            const asignado = tarea.materiales.find(tm => tm.nombre === m.nombre);
            materialesDiv.innerHTML += `<div class='mb-2 flex gap-2 items-center'><input type='checkbox' name='material-${i}' ${asignado ? 'checked' : ''} /><span>${m.nombre}</span><input type='number' min='1' step='1' class='border rounded px-2 py-1' name='material-cantidad-${i}' value='${asignado ? asignado.cantidad : 1}' /></div>`;
        });
    });
    // Otros Costos
    const otrosDiv = document.getElementById('editar-otros-container');
    otrosDiv.innerHTML = '';
    import('./otroscostos.js').then(({ otrosCostos }) => {
        otrosCostos.forEach((o, i) => {
            const asignado = tarea.otrosCostos.find(to => to.nota === o.nota);
            otrosDiv.innerHTML += `<div class='mb-2 flex gap-2 items-center'><input type='checkbox' name='otros-${i}' ${asignado ? 'checked' : ''} /><span>${o.nota} (${o.unidad || ''}, $${o.costo})</span><input type='number' min='1' step='1' class='border rounded px-2 py-1' name='otros-cantidad-${i}' value='${asignado ? asignado.cantidad : 1}' /></div>`;
        });
    });
    // Cancelar
    document.getElementById('cancelarEditarTarea').onclick = () => {
        modal.classList.add('hidden');
    };
    // Guardar
    form.onsubmit = function(e) {
        e.preventDefault();
        tarea.nombre = form.nombre.value;
        tarea.estado = form.estado.value;
        tarea.costoEstimado = parseFloat(form.costoEstimado.value) || 0;
        tarea.tiempoTotal = parseFloat(form.tiempoTotal.value) || 0;
        // Personal
        import('./personal.js').then(({ personal }) => {
            tarea.personal = personal.filter((p, i) => form[`personal-${i}`].checked).map((p, i) => ({ ...p, tiempo: parseFloat(form[`personal-horas-${i}`].value) || 0 }));
            // Materiales
            import('./materiales.js').then(({ materiales }) => {
                const nuevosMateriales = materiales.filter((m, i) => form[`material-${i}`].checked).map((m, i) => ({ ...m, cantidad: parseFloat(form[`material-cantidad-${i}`].value) || 0 }));
                // Validar reserva al editar
                for (let m of nuevosMateriales) {
                    const mat = materiales.find(mat => mat.nombre === m.nombre);
                    if (mat && m.cantidad > mat.reserva) {
                        alert(`No puedes asignar más unidades de ${m.nombre} (${m.cantidad}) que las que hay en reserva (${mat.reserva}).`);
                        return;
                    }
                }
                // Disminuir la reserva de materiales usados
                nuevosMateriales.forEach(m => {
                    const mat = materiales.find(mat => mat.nombre === m.nombre);
                    if (mat) mat.reserva -= m.cantidad;
                });
                tarea.materiales = nuevosMateriales;
                // Otros Costos
                import('./otroscostos.js').then(({ otrosCostos }) => {
                    tarea.otrosCostos = otrosCostos.filter((o, i) => form[`otros-${i}`].checked).map((o, i) => ({ ...o, cantidad: parseFloat(form[`otros-cantidad-${i}`].value) || 0 }));
                    modal.classList.add('hidden');
                    renderTareas();
                });
            });
        });
    };
}
     