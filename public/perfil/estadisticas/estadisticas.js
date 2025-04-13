document.addEventListener("DOMContentLoaded", function () {
    fetch('/user')
        .then(response => {
            if (!response.ok) {
                throw new Error('No autenticado o no tienes un personaje creado');  // Mensaje actualizado
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                document.getElementById('userInfo').textContent = data.error;  // Mostrar error si no se tiene un personaje
                return;
            }

            const setTextContent = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };

            setTextContent('name', data.name);
            setTextContent('firstname', data.firstname + ' ' + data.lastname);
// Asumimos que data.kills y data.deaths son números
let kills = data.kills;
let deaths = data.deaths;

// Calculamos el KDR
let kdr = deaths === 0 ? kills : kills / deaths;

// Usamos el valor de kdr en el setTextContent
setTextContent('kills', kills);
setTextContent('muertes', deaths);
setTextContent('kdr', kdr.toFixed(2)); // Redondea el KDR a 2 decimales

            // Mostrar el avatar
            const avatar = document.getElementById('avatar');
            if (avatar && data.avatar) {
                avatar.src = data.avatar;
            }

            const avatar2 = document.getElementById('avatar2');
            if (avatar2 && data.mugshot_url) {
                avatar2.src = data.mugshot_url;
            }

            
        })
        .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
            document.getElementById('userInfo').textContent = 'No tienes un personaje creado';  // Mensaje de error
        });
});

document.addEventListener("DOMContentLoaded", () => {
    const avatar = document.getElementById("avatar");
    const userMenu = document.getElementById("userMenu");

    // Mostrar/ocultar menú al hacer clic en el avatar
    avatar.addEventListener("click", (event) => {
        event.stopPropagation();
        userMenu.classList.toggle("show");
    });

    // Ocultar menú si se hace clic fuera
    document.addEventListener("click", (event) => {
        if (!avatar.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.remove("show");
        }
    });

    // Cargar datos del usuario
    fetch('/user')
        .then(response => {
            if (!response.ok) {
                throw new Error('No autenticado');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('fullname').textContent = `${data.firstname} ${data.lastname}`;
           // document.getElementById('user-job').textContent = `${data.trabajonombre} ${data.trabajogrado}`;
            
            // Ajustar barra de vida
            const healthBar = document.getElementById('health');
            const healthValue = Math.min(Math.max(data.health, 0), 100); // Limita entre 0 y 100
            healthBar.style.width = `${healthValue}%`;
            healthBar.textContent = `${healthValue}%`;
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

async function updateServerStatus() {
    try {
        const response = await fetch('/server/status');
        const data = await response.json();

        // Cambia el estado del servidor
        const serverStatus = document.getElementById('severtstatus');
        serverStatus.innerText = data.online ? 'Online' : 'Offline';
        serverStatus.style.color = data.online ? '#72f0a6' : '#f07272';

        // Actualiza la cantidad de jugadores
        const playersCount = document.querySelector('.online-players-count');
        playersCount.innerText = `${data.players}/${data.maxPlayers}`;
    } catch (error) {
        console.error('Error obteniendo el estado del servidor:', error);
    }
}

// Ejecutar la función cada 5 segundos para actualizar en tiempo real
setInterval(updateServerStatus, 5000);
updateServerStatus();
