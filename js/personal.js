// personal.js
// Lógica para la sección de personal

export const personal = [];

export function renderPersonal() {
    const listaPersonal = document.getElementById('listaPersonal');
    if (!listaPersonal) return;
    listaPersonal.innerHTML = '';
    if (personal.length === 0) {
        listaPersonal.innerHTML = '<li class="py-3 text-gray-500">No hay personal registrado.</li>';
        return;
    }
    // Agrupar por tipo
    const tipos = {};
    personal.forEach(p => {
        if (!tipos[p.tipo]) tipos[p.tipo] = [];
        tipos[p.tipo].push(p);
    });
    Object.keys(tipos).forEach(tipo => {
        const grupo = tipos[tipo];
        const header = document.createElement('li');
        header.className = 'py-2 font-bold text-lg text-red-700';
        header.textContent = tipo;
        listaPersonal.appendChild(header);
        grupo.forEach(p => {
            const li = document.createElement('li');
            li.className = 'py-3 flex flex-col md:flex-row md:items-center md:justify-between';
            const costoHoraExtra = (p.costoHora * 1.5).toFixed(2);
            li.innerHTML = `
                <span class="font-medium">${p.nombre} ${p.apellido}</span>
                <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-2 md:mt-0 md:ml-2">Sueldo/hora: $${p.costoHora}</span>
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mt-2 md:mt-0 md:ml-2">Hora extra (50%): $${costoHoraExtra}</span>
            `;
            listaPersonal.appendChild(li);
        });
    });
}

export function setupPersonalForm() {
    const personalForm = document.getElementById('personalForm');
    const agregarPersonalBtn = document.getElementById('agregarPersonalBtn');
    if (!personalForm || !agregarPersonalBtn) return;
    agregarPersonalBtn.addEventListener('click', () => {
        personalForm.classList.toggle('hidden');
    });
    personalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('nombrePersonal').value.trim();
        const apellido = document.getElementById('apellidoPersonal').value.trim();
        const tipo = document.getElementById('tipoPersonal').value.trim();
        const costoHora = parseFloat(document.getElementById('costoHoraPersonal').value);
        if (nombre && apellido && tipo && !isNaN(costoHora)) {
            personal.push({ nombre, apellido, tipo, costoHora });
            renderPersonal();
            personalForm.reset();
            personalForm.classList.add('hidden');
        }
    });
}
