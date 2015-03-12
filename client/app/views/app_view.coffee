Plug = require('../models/plug')

#var Device = require('../models/device');
module.exports = AppView = Backbone.View.extend(
    el: 'body'
    template: require('../templates/home')
    events:
        'click #registerDevice': 'registerDevice'
        'click #insertDocs': 'createDocs'
        'click #replicateContacts': 'replicate'
        'click #replicatePhotos': 'replicate'
        'click #cancel': 'cancelReplications'

    render: ->
        model = @model
        @$el.html @template(status: model.get('status'))

        # myCollection = new ContactCollection()
        # myCollection.fetch()

        # realtimer = new ContactListener()
        # realtimer.watch myCollection

        # en supposant qu'il y ait un element d'id myList dans le html

        # view = new ContactListView
        #    el: '#myList'
        #    collection: myCollection

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
        plug.set nDocs: @$el.find('input[name="nDocs"]').val()
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

    initialize: ->
        @listenTo @collection, @render

    renderOne: (model) =>
        """
            <tr>
                <td>#{model.get('name')}</td>
                <td>#{model.get('notes')}</td>
            <tr>
        """

    render: =>
        html = '<table>'
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
