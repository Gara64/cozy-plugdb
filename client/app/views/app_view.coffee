Plug = require('../models/plug')

#var Device = require('../models/device');
module.exports = AppView = Backbone.View.extend(
    el: 'body'
    template: require('../templates/home')
    events:
        'click #registerDevice'    : 'registerDevice'
        'click #insertDocs'        : 'createDocs'
        'click #replicateContacts' : 'replicate'
        'click #replicatePhotos'   : 'replicate'
        'click #cancel'            : 'cancelReplications'

    render: ->
        model = @model
        @$el.html @template(status: model.get('status'))

        myCollection = new ContactCollection()
        myCollection.fetch(reset:true)

        realtimer = new ContactListener()
        realtimer.watch myCollection

        # en supposant qu'il y ait un element d'id myList dans le html

        view = new ContactListView
           el         : '#myList'
           collection : myCollection

        this

    updateStatus: ->
        #this.$el.find('')
        return

    replicate: (event) ->
        event.preventDefault()
        plug = @model
        dataType = $(event.currentTarget).data('datatype')
        plug.set dataType: dataType
        plug.replicate (res) ->
            plug.set status: res
            return
        return

    cancelReplications: (event) ->
        event.preventDefault()
        plug = @model
        plug.cancelReplications (res) ->
            plug.set status: res
            return
        return

    registerDevice: (event) ->
        event.preventDefault()
        plug = @model
        plug.set target: @$el.find('input[name="targetURL"]').val()
        plug.register (res) ->
            plug.set status: res
            return
        return

    createDocs: (event) ->
        event.preventDefault()
        plug = @model
        plug.set nDocs   : @$el.find('input[name="nDocs"]').val()
        plug.set baseName: @$el.find('input[name="baseName"]').val()
        plug.generate (res) ->
            plug.set status: res
            return
        return

    # initialize is automatically called once after the view is constructed
    initialize: ->
        #this.listenTo(this.collection, "insert", this.onInsertPlug);
        @model.on 'change:status', @render, this
        return

    onInsertPlug: (model) ->
        # re-render the view
        @render()
        return
)



class Contact extends Backbone.Model


class ContactCollection extends Backbone.Collection
    model : Contact
    url   : 'contacts'


class ContactListener extends CozySocketListener
    models:
        'contact': Contact
    events: [
        'contact.create'
        'contact.update'
        'contact.delete'
    ]
    onRemoteCreate: (model) ->
        @collection.add model
    onRemoteDelete: (model) ->
        @collection.remove model


class ContactListView extends Backbone.View

    events :
        "change" : "onChange"


    onChange : (e) ->
        console.log e.target
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
            fn   : firstName #+ " " + lastName
            note : note
        model = @collection.get(parent.id)
        model.save(data, {wait:true})


    initialize: ->
        @listenTo @collection, 'change', @render
        @listenTo @collection, 'add'   , @render
        @listenTo @collection, 'remove', @render
        @listenTo @collection, 'reset' , @render
        console.log @el
        # @el.addEventListener('blur',@onBlur)

    renderOne: (model) =>
        console.log  model.get('shared')
        checked = if model.get('shared') then "checked='checked'" else ''
        n = model.get('n')
        if n
            n = n.split(';')
        else
            n = [model.get('fn'),'']
        console.log n
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

    render: =>
        html =
        """
            <table>
            <thead>
            <tr class="titles">
               <!-- <td>ID</td> -->
                <td role="fn">First name</td>
                <td role="ln">Last name</td>
                <td role="pn">Note</td>
                <td>Shared</td>
            </tr>
            </thead>
        """
        @collection.forEach (model) =>
            html += @renderOne model

        html += '</table>'
        @$el.html(html)







# /*
#         event.preventDefault();
#         var model = this.model;
#         model.urlRoot = 'plug/replicate/true';
#         model.save({}, {
#             success: function(model, response) {
#                 _this.model.set({status: "Sharing ok !"});
#                 _this.render();
#             },
#             error: function(model, response) {
#                 var rep = JSON.parse(response.responseText);
#                 _this.model.set({status: rep.error});
#                 _this.render();
#             }
#         });
#     },

#     cancelReplications: function(event) {
#         event.preventDefault();
#         var model = this.model;
#         model.urlRoot = 'plug/replicate/false';
#         model.save({}, {
#             success: function(model, response) {
#                 _this.model.set({status: "Cancel replications ok"});
#                 _this.render();
#             },
#             error: function(model, response) {
#                 var rep = JSON.parse(response.responseText);
#                 _this.model.set({status: rep.error});
#                 _this.render();
#             }
#         });
#     },

#     registerDevice: function(event) {
#         event.preventDefault();
#         _this = this;
#         var plug = new Plug({
#             target: this.$el.find('input[name="targetURL"]').val(),
#             password: this.$el.find('input[name="pwd"]').val(),
#             devicename: this.$el.find('input[name="devicename"]').val()
#         })
#         plug.urlRoot = 'plug/register/true';
#         plug.save({}, {
#             success: function(model, response) {
#                 _this.model.set({status: "Device correctly registered"});
#                 _this.render();
#             },
#             error: function(model, response) {
#                 var rep = JSON.parse(response.responseText);
#                 _this.model.set({status: rep.error});
#                 _this.render();
#             }
#         });

#     },

#     unregisterDevice: function(event) {
#         event.preventDefault();
#         _this = this;
#         var plug = new Plug({
#             target: this.$el.find('input[name="targetURL"]').val(),
#             password: this.$el.find('input[name="pwd"]').val(),
#             devicename: this.$el.find('input[name="devicename"]').val()
#         })
#         plug.urlRoot = 'plug/register/false';
#         plug.save({}, {
#             success: function(model, response) {
#                 _this.model.set({status: "Device correctly unregistered"});
#                 _this.render();
#             },
#             error: function(model, response) {
#                 var rep = JSON.parse(response.responseText);
#                 _this.model.set({status: rep.error});
#                 _this.render();
#             }
#         });
#     },

#     createDocs: function(event) {
#         // submit button reload the page, we don't want that
#        event.preventDefault();
#        _this = this;
#         // create a new model
#         var plug = this.model;
#         plug.set({nDocs: this.$el.find('input[name="nDocs"]').val()});
#         plug.urlRoot = 'plug/insert';

#         // add it to the collection
#        //his.collection.add(plug);

#         plug.save({}, {
#             success: function(model, response) {
#                 _this.model.set({status: "Insert " + plug.get('nDocs') + ' docs ok !'});
#                 _this.render();
#             },
#             error: function(model, response) {
#                 var rep = JSON.parse(response.responseText);
#                 _this.model.set({status: rep.error});
#                 _this.render();
#             }
#         });
#     },
# */
