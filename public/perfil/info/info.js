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
            setTextContent('lastname', data.lastname);
            setTextContent('steamID64', data.steamID64);
            setTextContent('money', '$' +'' +data.money);
            setTextContent('bank', '$' +'' +data.bank);
            setTextContent('argcoins', '$' +'' +data.argcoins);
            setTextContent('job', data.job);
            setTextContent('health', data.health);
            setTextContent('armor', data.armor);
            setTextContent('dateofbirth', data.dateofbirth);
            setTextContent('sex', data.sex);
            setTextContent('height', data.height + 'cm' );
            setTextContent('trabajonombre', data.trabajonombre  + ' ' + data.trabajogrado);

            const sexo = data.sex === "m" ? "Masculino" : data.sex === "f" ? "Femenino" : "No especificado";
            setTextContent('sex', sexo);

            // Mostrar el número de teléfono
            setTextContent('telefononumero', data.phone_number || 'No tienes');

            // Actualizar las barras de salud y armadura
            const healthBar = document.getElementById('healthBar');
            const healthValue = Math.min(Math.max(data.health, 0), 100);
            healthBar.style.width = `${healthValue}%`;

            const armorBar = document.getElementById('armorBar');
            const armorValue = Math.min(Math.max(data.armor, 0), 100);
            armorBar.style.width = `${armorValue}%`;

            // Mostrar el avatar
            const avatar = document.getElementById('avatar');
            if (avatar && data.avatar) {
                avatar.src = data.avatar;
            }

            const avatar2 = document.getElementById('avatar2');
            if (avatar2 && data.mugshot_url) {
                avatar2.src = data.mugshot_url;
            }

            // Mostrar la última conexión
            const lastSeenElement = document.getElementById('created_at');
            if (lastSeenElement && data.last_seen) {
                lastSeenElement.textContent = data.last_seen;
            }

            // Mostrar el inventario (con imágenes, nombre y cantidad)
            const inventoryColumn = document.getElementById('inventoryColumn');

            if (data.inventory.length > 0) {
                data.inventory.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('inventory-item');

                    // Ruta de la imagen (asegurándonos de que el nombre de la imagen es minúsculo)
                    const itemImagePath = `/perfil/info/images/${item.name.toLowerCase()}.png`;

                    // Crear una nueva imagen y verificar si existe
                    const img = new Image();
                    img.src = itemImagePath;
                    img.onload = () => {
                        // Si la imagen se carga correctamente, la mostramos
                        itemElement.innerHTML = `
                            <img src="${img.src}" alt="${item.name}" class="inventory-img">
                            <p class="inventory-count">x${item.count}</p>
                        `;
                    };
                    img.onerror = () => {
                        // Si la imagen no se carga, ponemos una imagen predeterminada
                        itemElement.innerHTML = `
                            <img src="/perfil/info/images/yusuf.png" alt="default" class="inventory-img">
                            <p class="inventory-count">x${item.count}/p>
                        `;
                    };

                    inventoryColumn.appendChild(itemElement);
                });
            } else {
                inventoryColumn.innerHTML += "<p>El inventario está vacío.</p>";
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
