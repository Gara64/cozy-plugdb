SharingRule = require '../models/sharingRule'

module.exports = class SharingRuleCollection extends Backbone.Collection

    # Model that will be contained inside the collection.
    model: SharingRule

    # This is where ajax requests the backend.
    url: 'sharingrule'
