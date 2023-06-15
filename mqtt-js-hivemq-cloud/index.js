const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
const mqtt = require('mqtt');
const axios = require('axios');
const socketIO = require('socket.io');

const { addSubscription } = require('./add-subscription');
const { sendNotification } = require('./send-notification');


const app = express();
app.use(bodyParser.json());
app.use(cors());
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*' // Permita todas as origens para conexões WebSocket (não recomendado em produção)
  }
});
// Configuração do web-push
const vapidKeys = {
  publicKey: 'BCcD4YmsjO0T3vU2vnk368WfKfmxG9ZDfTr0M_q7HwZpY9AZq1JBATucVqp8G3j6Pz-1ybHBfa80YZ97bv0FZGQ',
  privateKey: 'Cxns7MYWanAKsB_kZ12GTddbgJiajgeXH0w-wtW3xg8'
};

webpush.setVapidDetails('http://example.com', vapidKeys.publicKey, vapidKeys.privateKey);

// Conexão MQTT
const mqttHost = 'broker.hivemq.com';
const mqttPort = 1883;
const mqttTopic = 'EndIrrigation';
const mqttTopic2 = 'Status';

const mqttClient = mqtt.connect(`mqtt://${mqttHost}:${mqttPort}`);

mqttClient.on('connect', () => {
  console.log('Conexão com broker MQTT estabelecida com sucesso!');
  mqttClient.subscribe(mqttTopic, (err) => {
    if (err) {
      console.error('Erro ao subscrever ao tópico MQTT:', err);
    } else {
      console.log(`Subscrito ao tópico MQTT: ${mqttTopic}`);
    }
  });
  mqttClient.subscribe(mqttTopic2, (err) => {
    if (err) {
      console.error('Erro ao subscrever ao tópico MQTT:', err);
    } else {
      console.log(`Subscrito ao tópico MQTT: ${mqttTopic2}`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  if (topic === mqttTopic) {
    const receivedMessage = message.toString();
    console.log(`Mensagem recebida no tópico ${mqttTopic}: ${receivedMessage}`);

    // Fazendo o POST para http://localhost:9000/send-notification
    const notificationData = {
      topic: mqttTopic,
      message: receivedMessage
    };

    axios.post('http://localhost:9000/send-notification', notificationData)
      .then(response => {
        console.log('Notificação enviada com sucesso:', response.data);
      })
      .catch(error => {
        console.error('Erro ao enviar notificação:', error);
      });
  }
});

mqttClient.on('message', (topic, message) => {
  if (topic === mqttTopic2) {
    const receivedMessage = message.toString();
    console.log(`Mensagem recebida no tópico ${mqttTopic2}: ${receivedMessage}`);

    // Fazendo o POST para http://localhost:9000/send-notification
    const notificationData = {
      topic: mqttTopic2,
      message: receivedMessage
    };

    io.emit('valorRecebido', message.toString());
    console.log('Mensagem enviada com sucesso para p websocket');
  }
});

// Rotas
app.route('/send-notification').post(sendNotification);
app.route('/add-subscription').post(addSubscription);
app.route('/api/mqtt').post((req, res) => {
  const mqtt = require('mqtt')

  const HOST = 'broker.hivemq.com'
  const PORT = 1883
  const TOPIC = req.body.topic
  const MESSAGE = req.body.message

  const client = mqtt.connect(`mqtt://${HOST}:${PORT}`)

  client.on('connect', () => {
      console.log('Conexão com broker MQTT estabelecida com sucesso!');
    client.publish(TOPIC, MESSAGE, () => {
      client.end()
      res.status(200).json({ message: 'Mensagem enviada com sucesso!' });

    })
  })

  client.on('error', (error) => {
    console.error('Erro ao conectar ao servidor MQTT:', error)
    res.status(500).send('Erro ao conectar ao servidor MQTT')
  })
})

app.route('/api/Status').post((req, res) => {
  const mqtt = require('mqtt')

  const HOST = 'broker.hivemq.com'
  const PORT = 1883
  const TOPIC = req.body.topic
  const MESSAGE = req.body.message

  const client = mqtt.connect(`mqtt://${HOST}:${PORT}`)

  client.on('connect', () => {
      console.log('Conexão com broker MQTT estabelecida com sucesso!');
    client.publish(TOPIC, MESSAGE, () => {
      client.end()
      res.status(200).json({ message: 'Mensagem enviada com sucesso!' });

    })
  })

  client.on('error', (error) => {
    console.error('Erro ao conectar ao servidor MQTT:', error)
    res.status(500).send('Erro ao conectar ao servidor MQTT')
  })
})


console.log(server, " ", io);
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Escute por eventos do cliente
  socket.on('enviar-valor', (valor) => {
    console.log('Valor recebido:', valor);

    // Emita o valor recebido para todos os clientes conectados
    io.emit('valorRecebido', 1000);
  });

  // Lidere com a desconexão do cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = 9000;
server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
