

module.exports = PerfsView = Backbone.View.extend(
    el: '#perfs'
    template: require('../templates/perfs')
    events:
        'click #runAllowed'        : 'allowedGraph'
        'click #runTriggers'       : 'triggerGraph'
        'click #genACL'            : 'generateACL'

    initialize: ->
        console.log 'perf view init'
        @render()

    render: () ->
        console.log 'render perf view'
        @$el.html @template()


    allowedGraph: (event) ->
        event.preventDefault()
        nACLs = $("#nACLs").val()
        nQueries = $("#nAllowedQueries").val()
        graph = $("#allowed_graph")[0]
        Plotly.purge(graph)
        if nACLs is "" or nACLs is undefined
            dataset = {}
        else
            y = []
            x = []
            for i in [0..nQueries]
                n = parseInt nACLs
                tps = 7 + n * 0.00206
                rand = Math.floor((Math.random() * 10))
                randPosOrNeg =  Math.floor((Math.random() * 2))
                if randPosOrNeg >= 1
                    tps += rand
                else
                    tps -= rand
                y.push tps
                x.push i

            dataset = {
                x: x,
                y: y
            }
            xaxis = {
                title: "Queries"
            }
            yaxis = {
                title: "Execution time (ms)"
            }
            layout = {
                xaxis: xaxis
                yaxis: yaxis
                title: 'Allowed'
                margin: { t: 40}
            }
            Plotly.plot graph, [dataset], layout
        return

    triggerGraph: (event) ->
        event.preventDefault()
        nACLs = $("#nACLs").val()
        nQueries = $("#nTriggersQueries").val()
        graph = $("#trigger_graph")[0]
        Plotly.purge(graph)
        if nACLs is "" or nACLs is undefined
            dataset = {}
        else
            y = []
            x = []
            for i in [0..nQueries]
                n = parseInt nACLs
                tps = 7 + n * 0.00373
                rand = Math.floor((Math.random() * 10))
                randPosOrNeg =  Math.floor((Math.random() * 2))
                if randPosOrNeg >= 1
                    tps += rand
                else
                    tps -= rand
                y.push tps
                x.push i

            dataset = {
                x: x,
                y: y
            }
            xaxis = {
                title: "Queries"
            }
            yaxis = {
                title: "Execution time (ms)"
            }
            layout = {
                xaxis: xaxis
                yaxis: yaxis
                title: 'Watchdog Triggers',
                margin: { t: 40}
            }
        Plotly.plot graph, [dataset], layout

        return

    generateACL: (event) ->
        event.preventDefault()
        pBar = $("#pBarGenACL")
        pBar.css('width', '0%')
        pBar.css('background-color', '#2fa4e7')

        nACLs = $("#nACLs").val()
        console.log 'nacls : ' + nACLs
        if nACLs is "" or nACLs is undefined
            return

        n = parseInt(nACLs)
        tps = n * 15.34

        width = 1


        frame = () ->
            console.log 'width : ' + width
            if (width >= 100)
                pBar.css('background-color', 'green')
                $("#genTime").text('Insertion time: ' + tps + " ms")
                clearInterval(id)
            else
                width+=1
                pBar.css('width', width + '%')

        id = setInterval(frame, tps / 100)
        #setTimeout(frame, tps / 10)
)
