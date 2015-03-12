americano = require('americano')
Realtimer = require('cozy-realtime-adapter')

port = process.env.PORT || 9999

americano.start {name: 'plug', port: port}, (app, server) ->
    app.set('views', __dirname + '/client')
    app.engine( '.html', require('jade').__express )

    # start contact watch to upadte UI when new contact are added
    # or modified
    realtime = Realtimer server, ['contact.*']
    # callback? null, app, server
