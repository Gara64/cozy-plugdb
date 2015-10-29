
module.exports = SharingRuleView = Backbone.View.extend

    #className: 'sharingRule'
    template: require '../templates/sharingRule'
    tagName: 'div'

    render: ->
        ###
        @collection.forEach (model) =>

            html += @renderOne model

        html += '</table>'
        @$el.html(html)
        ###

        @$el.html @template sharingRule: @model.toJSON()
        console.log 'collection sharing rule: ' +  JSON.stringify @model


    initialize: ->
        #@render()
