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
        title: 'Administración',
        desc: 'Acceso exclusivo al panel de staff.',
        icon: 'fas fa-user-shield',
        price: '$9.99',
        features: [
            'Gestión de jugadores',
            'Herramientas de moderación',
            'Historial de sanciones'
        ]
    },
    1: {
        title: 'Comunidad',
        desc: 'Participa en el foro y comparte con otros jugadores.',
        icon: 'fas fa-users',
        price: '$4.99',
        features: [
            'Acceso a foros',
            'Soporte dedicado',
            'Sistema de reputación'
        ]
    },
    2: {
        title: 'Estadísticas',
        desc: 'Consulta tu progreso en el servidor.',
        icon: 'fas fa-chart-line',
        price: '$6.99',
        features: [
            'Rachas y progresos',
            'Historial económico',
            'Rendimiento detallado'
        ]
    }
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

// Generar un código VIP único
const generateVipCode = () => {
    return 'VIP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Ruta para comprar el VIP y generar el código
app.post('/comprarVip', (req, res) => {
    const { userId, vipType, daysToAdd } = req.body; // Datos de la compra

    // Generar un código VIP único
    const vipCode = generateVipCode();

    // Guardar el código en la base de datos (en vips_nocanjeados)
    db.query('INSERT INTO vips_nocanjeados (user_id, code, vip_type, days_to_add) VALUES (?, ?, ?, ?)', 
        [userId, vipCode, vipType, daysToAdd], 
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el código VIP' });
            }

            // Respuesta exitosa con el código VIP generado
            return res.json({
                success: true,
                message: '¡Compra exitosa! Tu código VIP es: ' + vipCode,
                vipCode: vipCode, // Devolver el código VIP al cliente para que lo use en el servidor
                vipType: vipType,
                daysToAdd: daysToAdd
            });
        }
    );
});

// Frontend: Después de la compra de VIP
document.getElementById('buyVipBtn').addEventListener('click', () => {
    const vipType = "Premium"; // El tipo de VIP seleccionado
    const daysToAdd = 30; // Duración del VIP en días

    fetch('/comprarVip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: 'USER_ID', // ID del usuario
            vipType: vipType,
            daysToAdd: daysToAdd
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`¡Compra exitosa! Tu código VIP es: ${data.vipCode}`);
            
            // Mostrar el código VIP en la interfaz
            document.getElementById('vipCode').textContent = `Código VIP: ${data.vipCode}`;
        } else {
            alert('Hubo un error al procesar la compra del VIP.');
        }
    })
    .catch(error => {
        console.error('Error al procesar la compra:', error);
    });
});

// Verificar el código VIP
app.post('/api/verifyVipCode', (req, res) => {
    const { code } = req.body;

    // Buscar el código en la base de datos
    db.query('SELECT * FROM vips_nocanjeados WHERE code = ? AND used = 0', [code], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al verificar el código VIP.' });
        }

        if (result.length > 0) {
            // El código es válido
            const vipData = result[0];

            // Marcar el código como usado
            db.query('UPDATE vips_nocanjeados SET used = 1 WHERE code = ?', [code], (err, updateResult) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Error al marcar el código como usado.' });
                }

                res.json({
                    success: true,
                    vipType: vipData.vip_type,
                    vipExpiration: vipData.days_to_add
                });
            });
        } else {
            res.json({ success: false, message: 'El código no es válido o ya ha sido usado.' });
        }
    });
});

