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
            otrosCostos.splice(idx, 1);
            renderGastos();
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
    gastoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nota = document.getElementById('notaGasto').value.trim();
        const costo = parseFloat(document.getElementById('costoGasto').value);
        if (nota && !isNaN(costo)) {
            otrosCostos.push({ nota, costo });
            renderGastos();
            gastoForm.reset();
            gastoForm.classList.add('hidden');
        }
    });
}
