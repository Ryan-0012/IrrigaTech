const { SUBSCRIPTION } = require("./in-memory-db");

exports.addSubscription = (req, res) => {
    const newSubscription = req.body;
  
    // Verificar se o token já está presente na lista
    const isTokenExists = SUBSCRIPTION.some((subscription) => {
      return subscription.keys.auth === newSubscription.keys.auth;
    });
  
    if (isTokenExists) {
      console.log('Token já existe na lista de assinaturas:', newSubscription.keys.auth);
      res.status(400).json({ message: 'Token já existe na lista de assinaturas' });
    } else {
      SUBSCRIPTION.push(newSubscription);
      console.log('Usuário inscrito com sucesso:', newSubscription.keys.auth);
      res.status(200).json({ message: 'Usuário inscrito com sucesso!' });
    }
  };