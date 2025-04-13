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
            const largePanel = document.getElementById('largePanel');
            largePanel.innerHTML = ''; // Limpiar el panel antes de agregar contenido

            // Verificar si el usuario tiene vehículos y agregarlos como columnas
            if (data.vehicle_plates && data.vehicle_plates.length > 0) {
                data.vehicle_plates.forEach((plate, index) => {
                    const statBox = document.createElement('div');
                    statBox.classList.add('stat-box');
                    statBox.style.display = 'inline-block'; // Para mostrar en línea, creando columnas
                    statBox.style.marginRight = '15px'; // Espacio entre los boxes
                    statBox.innerHTML = `
                        <div class="stat-text">
                            <i class="fas fa-car"></i><p>Patente: ${plate}</p>
                        </div>
                    `;
                    largePanel.appendChild(statBox);
                });
            } else {
                // Crear el mensaje sin vehículos
                const noVehiclesMessage = document.createElement('div');
                noVehiclesMessage.classList.add('no-vehicles-message');
                noVehiclesMessage.style.textAlign = 'center';  // Centrar el texto
                noVehiclesMessage.style.marginTop = '20px';  // Espacio desde la parte superior

                // Icono de X en la parte superior
                const closeIcon = document.createElement('i');
                closeIcon.classList.add('fas', 'fa-times');
                closeIcon.style.fontSize = '24px';
                closeIcon.style.cursor = 'pointer'; // Hacerlo clickeable
                closeIcon.style.color = '#ff0000';  // Rojo para indicar "cerrar"
                closeIcon.style.position = 'absolute'; // Posicionarlo en la parte superior
                closeIcon.style.top = '10px'; // Posición en la parte superior
                closeIcon.style.right = '10px'; // Posición a la derecha

                // Agregar el icono de X
                noVehiclesMessage.appendChild(closeIcon);

                // Crear el mensaje de "No tienes vehículos"
                const message = document.createElement('p');
                message.textContent = 'No tienes vehículos';

                // Agregar el mensaje al contenedor
                noVehiclesMessage.appendChild(message);
                largePanel.appendChild(noVehiclesMessage);

                // Funcionalidad para cerrar el mensaje (opcional)
                closeIcon.addEventListener('click', () => {
                    noVehiclesMessage.style.display = 'none';
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
            document.getElementById('userInfo').textContent = 'No tienes un personaje creado';
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
