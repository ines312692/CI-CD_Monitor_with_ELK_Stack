const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const LOGSTASH_URL = `http://${process.env.LOGSTASH_HOST}:${process.env.LOGSTASH_PORT}`;

// Endpoint pour recevoir les logs de GitHub Actions
app.post('/webhook', async (req, res) => {
  try {
    const logData = req.body;

    console.log(' Log reçu de GitHub Actions:', {
      workflow: logData.workflow_name,
      status: logData.conclusion,
      repo: logData.repository
    });

    // Envoyer vers Logstash
    await axios.post(LOGSTASH_URL, logData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(' Log envoyé à Logstash');
    res.status(200).json({ message: 'Log reçu et traité' });

  } catch (error) {
    console.error(' Erreur:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'github-actions-webhook' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook receiver démarré sur le port ${PORT}`);
  console.log(`📡 Prêt à recevoir les logs GitHub Actions`);
});