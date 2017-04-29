Contact = require '../models/contact'

class ContactListener extends CozySocketListener
    models:
        'contact': Contact,
    events: [
        'contact.create'
        'contact.update'
        'contact.delete'
    ]
    onRemoteCreate: (model) ->
        console.log 'create contact'
        @collection.add model
    onRemoteUpdate: (model) ->
        console.log 'update contact'
        console.log 'collection listened : ', @collection
    onRemoteDelete: (model) ->
        console.log 'remove contact'
        @collection.remove model


module.exports = ContactView = Backbone.View.extend(
    el: '#myList'
    events :
        "change" : "onChange"

    onChange : (e) ->
        console.log 'target : ', e.target
        e.preventDefault()
        if e.target.type == "checkbox"
            model = @collection.get(e.target.id)
            model.save({shared : !model.get('shared')}, {wait:true})
        else
            @handleInputChange(e.target)


    handleInputChange : (elt)->
        console.log "handleInputChange !"
        parent = elt.parentElement.parentElement
        firstName = parent.children[0].children[0].value
        lastName  = parent.children[1].children[0].value
        note      = parent.children[2].children[0].value
        data =
            n    : lastName + ";" + firstName + ";;;"
            fn   : firstName + " " + lastName
            note : note
        model = @collection.get(parent.id)
        model.save(data, {wait:true})


    initialize: ->
        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render

        realtimer = new ContactListener()
        realtimer.watch @collection

        # @el.addEventListener('blur',@onBlur)

    renderOne: (model) ->
        #console.log  model.get('shared')
        checked = if model.get('shared') then "checked='checked'" else ''
        n = model.get('n')
        if n
            n = n.split(';')
        else
            n = [model.get('fn'),'']
        #console.log n
        id = model.get('id')
        """
            <tr class='contac-row' id=#{id}>
               <!-- <td role="id">#{id}</td> -->
                <td role="fn"><input value="#{n[1]}"></input></td>
                <td role="ln"><input value="#{n[0]}"></input></td>
                <td role="pn"><input value="#{model.get('note')}"></input></td>
                <td><input type="checkbox" id="#{id}" #{checked}></td>
            </tr>
        """

    render: ->
        html =
        """
            <table>
            <thead>
            <tr class="titles">
               <!-- <td>ID</td> -->
                <td role="ln">Last name</td>
                <td role="fn">First name</td>
                <td role="pn">Note</td>
                <td>Shared</td>
            </tr>
            </thead>
        """
        @collection.forEach (model) =>
            html += @renderOne model

        html += '</table>'
        @$el.html(html)
)
