AppView        = require('views/app_view')
PlugCollection = require('collections/plugs')
DeviceModel    = require('models/device')
PlugModel      = require('models/plug')
plugs          = new PlugCollection
device         = new DeviceModel
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