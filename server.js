var americano = require('americano');

var port = process.env.PORT || 9999;
americano.start({name: 'template', port: port});
