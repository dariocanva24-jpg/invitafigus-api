require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'InvitaFigus API is running!' });
});

// Crear invitación
app.post('/api/invitations', async (req, res) => {
  try {
    const data = req.body;
    const invitation = await prisma.invitation.create({
      data: {
        ...data,
        slug: data.slug || `${data.childName?.toLowerCase().replace(/\s+/g, '-')}-${data.age}-${data.team?.toLowerCase().replace(/\s+/g, '-')}`,
      },
    });
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener invitación por slug
app.get('/api/invitations/:slug', async (req, res) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { slug: req.params.slug },
      include: { rsvps: true },
    });
    if (!invitation) return res.status(404).json({ error: 'Not found' });
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar RSVP
app.post('/api/invitations/:id/rsvp', async (req, res) => {
  try {
    const rsvp = await prisma.rSVP.create({
      data: {
        ...req.body,
        invitationId: req.params.id,
      },
    });
    res.json(rsvp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Incrementar views
app.post('/api/invitations/:id/view', async (req, res) => {
  try {
    await prisma.invitation.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activar invitación
app.post('/api/invitations/:id/activate', async (req, res) => {
  try {
    const invitation = await prisma.invitation.update({
      where: { id: req.params.id },
      data: { status: 'active' },
    });
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});