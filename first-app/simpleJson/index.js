var express = require('express');
var _ = require('lodash');
var router = express.Router();

router.use(express.json());

var aiaaText = require('./aiaa_text');
var now = Date.now();

var annotation = {
    name: "annotation name",
    enabled: true,
    datasource: "generic datasource",
    showLine: true,
}

var annotations = [{
        annotation: annotation,
        "title": "Donlad trump is kinda funny",
        "time": 1450754160000,
        text: "teeext",
        tags: "taaags"
    },
    {
        annotation: annotation,
        "title": "Wow he really won",
        "time": 1450754160000,
        text: "teeext",
        tags: "taaags"
    },
    {
        annotation: annotation,
        "title": "When is the next ",
        "time": 1450754160000,
        text: "teeext",
        tags: "taaags"
    }
];

var tagKeys = [{
    "type": "string",
    "text": "Country"
}];

var countryTagValues = [{
        'text': 'SE'
    },
    {
        'text': 'DE'
    },
    {
        'text': 'US'
    }
];

function fackDataGen() {
    var timeserie = []
    var mapData = {
        "target": "map_01",
        "datapoints": [
            ["0,20,13", 1450754160]
        ]
    }
    timeserie.push(mapData)
    for (var i = 0; i < 50; i++) {
        var series = {
            "target": "upper_" + i,
            "datapoints": []
        };
        var decreaser = 0;
        for (var y = 0; y < 50; y++) {
            series.datapoints[y] = [0, 0]
            series.datapoints[y][0] = Math.round(Math.random() * 100)
            series.datapoints[y][1] = Math.round((now - decreaser) / 1000) * 1000
            decreaser += 50000;
        }
        timeserie.push(series)
    }
    return timeserie
}



function setCORSHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}

router.all('/', function (req, res) {
    setCORSHeaders(res);
    res.send('I have a quest for you!');
    res.end();
});

router.all('/search', function (req, res) {
    setCORSHeaders(res);
    var timeserie = fackDataGen();
    var result = [];
    _.each(timeserie, function (ts) {
        result.push(ts.target);
    });

    res.json(result);
    res.end();
});


router.all('/annotations', function (req, res) {
    setCORSHeaders(res);
    res.json(annotations);
    res.end();
});

router.all('/log', function (req, res) {
    setCORSHeaders(res);
    res.json(annotations);
    res.end();
});

router.all('/star', function (req, res) {
    console.log(req.headers);
    res.json({
        'aaa': 123
    });
    res.end();
})


router.all('/tag[\-]keys', function (req, res) {
    setCORSHeaders(res);
    // console.log(req.url);
    // console.log(req.body);
    res.json(tagKeys);
    res.end();
});

router.all('/tag[\-]values', function (req, res) {
    setCORSHeaders(res);
    if (req.body.key == 'City') {
        res.json(countryTagValues);
    } else if (req.body.key == 'Country') {
        res.json(countryTagValues);
    }
    res.end();
});

router.all('/query', function (req, res) {
    console.log('-----------------------');
    console.log(req.headers);
    setCORSHeaders(res);
    // console.log(req.url);
    // console.log(req.body);

    var tsResult = [];
    // let fakeData = timeserie;
    let fakeData = fackDataGen()

    if (req.body.adhocFilters && req.body.adhocFilters.length > 0) {
        // fakeData = countryTimeseries;
    }

    _.each(req.body.targets, function (target) {
        if (target.type === 'table') {
            const table = {
                target: target.target,
                type: 'table',
                columns: [{
                    text: 'Time',
                    type: 'time'
                }, {
                    text: 'Country',
                    type: 'string'
                }, {
                    text: 'Number',
                    type: 'number'
                }],
                rows: [
                    [1234567, 'SE', 123],
                    [1234567, 'DE', 231],
                    [1234567, 'US', 321],
                ]
            }
            tsResult.push(table);
        } else {
            if (target.target === 'map_01') {
                var mapData = {
                    target: 'map_01',
                    datapoints: []
                }
                var d = new Date();
                var t = d.getTime();
                var sec = d.getSeconds();
                var degree = d.getMinutes() * 6 % 360;
                var seg = 5;
                for (var i = 0; i < seg; i++) {
                    var theta = 2 * Math.PI / seg * ((i + sec) % seg);
                    mapData.datapoints.push([30 * Math.sin(theta) + "," + 30 * Math.cos(theta) + "," + degree + "," + 30 * Math.random(), Number(t + i * 1000)])
                }
                tsResult.push(mapData)
            } else {
                var k = _.filter(fakeData, function (t) {
                    return t.target === target.target;
                });

                _.each(k, function (kk) {
                    tsResult.push(kk)
                });
            }
        }
    });
    res.json(tsResult);
    res.end();
});

router.all('/aiaa', function (req, res) {
    setCORSHeaders(res);
    // console.log(req.url);
    // console.log(req.body);

    res.json(aiaaText);
    res.end();
});

module.exports = router;