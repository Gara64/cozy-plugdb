var americano = require('americano');

var port = process.env.PORT || 9999;
americano.start({name: 'plug', port: port}, function(app) {
    app.set('views', __dirname + '/client');
    app.engine('.html', require('jade').__express);
});
