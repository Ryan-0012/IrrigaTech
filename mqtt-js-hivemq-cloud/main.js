const express = require('express');
const app = express();
var mqtt = require('mqtt')
const cors = require('cors');

app.use(cors()); // habilita CORS para todas as rotas

var options = {
    host: 'f26643da7ce3450f8b87bdbba7f206ba.s2.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'Ryan-TCC',
    password: 'ryan@123'
}

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
});

// subscribe to topic 'my/test/topic'
client.subscribe('my/test/topic');

// publish message 'Hello' to topic 'my/test/topic'
client.publish('my/test/topic', 'Hello');

// função para enviar um sinal para o ESP-01
function enviarSinalParaESP() {
    client.publish('meu/esp01/topico', 'Sinal para o ESP-01');
}

app.listen(3000, () => {
  console.log('Server started on port 3000');
});