path = require 'path'
americano = require 'americano'


config =
    common:
        set:
            'views': path.resolve __dirname, '../client'

        engine:
            js: (path, locales, callback) ->
                callback null, require(path)(locales)

        use: [
            americano.bodyParser()
            americano.methodOverride()
            americano.errorHandler
                dumpExceptions: true
                showStack: true
            americano.static path.join __dirname, '..', 'client', 'public'
        ]


    development: [
        americano.logger 'dev'
    ]

    production: [
        americano.logger 'short'
    ],
    plugins: [
        'cozydb'
  ]



module.exports = config
