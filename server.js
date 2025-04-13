const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const axios = require('axios'); 
const moment = require('moment');
moment.locale('es');

const app = express();
const port = 3000;

// Configuración de sesión
app.use(session({
  secret: 'steam-auth-secret',
  resave: true,
  saveUninitialized: true
}));

// Middleware de Passport
app.use(passport.initialize());
app.use(passport.session());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'argrp'
});


const FIVEM_SERVER_IP = '127.0.0.1'; // IP de tu servidor FiveM
const FIVEM_SERVER_PORT = '30120'; // Puerto del servidor FiveM

// Configuración de Passport con Steam
passport.use(new SteamStrategy({
    returnURL: 'https://barriosur.vercel.app/auth/steam/return',
    realm: 'https://barriosur.vercel.app/',
    apiKey: '26C957763C3E64B85D563498656D2BD1' // Reemplaza con tu API Key de Steam
  },
  function(identifier, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Ruta de autenticación con Steam
app.get('/auth/steam', passport.authenticate('steam'));

// Ruta de retorno después de autenticación en Steam
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/perfil/dashboard'); // Redirige al Dashboard si la autenticación fue exitosa
  }
);

// Ruta protegida para la tienda
app.get('/tienda/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tienda', 'inicio.html'));
});

app.get('/tienda/vips', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tienda', 'vips', 'vips.html'));
});

app.get('/tienda/kits', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tienda', 'kits', 'kits.html'));
});

app.get('/tienda/vehiculos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tienda', 'vehiculos', 'vehiculos.html'));
});

// Ruta protegida para el Dashboard
app.get('/perfil/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  // Verifica si el usuario tiene un personaje antes de mostrar el dashboard
  const steamID64 = req.user.id;
  const steamID64Hex = BigInt(steamID64).toString(16).toLowerCase();

  db.query('SELECT * FROM users WHERE steam_id = ?', [steamID64Hex], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error.html'));
    }

    if (results.length === 0) {
      // Si no tiene personaje, mostrar la página de error
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error', 'error.html'));
    }

    // Si el usuario tiene personaje, servir la página del dashboard
    return res.sendFile(path.join(__dirname, 'public', 'perfil', 'dashboard.html'));
  });
});

app.get('/perfil/bienes', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const steamID64 = req.user.id;
  const steamID64Hex = BigInt(steamID64).toString(16).toLowerCase();

  db.query('SELECT * FROM users WHERE steam_id = ?', [steamID64Hex], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error.html'));
    }

    if (results.length === 0) {
      // Si no tiene personaje, mostrar la página de error
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error', 'error.html'));
    }

    // Si el usuario tiene personaje, servir la página del dashboard
    return res.sendFile(path.join(__dirname, 'public', 'perfil', 'bienes', 'bienes.html'));
  });
 // Sirve la página de bienes
});

app.get('/perfil/info', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  const steamID64 = req.user.id;
  const steamID64Hex = BigInt(steamID64).toString(16).toLowerCase();

  db.query('SELECT * FROM users WHERE steam_id = ?', [steamID64Hex], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error', 'error.html'));
    }

    if (results.length === 0) {
      // Si no tiene personaje, mostrar la página de error
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error', 'error.html'));
    }

    // Si el usuario tiene personaje, servir la página del dashboard
    return res.sendFile(path.join(__dirname, 'public', 'perfil', 'info', 'info.html')); // Sirve la página de información
  });

});

app.get('/perfil/org', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  const steamID64 = req.user.id;
  const steamID64Hex = BigInt(steamID64).toString(16).toLowerCase();

  db.query('SELECT * FROM users WHERE steam_id = ?', [steamID64Hex], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error', 'error.html'));
    }

    if (results.length === 0) {
      // Si no tiene personaje, mostrar la página de error
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error', 'error.html'));
    }

    // Si el usuario tiene personaje, servir la página del dashboard
    return res.sendFile(path.join(__dirname, 'public', 'perfil', 'org', 'org.html')); // Sirve la página de información
  });

});

app.get('/perfil/estadisticas', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const steamID64 = req.user.id;
  const steamID64Hex = BigInt(steamID64).toString(16).toLowerCase();

  db.query('SELECT * FROM users WHERE steam_id = ?', [steamID64Hex], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error.html'));
    }

    if (results.length === 0) {
      // Si no tiene personaje, mostrar la página de error
      return res.status(500).sendFile(path.join(__dirname, 'public', 'perfil', 'error', 'error.html'));
    }

    // Si el usuario tiene personaje, servir la página del dashboard
    return res.sendFile(path.join(__dirname, 'public', 'perfil', 'estadisticas', 'estadisticas.html')); // Sirve la página de estadísticas
  });
  
});

app.get('/perfil/getNombre', (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.json({ nombre: "Invitado", avatar: "" });
  }

  const nombreSteam = req.user.displayName || "Invitado";  // Extrae el nombre de Steam
  const avatarSteam = req.user.photos && req.user.photos[0] ? req.user.photos[0].value : "";  // Extrae la URL del avatar
  
  res.json({ nombre: nombreSteam, avatar: avatarSteam });
});

