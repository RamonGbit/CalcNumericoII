// main.js
// Lógica para el control de proyectos

// Arrays principales
const tareas = [];
const personal = [
    { nombre: 'Juan Pérez', sueldo: 12000, area: 'Desarrollo', costoHora: 100 },
    { nombre: 'Ana López', sueldo: 10500, area: 'Diseño', costoHora: 90 }
];
const otrosCostos = [
    { razon: 'Transporte', cantidad: 1500, costoUnidad: 1500 },
    { razon: 'Papelería', cantidad: 300, costoUnidad: 300 }
];

// ...aquí irá toda la lógica JS migrada y mejorada...

// Importar lógica de materiales
import { renderMateriales, setupMaterialForm } from './materiales.js';
import { renderPersonal, setupPersonalForm } from './personal.js';
import { renderGastos, setupGastoForm } from './otroscostos.js';
import { renderTareas, setupTareaForm } from './tareas.js';

document.addEventListener('DOMContentLoaded', () => {
    setupMaterialForm();
    setupPersonalForm();
    setupGastoForm();
    setupTareaForm();
    renderDashboard();

    // Presupuesto: alerta si se excede
    const inputPresupuesto = document.getElementById('inputPresupuesto');
    let presupuesto = 0;
    if (inputPresupuesto) {
        inputPresupuesto.addEventListener('input', function() {
            presupuesto = parseFloat(this.value) || 0;
            checkPresupuesto();
        });
    }


    function getTotalCostoEstimado() {
        let total = 0;
        if (Array.isArray(tareas)) {
            tareas.forEach(t => {
                total += t.costoEstimado || 0;
            });
        }
        return total;
    }

    function checkPresupuesto() {
        let total = getTotalCostoEstimado();
        if (presupuesto > 0 && total > presupuesto) {
            alert('¡El costo total estimado de las tareas excede el presupuesto del proyecto!');
        }
    }

    // Bloquear registro de tarea si excede presupuesto
    const tareaForm = document.getElementById('tareaForm');
    if (tareaForm) {
        tareaForm.addEventListener('submit', function(e) {
            const costoInput = document.getElementById('costoEstimadoTarea');
            let nuevoCosto = parseFloat(costoInput?.value) || 0;
            let total = getTotalCostoEstimado() + nuevoCosto;
            if (presupuesto > 0 && total > presupuesto) {
                alert('Advertencia: El costo total estimado de las tareas ha excedido el presupuesto del proyecto.');
                // Se permite guardar la tarea
            }
        }, true);
    }

    // Verificar presupuesto cada vez que se actualiza el dashboard
    const oldRenderDashboard = window.renderDashboard;
    window.renderDashboard = function() {
        oldRenderDashboard();
        checkPresupuesto();
    };

    // SPA: navegación entre secciones
    const dashboardSection = document.getElementById('dashboard-section');
    const tareasSection = document.getElementById('tareas-section');
    const personalSection = document.getElementById('personal-section');
    const materialesSection = document.getElementById('materiales-section');
    const otrosCostosSection = document.getElementById('otroscostos-section');
    const sidebarLinks = document.querySelectorAll('nav ul li a');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('bg-red-700'));
            this.classList.add('bg-red-700');
            const section = this.textContent.trim();
            dashboardSection.style.display = 'none';
            tareasSection.style.display = 'none';
            personalSection.style.display = 'none';
            materialesSection.style.display = 'none';
            otrosCostosSection.style.display = 'none';
            if (section === 'Dashboard') {
            dashboardSection.style.display = '';
            renderDashboard();
            } else if (section === 'Tareas') {
                tareasSection.style.display = '';
                renderTareas();
            } else if (section === 'Personal') {
                personalSection.style.display = '';
                renderPersonal();
            } else if (section === 'Materiales') {
                materialesSection.style.display = '';
                renderMateriales();
            } else if (section === 'Otros Costos') {
                otrosCostosSection.style.display = '';
                renderGastos();
            }
        });
    });

    // Render inicial solo dashboard
    dashboardSection.style.display = '';
    tareasSection.style.display = 'none';
    personalSection.style.display = 'none';
    materialesSection.style.display = 'none';
    otrosCostosSection.style.display = 'none';
});

// DASHBOARD LOGIC
import { renderDashboard } from './dashboard.js';