// materiales.js
// Lógica para la sección de materiales

export const materiales = [
    // Inicialmente vacío
];

export function renderMateriales() {
    const listaMateriales = document.getElementById('listaMateriales');
    if (!listaMateriales) return;
    listaMateriales.innerHTML = '';
    if (materiales.length === 0) {
        listaMateriales.innerHTML = '<li class="py-3 text-gray-500">No hay materiales agregados.</li>';
        return;
    }
    materiales.forEach((m, idx) => {
        const li = document.createElement('li');
        li.className = 'py-3 flex flex-col md:flex-row md:items-center md:justify-between';
        const total = (m.reserva * m.costoUnidad) || 0;
        li.innerHTML = `
            <span class="font-medium">${m.nombre}</span>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-2 md:mt-0 md:ml-2">Reserva: ${m.reserva}</span>
            <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-2 md:mt-0 md:ml-2">Costo/unidad: $${m.costoUnidad}</span>
            <span class="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded mt-2 md:mt-0 md:ml-2">Total: $${total}</span>
            <button class="bg-red-500 text-white px-2 py-1 rounded eliminar-material-btn" data-idx="${idx}">Eliminar</button>
        `;
        listaMateriales.appendChild(li);
    });
    // Listener para botón Eliminar en materiales
    listaMateriales.querySelectorAll('.eliminar-material-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.idx);
            if (confirm('¿Estás seguro de que deseas eliminar este material?')) {
                materiales.splice(idx, 1);
                renderMateriales();
            }
        });
    });
}

export function setupMaterialForm() {
    const materialForm = document.getElementById('materialForm');
    const agregarMaterialBtn = document.getElementById('agregarMaterialBtn');
    if (!materialForm || !agregarMaterialBtn) return;
    agregarMaterialBtn.addEventListener('click', () => {
        materialForm.classList.toggle('hidden');
    });
    // Bloquear la letra 'e' en los campos de cantidad y costo
    const reservaInput = document.getElementById('reservaMaterial');
    const costoUnidadInput = document.getElementById('costoUnidadMaterial');
    [reservaInput, costoUnidadInput].forEach(input => {
        if (input) {
            input.addEventListener('keydown', function(e) {
                if (e.key.toLowerCase() === 'e') e.preventDefault();
            });
            input.addEventListener('input', function(e) {
                this.value = this.value.replace(/e/gi, '');
            });
        }
    });
    materialForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombreMaterial').value.trim();
        const reserva = parseInt(document.getElementById('reservaMaterial').value);
        const costoUnidad = parseFloat(document.getElementById('costoUnidadMaterial')?.value) || 0;
        if (!nombre) return;
        if (nombre.length < 3 || nombre.length > 50) {
            alert('El nombre del material debe tener entre 3 y 50 caracteres.');
            return;
        }
        // Validar duplicados (case-insensitive)
        if (materiales.some(m => m.nombre.toLowerCase() === nombre.toLowerCase())) {
            alert('Ya existe un material con ese nombre.');
            return;
        }
        if (isNaN(reserva) || reserva <= 0) {
            alert('La cantidad en reserva debe ser mayor a 0.');
            return;
        }
        if (isNaN(costoUnidad) || costoUnidad <= 0) {
            alert('El costo por unidad debe ser mayor a 0.');
            return;
        }
        materiales.push({ nombre, reserva, costoUnidad });
        renderMateriales();
        materialForm.reset();
        materialForm.classList.add('hidden');
    });
}
