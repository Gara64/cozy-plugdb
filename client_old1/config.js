exports.config = {
  // See docs at http://brunch.readthedocs.org/en/latest/config.html.
    "files": {
        "javascripts": {
            "defaultExtension": 'js',
            "joinTo": {
                'scripts/app.js': /^app/,
                'scripts/vendor.js': /^vendor/
            },
            "order": {
                "before": [
                  'vendor/javascripts/console-helper.js',
                  'vendor/scripts/jquery-2.0.3.min.js',
                  'vendor/scripts/underscore-1.5.2.min.js',
                  'vendor/scripts/backbone-1.0.0.min.js',
                  'vendor/javascripts/backbone-mediator.js',
                  'vendor/javascripts/bootstrap-3.1.1.min.js'
                ]
            }
        },

        "stylesheets": {
            "defaultExtension": 'styl',
            "joinTo": 'stylesheets/app.css',
            "order": {
                "before": [],
                "after": []
            }
        },
        "templates": {
            "defaultExtension": 'jade',
            "joinTo": 'scripts/app.js'
        }
    }
}
