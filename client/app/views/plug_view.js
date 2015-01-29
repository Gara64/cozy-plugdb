// apps/views/plug.js

var View = Backbone.View.extend({
  el: 'body',
  render: function() {
    $(this.el).html(this.template);
    return $(this.el);
  },


template: require('./templates/home'),
events: {
    "click #initPlug": "init",
    "click #closePlug": "close",
    "click #insert": "insert",
    "click #replicate": "replicate"
},

init: function () {
        //$('body').html(application.homeView.render().el);
        alert('test');
    }, 

close: function () {
},

insert: function () {
},

select: function () {
},

share: function () {
}
});


