document.addEventListener("DOMContentLoaded", function () {
    fetch('/user')
        .then(response => {
            if (!response.ok) {
                throw new Error('No autenticado o no tienes un personaje creado');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                document.getElementById('userInfo').textContent = data.error;
                return;
            }

            const setTextContent = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };

            setTextContent('name', data.name);

            // Mostrar el avatar
            const avatar = document.getElementById('avatar');
            if (avatar && data.avatar) {
                avatar.src = data.avatar;
            }

            const avatar2 = document.getElementById('avatar2');
            if (avatar2 && data.mugshot_url) {
                avatar2.src = data.mugshot_url;
            }

            // Limpiar el panel de vehículos antes de agregar nuevos
           
        })
        .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
            document.getElementById('userInfo').textContent = 'No tienes un personaje creado';
        });
});

fetch('/perfil/getNombre')
.then(response => response.json())
.then(data => {
    document.getElementById('user-job').textContent = '@' + data.nombre;
})
.catch(error => console.error('Error al obtener los datos del usuario:', error));

// Cerrar sesión
function logout() {
    alert("Cerrando sesión...");
    fetch('/logout')
        .then(() => window.location.href = '/');
}

const subPanels = document.querySelectorAll('.sub-panel');
const modal = document.getElementById('itemModal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalIcon = document.getElementById('modal-icon');
const modalPrice = document.getElementById('modal-price');
const modalFeatures = document.getElementById('modal-features');
const closeBtn = document.querySelector('.close-btn');

// Datos personalizados
const panelInfo = {
    0: {
        title: 'Auto del mes',
        desc: '',
        icon: 'fa-solid fa-car',
        price: '$2000',
        features: [
            '350/420KM'
        ]
    },
    1: {
        title: 'Auto exclusivo',
        desc: '',
        icon: 'fa-solid fa-crown',
        price: '$5000',
        features: [
            'Cualquier vehiculo agregado desde GTA5 MODS'
        ]
    },
};

// Mostrar modal al hacer clic
subPanels.forEach((panel, index) => {
    panel.addEventListener('click', () => {
        const info = panelInfo[index];
        modalTitle.textContent = info.title;
        modalDesc.textContent = info.desc;
        modalIcon.className = info.icon;
        modalPrice.textContent = info.price;

        modalFeatures.innerHTML = '';
        info.features.forEach((feature) => {
            const li = document.createElement('li');
            li.textContent = feature;
            modalFeatures.appendChild(li);
        });

        modal.style.display = 'flex';
    });
});

// Cerrar modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Cerrar si clic fuera del modal
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});