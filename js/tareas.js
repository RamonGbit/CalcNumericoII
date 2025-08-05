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
                <div class="text-xs mt-2">Otros Costos: ${t.otrosCostos.map(o => `${o.nota} ($${o.costo}) x${o.cantidad}`).join(', ')}</div>
            </div>
            <div class="flex gap-2">
                <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="window.editTarea(${idx})">Editar</button>
                <select class="border rounded px-2 py-1" onchange="window.updateEstadoTarea(${idx}, this.value)">
                    ${estadosTarea.map(e => `<option value='${e}' ${e === t.estado ? 'selected' : ''}>${e}</option>`).join('')}
                </select>
            </div>
        `;
        listaTareas.appendChild(li);
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
        const costoEstimado = parseFloat(document.getElementById('costoEstimadoTarea').value);
        // Personal seleccionado (solo los marcados)
        const personalSeleccionado = Array.from(document.querySelectorAll('.personal-row')).filter(row => {
            return row.querySelector('.personal-check').checked;
        }).map(row => {
            const idx = parseInt(row.querySelector('.personal-check').dataset.idx);
            const tiempo = parseFloat(row.querySelector('.tiempo-personal').value) || 0;
            return { ...personal[idx], tiempo };
        });
        // Materiales seleccionado (solo los marcados)
        const materialesSeleccionado = Array.from(document.querySelectorAll('.material-row')).filter(row => {
            return row.querySelector('.material-check').checked;
        }).map(row => {
            const idx = parseInt(row.querySelector('.material-check').dataset.idx);
            const cantidad = parseFloat(row.querySelector('.cantidad-material').value) || 0;
            return { ...materiales[idx], cantidad };
        });
        // Otros costos seleccionado (solo los marcados, con cantidad)
        const otrosSeleccionado = Array.from(document.querySelectorAll('.otros-row')).filter(row => {
            return row.querySelector('.otros-check').checked;
        }).map(row => {
            const idx = parseInt(row.querySelector('.otros-check').dataset.idx);
            const cantidad = parseFloat(row.querySelector('.cantidad-otros').value) || 0;
            return { ...otrosCostos[idx], cantidad };
        });

        // Calcular costo real de la tarea
        let costoReal = 0;
        personalSeleccionado.forEach(p => {
            costoReal += (p.costoHora || 0) * (p.tiempo || 0);
        });
        materialesSeleccionado.forEach(m => {
            costoReal += (m.costoUnidad || 0) * (m.cantidad || 0);
        });
        otrosSeleccionado.forEach(o => {
            costoReal += (o.costo || 0) * (o.cantidad || 0);
        });
        if (!isNaN(costoEstimado) && costoReal > costoEstimado) {
            alert('¡El costo real de la tarea supera el costo estimado!');
            return; // No registrar la tarea
        }
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
        row.innerHTML = `
            <input type="checkbox" class="personal-check" data-idx="${idx}">
            <span>${p.nombre} ${p.apellido} (${p.tipo})</span>
            <input type="number" class="tiempo-personal border rounded px-2 py-1" min="0" placeholder="Horas a trabajar" style="display:none;">
        `;
        row.querySelector('.personal-check').addEventListener('change', function() {
            row.querySelector('.tiempo-personal').style.display = this.checked ? '' : 'none';
        });
        personalContainer.appendChild(row);
    });
    // Materiales (checkbox + input cantidad)
    const materialesContainer = document.getElementById('materialesTareaContainer');
    materialesContainer.innerHTML = '';
    materiales.forEach((m, idx) => {
        const row = document.createElement('div');
        row.className = 'material-row flex gap-2 mb-2 items-center';
        row.innerHTML = `
            <input type="checkbox" class="material-check" data-idx="${idx}">
            <span>${m.nombre}</span>
            <input type="number" class="cantidad-material border rounded px-2 py-1" min="0" placeholder="Cantidad a usar" style="display:none;">
        `;
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
        row.innerHTML = `
            <input type="checkbox" class="otros-check" data-idx="${idx}">
            <span>${o.nota} ($${o.costo})</span>
            <input type="number" class="cantidad-otros border rounded px-2 py-1" min="0" placeholder="Cantidad" style="display:none;">
        `;
        row.querySelector('.otros-check').addEventListener('change', function() {
            row.querySelector('.cantidad-otros').style.display = this.checked ? '' : 'none';
        });
        otrosContainer.appendChild(row);
    });
}

// Funciones para editar tarea y estado
window.editTarea = function(idx) {
    // Implementar edición de tarea (puede abrir el formulario con los datos cargados)
    // ...
    alert('Funcionalidad de edición en desarrollo');
};
window.updateEstadoTarea = function(idx, estado) {
    tareas[idx].estado = estado;
    renderTareas();
};
