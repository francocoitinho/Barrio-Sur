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
        title: 'VIP Basic',
        desc: '',
        icon: 'fa-solid fa-circle',
        price: '$250 UYU - $6 USD',
        features: [
            'Peso adicional en el inventario',
            '$2.000.000 IC',
            '$1000 Coins',
            'Acceso a Conce VIP',
            'Acceso a utilidades básicas',
        ]
    },
    1: {
        title: 'VIP Gold',
        desc: '',
        icon: 'fa-solid fa-star',
        price: '$350 UYU - $8 USD',
        features: [
            'Más peso en el inventario',
            '$4.000.000 IC',
            '$2000 Coins',
            'Cambio de teléfono',
            'Conce y utilidades VIP',
        ]
    },
    2: {
        title: 'VIP Diamond',
        desc: '',
        icon: 'fa-solid  fa-suitcase',
        price: '$500 UYU - $11 USD',
        features: [
            'Más peso en el inventario',
            '$5.000.000 IC',
            '$3000 Coins',
            'Cambio de teléfono',
            'Conce VIP mejorada',
            'Prioridad baja en Discord/cola',
        ]
    },
    3: {
        title: 'VIP Deluxe',
        desc: '',
        icon: 'fa-solid fa-diamond',
        price: '$650 UYU - $15 USD',
        features: [
            'Inventario ampliado',
            '$6.500.000 IC',
            '$4000 Coins',
            'Cambio de teléfono',
            'Conce y utilidades VIP',
            'Prioridad media en Discord/cola',
        ]
    },
    4: {
        title: 'VIP Elegant',
        desc: '',
        icon: 'fa-solid fa-crown',
        price: '$750 UYU - $17 USD',
        features: [
            'Inventario +30%',
            '$8.000.000 IC',
            '$5000 Coins',
            'Cambio de cara y teléfono',
            'Tienda VIP con descuentos',
            'Prioridad alta en Discord/cola',
        ]
    },
    5: {
        title: 'VIP Barrio',
        desc: '',
        icon: 'fa-solid fa-city',
        price: '$1000 UYU - $23 USD',
        features: [
            'Inventario +50%',
            '$10.000.000 IC',
            '$7000 Coins',
            'Cambio completo de apariencia',
            'Tienda VIP completa',
            'Máxima prioridad en Discord y cola',
            'Acceso exclusivo a eventos VIP',
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

// backend/mercadoPago.js
const mercadopago = require('mercadopago');
const express = require('express');
const router = express.Router();

// Configurar tu token
mercadopago.configure({
    access_token: 'TU_ACCESS_TOKEN_AQUÍ'
});

// Generar preferencia
router.post('/crear-preferencia', async (req, res) => {
    const { userId, vipType, daysToAdd } = req.body;

    const preference = {
        items: [
            {
                title: `VIP ${vipType}`,
                quantity: 1,
                currency_id: "UYU",
                unit_price: 199.99 // o el precio según el tipo de VIP
            }
        ],
        back_urls: {
            success: `https://tusitio.com/tienda/success`,
            failure: `https://tusitio.com/tienda/failure`,
            pending: `https://tusitio.com/tienda/pending`
        },
        notification_url: "https://tusitio.com/api/webhook", // Webhook
        auto_return: "approved",
        metadata: {
            userId,
            vipType,
            daysToAdd
        }
    };

    try {
        const response = await mercadopago.preferences.create(preference);
        res.json({ id: response.body.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la preferencia' });
    }
});

module.exports = router;

// backend/webhook.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('./tuConexionDB');

router.post('/webhook', async (req, res) => {
    const paymentId = req.body.data.id;

    try {
        const { data } = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer TU_ACCESS_TOKEN_AQUÍ`
            }
        });

        if (data.status === 'approved') {
            const { userId, vipType, daysToAdd } = data.metadata;

            // Generar código VIP único
            const vipCode = 'VIP-' + Math.random().toString(36).substring(2, 10).toUpperCase();

            // Guardar en la base de datos
            await db.query(
                'INSERT INTO vips_nocanjeados (user_id, code, vip_type, days_to_add) VALUES (?, ?, ?, ?)',
                [userId, vipCode, vipType, daysToAdd]
            );

            console.log(`✅ Pago aprobado. Código VIP generado: ${vipCode}`);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error en el webhook:', error);
        res.sendStatus(500);
    }
});

module.exports = router;

document.querySelector('.mercado-btn').addEventListener('click', async () => {
    const userId = CURRENT_USER_ID; // reemplazá con tu sistema
    const vipType = "Premium";
    const daysToAdd = 30;

    const res = await fetch('/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vipType, daysToAdd })
    });

    const data = await res.json();

    if (data.id) {
        window.location.href = `https://www.mercadopago.com.uy/checkout/v1/redirect?pref_id=${data.id}`;
    } else {
        alert('Hubo un error al iniciar el pago.');
    }
});
