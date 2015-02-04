var americano = require('americano');

var port = process.env.PORT || 9120;
americano.start({name: 'template', port: port}, function(app) {
    app.set('views', __dirname + '/client');
    app.engine('.html', require('jade').__express);
});
