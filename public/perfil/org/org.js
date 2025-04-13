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
            if (avatar && data.avatar) avatar.src = data.avatar;

            const avatar2 = document.getElementById('avatar2');
            if (avatar2 && data.mugshot_url) avatar2.src = data.mugshot_url;

            // Mostrar la mafia
            const mafiaElement = document.getElementById('mafia');
            if (mafiaElement) {
                mafiaElement.querySelector('.panel-text').textContent = data.mafia_name
                    ? `Mafia #${data.mafia_name}`
                    : 'No perteneces a ninguna mafia';
            }

            // Si no pertenece a ninguna mafia, ocultamos los divs de la mafia
            const mafiaPanel = document.getElementById('largePanel');
            if (!data.mafia_name) {
                // Ocultamos los divs relacionados con la mafia
                mafiaElement.style.display = 'none';
                document.getElementById('mafiaLevel').style.display = 'none';
                document.getElementById('mafiaExpiration').style.display = 'none';
                document.getElementById('mafiaMembers').style.display = 'none';

                // Mostrar texto centralizado en gris
                const noMafiaText = document.createElement('div');
                noMafiaText.textContent = 'No perteneces a ninguna mafia';
                noMafiaText.classList.add('no-mafia-text'); // Añadir clase                

                // Insertamos el texto en el panel
                mafiaPanel.appendChild(noMafiaText);
            } else {
                // Mostrar los divs de la mafia si pertenece a una mafia
                document.getElementById('mafiaLevel').style.display = 'flex';
                document.getElementById('mafiaExpiration').style.display = 'flex';
                document.getElementById('mafiaMembers').style.display = 'flex';
            }

            // Mostrar nivel de la mafia
            const mafiaLevelElement = document.getElementById('mafiaLevel');
            if (mafiaLevelElement && data.mafia_level !== null) {
                mafiaLevelElement.querySelector('.panel-text').textContent = `Nivel de la mafia ${data.mafia_level}`;
            }

            // Mostrar fecha de expiración de la mafia
            const mafiaExpirationElement = document.getElementById('mafiaExpiration');
            if (mafiaExpirationElement && data.mafia_expiration) {
                mafiaExpirationElement.querySelector('.panel-text').textContent =
                    `Expiración: ${new Date(data.mafia_expiration).toLocaleDateString()}`;
            }

            // Manejo del botón "Ver miembros" y del modal
            const openMembersBtn = document.getElementById('openMembers');
            const membersModal = document.getElementById('membersModal');
            const closeModalBtn = document.querySelector('.close-modal');
            const membersListElement = document.getElementById('membersList');

            if (openMembersBtn && membersModal && closeModalBtn && membersListElement) {
                openMembersBtn.addEventListener('click', () => {
                    membersListElement.innerHTML = ''; // Limpiar lista antes de abrir el modal

                    if (data.mafia_members && data.mafia_members.length > 0) {
                        data.mafia_members.forEach(member => {
                            const memberItem = document.createElement('li');
                            memberItem.classList.add('member-item'); // Agregar clase para estilos

                            // Asignar el rango adecuado
                            const rankText = member.rank === 1 ? 'Jefe' : member.rank === 0 ? 'Miembro' : `Rango: ${member.rank}`;

                            memberItem.textContent = `${member.name} (${rankText}) ${member.isPlayer ? '(Tú)' : ''}`;
                            

                            if (member.isPlayer) memberItem.classList.add('member-you');
                            membersListElement.appendChild(memberItem);
                        });
                    } else {
                        membersListElement.innerHTML = '<li class="member-item">No hay miembros en esta mafia.</li>';
                    }

                    membersModal.style.display = 'flex'; // Mostrar el modal correctamente
                });

                closeModalBtn.addEventListener('click', () => {
                    membersModal.style.display = 'none'; // Ocultar el modal al cerrar
                });

                window.addEventListener('click', (event) => {
                    if (event.target === membersModal) {
                        membersModal.style.display = 'none'; // Cerrar si se hace clic fuera del modal
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
            document.getElementById('userInfo').textContent = 'No tienes un personaje creado';
        });
});

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("membersModal");
    const openBtn = document.getElementById("openMembers");
    const closeBtn = document.querySelector(".close-modal");

    openBtn.addEventListener("click", function () {
        modal.style.display = "flex"; // Solo se activa cuando se hace clic en el botón
    });

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Cerrar el modal si se hace clic fuera de él
    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
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
