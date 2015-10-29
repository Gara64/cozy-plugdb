AppView        = require 'views/app_view'
SharingRuleCollection = require 'collections/sharingRules'

module.exports = Router = Backbone.Router.extend(

    routes:
        ''       : 'main'

    main: ->
        # We create the collection here but do it where it fits the better for
        # your case.
        mainView = new AppView collection: new SharingRuleCollection()
        mainView.render()


)
