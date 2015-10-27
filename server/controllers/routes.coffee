# See documentation on https://github.com/frankrousseau/americano#routes

auth = require './authentication'


module.exports =

    'plug/authenticate':
        post: auth.fingerprint
