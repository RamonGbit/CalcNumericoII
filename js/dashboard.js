// dashboard.js
// Lógica para el dashboard

import { tareas, estadosTarea, renderTareas } from './tareas.js';

export function renderDashboard() {
    // Avance
    const total = tareas.length;
    const terminadas = tareas.filter(t => t.estado === 'Terminada').length;
    const porcentaje = total === 0 ? 0 : Math.round((terminadas / total) * 100);
    const bar = document.getElementById('dashboard-bar');
    const porcText = document.getElementById('dashboard-porcentaje');
    if (bar) bar.style.width = porcentaje + '%';
    if (porcText) porcText.textContent = porcentaje + '%';

    // Costos estimados y reales
    let costoPersonalEst = 0, costoPersonalReal = 0;
    let costoMaterialesEst = 0, costoMaterialesReal = 0;
    let costoOtrosEst = 0, costoOtrosReal = 0;
    let personalHoras = {};
    let costoTotalEstimado = 0;
    let costoTotalReal = 0;
    tareas.forEach(t => {
        costoTotalEstimado += t.costoEstimado || 0;
        // Personal
        t.personal.forEach(p => {
            const horas = p.tiempo || 0;
            const costo = (p.costoHora || 0) * horas;
            costoPersonalEst += costo;
            if (t.estado === 'Terminada') costoPersonalReal += costo;
            // Sumar horas por persona para sobreutilización
            const key = `${p.nombre} ${p.apellido}`;
            personalHoras[key] = (personalHoras[key] || 0) + horas;
        });
        // Materiales
        t.materiales.forEach(m => {
            const cantidad = m.cantidad || 0;
            const costo = (m.costoUnidad || 0) * cantidad;
            costoMaterialesEst += costo;
            if (t.estado === 'Terminada') costoMaterialesReal += costo;
        });
        // Otros Costos
        t.otrosCostos.forEach(o => {
            const cantidad = o.cantidad || 0;
            const costo = (o.costo || 0) * cantidad;
            costoOtrosEst += costo;
            if (t.estado === 'Terminada') costoOtrosReal += costo;
        });
        // Real
        if (t.estado === 'Terminada') {
            let real = 0;
            t.personal.forEach(p => { real += (p.costoHora || 0) * (p.tiempo || 0); });
            t.materiales.forEach(m => { real += (m.costoUnidad || 0) * (m.cantidad || 0); });
            t.otrosCostos.forEach(o => { real += (o.costo || 0) * (o.cantidad || 0); });
            costoTotalReal += real;
        }
    });
    // Mostrar costos
    const ce = document.getElementById('dashboard-costo-estimado');
    const cr = document.getElementById('dashboard-costo-real');
    if (ce) ce.textContent = '$' + costoTotalEstimado;
    if (cr) cr.textContent = '$' + costoTotalReal;
    // Personal sobreutilizado
    const personalOver = document.getElementById('dashboard-personal-over');
    if (personalOver) {
        personalOver.innerHTML = '';
        Object.entries(personalHoras).forEach(([nombre, horas]) => {
            if (horas > 8) {
                const li = document.createElement('li');
                li.textContent = `${nombre}: ${horas}h`;
                li.className = 'text-red-600 font-bold animate-pulse transition-transform duration-500';
                personalOver.appendChild(li);
            }
        });
        if (personalOver.innerHTML === '') {
            personalOver.innerHTML = '<span class="text-green-600">Ninguno</span>';
        }
    }
    // Costos por tipo
    const cp = document.getElementById('dashboard-costo-personal');
    const cm = document.getElementById('dashboard-costo-materiales');
    const co = document.getElementById('dashboard-costo-otros');
    if (cp) cp.innerHTML = `<span class='font-bold'>Estimado:</span> $${costoPersonalEst} <br><span class='font-bold'>Real:</span> $${costoPersonalReal}`;
    if (cm) cm.innerHTML = `<span class='font-bold'>Estimado:</span> $${costoMaterialesEst} <br><span class='font-bold'>Real:</span> $${costoMaterialesReal}`;
    if (co) co.innerHTML = `<span class='font-bold'>Estimado:</span> $${costoOtrosEst} <br><span class='font-bold'>Real:</span> $${costoOtrosReal}`;

    // Tareas en dashboard
    const listaDashboard = document.getElementById('dashboard-lista-tareas');
    if (listaDashboard) {
        listaDashboard.innerHTML = '';
        if (tareas.length === 0) {
            listaDashboard.innerHTML = '<li class="py-3 text-gray-500">No hay tareas registradas.</li>';
        } else {
            tareas.forEach((t, idx) => {
                const li = document.createElement('li');
                li.className = 'py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2';
                li.innerHTML = `
                    <div>
                        <span class="font-medium text-lg">${t.nombre}</span>
                        <span class="text-xs px-2 py-1 rounded ml-2 ${t.estado === 'Terminada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${t.estado}</span>
                        <div class="text-xs mt-2">Costo estimado: $${t.costoEstimado || 0}</div>
                    </div>
                    <div>
                        <select class="border rounded px-2 py-1 dashboard-estado-select" data-idx="${idx}">
                            ${estadosTarea.map(e => `<option value='${e}' ${e === t.estado ? 'selected' : ''}>${e}</option>`).join('')}
                        </select>
                    </div>
                `;
                listaDashboard.appendChild(li);
            });
            // Listener para actualizar estado desde dashboard
            listaDashboard.querySelectorAll('.dashboard-estado-select').forEach(select => {
                select.addEventListener('change', function() {
                    const idx = parseInt(this.dataset.idx);
                    tareas[idx].estado = this.value;
                    renderTareas();
                    renderDashboard();
                });
            });
        }
    }
}
