// otroscostos.js
// Lógica para la sección de otros costos

export const otrosCostos = [];

export function renderGastos() {
    const listaGastos = document.getElementById('listaGastos');
    if (!listaGastos) return;
    listaGastos.innerHTML = '';
    if (otrosCostos.length === 0) {
        listaGastos.innerHTML = '<li class="py-3 text-gray-500">No hay gastos registrados.</li>';
        return;
    }
    otrosCostos.forEach((g, idx) => {
        const li = document.createElement('li');
        li.className = 'py-3 flex flex-col md:flex-row md:items-center md:justify-between';
        li.innerHTML = `
            <span class="font-medium">${g.nota}</span>
            <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-2 md:mt-0 md:ml-2">$${g.costo}</span>
            <button class="bg-red-500 text-white px-2 py-1 rounded eliminar-gasto-btn" data-idx="${idx}">Eliminar</button>
        `;
        listaGastos.appendChild(li);
    });
    // Listener para botón Eliminar en otros costos
    listaGastos.querySelectorAll('.eliminar-gasto-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.idx);
            if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
                otrosCostos.splice(idx, 1);
                renderGastos();
            }
        });
    });
}

export function setupGastoForm() {
    const gastoForm = document.getElementById('gastoForm');
    const agregarGastoBtn = document.getElementById('agregarGastoBtn');
    if (!gastoForm || !agregarGastoBtn) return;
    agregarGastoBtn.addEventListener('click', () => {
        gastoForm.classList.toggle('hidden');
    });
    // Solo permitir números y punto en el campo de costo
    const costoInput = document.getElementById('costoGasto');
    if (costoInput) {
        costoInput.addEventListener('input', function(e) {
            // Reemplaza cualquier caracter que no sea dígito o punto
            this.value = this.value.replace(/[^\d.]/g, '');
            // Solo un punto decimal permitido
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
        });
    }
    gastoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nota = document.getElementById('notaGasto').value.trim();
        const costo = parseFloat(document.getElementById('costoGasto').value);
        if (!nota || isNaN(costo)) return;
        if (nota.length < 3 || nota.length > 100) {
            alert('La nota debe tener entre 3 y 100 caracteres.');
            return;
        }
        // Validar duplicados (case-insensitive)
        if (otrosCostos.some(g => g.nota.toLowerCase() === nota.toLowerCase())) {
            alert('Ya existe un gasto con esa nota.');
            return;
        }
        if (costo <= 0) {
            alert('El costo del gasto debe ser mayor a 0.');
            return;
        }
        otrosCostos.push({ nota, costo });
        renderGastos();
        gastoForm.reset();
        gastoForm.classList.add('hidden');
    });
}
