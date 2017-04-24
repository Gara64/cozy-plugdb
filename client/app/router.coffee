AppView        = require('views/app_view')
PlugCollection = require('collections/plugs')
PlugModel      = require('models/plug')
plugs          = new PlugCollection
plug           = new PlugModel


module.exports = Router = Backbone.Router.extend(

    routes:
        ''       : 'main'
        'insert' : 'insertPlug'

    main: ()->
        mainView = new AppView(model: plug)
        mainView.render()
        return

    insertPlug: ()->
        # alert('toto')
        return

)
