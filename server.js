const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL con pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'InvitaFigus API is running!' });
});

// Crear invitación
app.post('/api/invitations', async (req, res) => {
  try {
    const { name, age, team, playerName, eventDate, eventTime, eventLocation, parentPhone, paid } = req.body;
    
    const result = await pool.query(
      `INSERT INTO invitations 
       (name, age, team, player_name, event_date, event_time, event_location, parent_phone, paid, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING *`,
      [name, age, team, playerName, eventDate, eventTime, eventLocation, parentPhone, paid || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ error: 'Error creating invitation' });
  }
});

// Obtener todas las invitaciones
app.get('/api/invitations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invitations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Error fetching invitations' });
  });
});

// Obtener una invitación por ID
app.get('/api/invitations/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invitations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ error: 'Error fetching invitation' });
  }
});

// Crear tabla si no existe
async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        team VARCHAR(255),
        player_name VARCHAR(255),
        event_date VARCHAR(50),
        event_time VARCHAR(50),
        event_location VARCHAR(500),
        parent_phone VARCHAR(50),
        paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table ready');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createTable();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});