app.get('/user', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const steamID64 = req.user.id;
  const steamID64Hex = BigInt(steamID64).toString(16).toLowerCase();

  db.query('SELECT * FROM users WHERE steam_id = ?', [steamID64Hex], (err, results) => {
    if (err) {
      console.error('Error en la base de datos:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (results.length === 0) {
      return res.status(500).json({ error: 'No tienes personaje' });
    }

    const user = results[0];
    const accounts = user.accounts ? JSON.parse(user.accounts) : {};
    const metadata = user.metadata ? JSON.parse(user.metadata) : {};
    const lastSeenText = user.last_seen ? moment(user.last_seen).fromNow() : 'Nunca'; 

    // Obtener el número de teléfono desde la tabla "phones"
    db.query('SELECT phone_number FROM phones WHERE identifier = ?', [user.identifier], (err, phoneResults) => {
      if (err) {
        console.error('Error obteniendo el número de teléfono:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      const phoneNumber = phoneResults.length > 0 ? phoneResults[0].phone_number : 'No tienes';

      // Obtener la patente del vehículo desde la tabla "owned_vehicles"
      db.query('SELECT plate FROM owned_vehicles WHERE owner = ?', [user.identifier], (err, vehicleResults) => {
        if (err) {
          console.error('Error obteniendo la patente del vehículo:', err);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        const vehiclePlates = vehicleResults.map(vehicle => vehicle.plate);

        // Verificar si el jugador pertenece a una mafia
        let mafiaName = null;
        let mafiaRank = null;
        let mafiaLevel = null;
        let mafiaExpiration = null;
        let mafiaMembers = [];
        let isPlayerMember = false;
        
        // Buscar si el player identifier está en algún mafia
        db.query('SELECT * FROM arg_mafias', (err, mafiaResults) => {
          if (err) {
            console.error('Error obteniendo las mafias:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
          }

          // Recorremos todas las mafias y comprobamos si el identifier está en el campo 'members'
          mafiaResults.forEach(mafia => {
            const mafiaData = JSON.parse(mafia.metadata);
            if (mafiaData.members && mafiaData.members[user.identifier]) {
              mafiaName = mafia.name;
              mafiaRank = mafiaData.members[user.identifier].rank;
              mafiaLevel = mafia.level;
              mafiaExpiration = mafia.expiration_date;
              mafiaMembers = Object.keys(mafiaData.members).map(memberId => ({
                name: mafiaData.members[memberId].name,
                rank: mafiaData.members[memberId].rank,
                isPlayer: memberId === user.identifier // Verifica si el miembro es el jugador actual
              }));
              isPlayerMember = true;
            }
          });

          res.json({
            name: req.user.displayName,
            steamID64: steamID64,
            avatar: req.user.photos[0].value,
            mugshot_url: user.mugshot_url,
            firstname: user.firstname,
            lastname: user.lastname,
            money: accounts.money || 0,
            bank: accounts.bank || 0,
            argcoins: accounts.argcoins || 0,
            health: metadata.health || 0,
            armor: metadata.armor || 0,
            job: user.job,
            position: user.position,
            dateofbirth: user.dateofbirth,
            sex: user.sex,
            height: user.height,
            trabajonombre: user.trabajo_nombre,
            trabajogrado: user.trabajo_grado,
            deaths: user.deaths,
            kills: user.kills,
            kdr: user.kdr,
            last_seen: lastSeenText,
            inventory: user.inventory ? JSON.parse(user.inventory) : [],
            phone_number: phoneNumber,
            vehicle_plates: vehiclePlates,
            mafia_name: mafiaName,  // Nombre de la mafia
            mafia_rank: mafiaRank,  // Rango dentro de la mafia
            mafia_level: mafiaLevel,  // Nivel de la mafia
            mafia_expiration: mafiaExpiration,  // Fecha de expiración de la mafia
            mafia_members: mafiaMembers,  // Miembros de la mafia
            is_player_member: isPlayerMember  // Indica si el jugador es parte de la mafia
          });
        });
      });
    });
  });
});

app.get('/server/status', async (req, res) => {
  try {
    const playersResponse = await axios.get(`http://${FIVEM_SERVER_IP}:${FIVEM_SERVER_PORT}/players.json`, { timeout: 2000 });
    const infoResponse = await axios.get(`http://${FIVEM_SERVER_IP}:${FIVEM_SERVER_PORT}/info.json`, { timeout: 2000 });

    const players = playersResponse.data || [];
    const maxPlayers = infoResponse.data.vars.sv_maxClients || 0;

    return res.json({
      online: true,
      players: players.length,
      maxPlayers: maxPlayers
    });

  } catch (error) {
    console.warn('Servidor parece estar offline o no responde.');
    
    return res.json({
      online: false,
      players: 0,
      maxPlayers: 0
    });
  }
});

// Cerrar sesión
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
