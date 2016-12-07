$(function () {

    // Custom JS

    new WOW().init();

    $(".menu .submenu").on("click", function (e) {

        var $this = $(e.target);
        var size = $this.index(),
            level = $this.parent().parent().index(),
            game = $this.parent().parent().parent().data('game'),
            menu = $this.parent().parent().parent();

        menu.removeClass("active");

        clearInterval(timer.timer);
        clearInterval(timer.timer_);

        switch (game) {
            case 'pairs':
                return pairs(level, size);
                break;
            case 'chains':
                return chains(level, size);
                break;
            case 'maths':
                return maths(level, size, e);
                break;
        }


    });

    $("section").each(function (i, e) {
        var mc = new Hammer(e),
            $section = $(e);
        mc.on("panright panleft", function (e) {
            var $menu = $section.find(".menu");
            if (e.type == 'panright') {
                $menu.addClass("active");
            } else {
                $menu.removeClass("active");
            }
        });
    });

    $(".open").click(function (e) {
        $(".stats").addClass('active');
        $(".blured").fadeIn();
        google.charts.load('current', {'packages':['corechart', 'line']});
        google.charts.setOnLoadCallback(drawChart);
    });
    $(".close").click(function (e) {
        $(".stats").removeClass('active');
        $(".blured").fadeOut();
    });

    ga('create', 'UA-62655744-2');
    var userId = 'USER-' + Math.random();
    if (!!$.cookie('userId')) {
        userId = $.cookie('userId');
    } else {
        $.cookie('userId', userId);
    }
    ga('set', 'userId', userId);
    ga('send', 'pageview');
});

Number.prototype.pad = function (w, r, z) {
    z = z || '0';
    r = r || 10;
    var n = parseInt(this).toString(r) + '';
    return n.length >= w ? n : new Array(w - n.length + 1).join(z) + n;
};
Number.prototype.toHHMMSS = function () {
    var seconds = Math.floor(this),
        hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
};
Number.prototype.toMMSS = function () {
    var seconds = Math.floor(this),
        hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return minutes + ':' + seconds;
};

var pairs = function (ilevel, isize) {
        var level = [12, 10, 8, 6, 2][ilevel],
            maxerrors = [5, 8, 10, 15, 20][isize],
            size = [4, 6, 8, 10, 12][isize],
            field = $("#pairs").find(".field"),
            icons = [],
            last = 0,
            scores = 0,
            errors = 0;

        dataLayer.push({
            'event': 'start',
            'game': 'Pairs',
            'level': 'Level ' + ilevel,
            'mode': 'Mode ' + isize
        });

        timer.seconds = 0;
        timer.seconds_ = level / 1000;
        timer.timer = setInterval(function () {
            timer.seconds++;
        }, 1000);
        timer.timer_ = setInterval(function () {
            timer.seconds_--;
        }, 1000);

        field.empty();
        for (var i = 0; i < Math.pow(size, 2) / 2; i++) {
            icons.push(fa_icons[i]);
        }
        icons = icons.concat(icons);
        icons = shuffle(icons);

        for (var i = 0, c = 0; i < Math.pow(size, 2) / size; i++) {
            field.append('<div class="row">');
            for (var j = 0; j < size; j++, c++) {
                field
                    .find(".row:last-child")
                    .append('<label class="cell" for="check' + c + '"><input type="checkbox" id="check' + c + '" disabled="disabled"><i class="icon-b">' + icons[c])
                    .find(".cell:last-child input").on('click', function (e) {
                        var cell = $(this);
                        if (!last) {
                            last = cell;
                        } else {
                            if (cell.data('ctrl') != last.data('ctrl')) {
                                if (cell.data('val') == last.data('val')) {
                                    scores++;
                                    cell.prop('disabled', true).parent().addClass('success');
                                    last.prop('disabled', true).parent().addClass('success');
                                    last = 0;
                                    if (!field.find('input:not(:checked)').length) {
                                        dataLayer.push({
                                            'event': 'end',
                                            'game': 'Pairs',
                                            'level': 'Level ' + ilevel,
                                            'mode': 'Mode ' + isize,
                                            'time': timer.seconds,
                                            'scores': scores,
                                            'errors': errors
                                        });
                                        storage.set('game.pairs.' + ilevel + '.' + isize + '.' + Date.now(), {
                                            scores: scores,
                                            errors: errors,
                                            time: timer.seconds
                                        });
                                    }
                                } else {
                                    scores--;
                                    errors++;
                                    setTimeout(function () {
                                        cell.prop('checked', false);
                                        last.prop('checked', false);
                                        last = 0;
                                    }, 300);
                                }
                            }
                        }
                    })
                    .data({
                        val: icons[c],
                        ctrl: c
                    });
            }
        }
        field
            .find(".cell i")
            .animate({
                opacity: 0
            }, level * 1000, "easeInCirc", function (e) {
                field
                    .find(".cell input")
                    .attr('disabled', false);
            });
        return false
    },
    shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    },
    fa_icons = shuffle((function () {
        var res = [];
        for (var i = 59392; i <= 59662; i++) {
            res.push('&#x' + Number(i).pad(3, 16) + ';');
        }
        return res
    })()),
    drawChart = function () {
        var data = [
            ['Date', 'Scores']
        ];
        for (var i = 0; i < 100; i++) {
            data.push([
                '' + (2004 + i), rand(i, 200)
            ]);
        }
        var data = google.visualization.arrayToDataTable(
            data
        );

        var options = {
            title: 'Company Performance',
            curveType: 'function',
            legend: {
                position: 'bottom',
                textStyle: {
                    color: 'white'
                }
            },
            backgroundColor: { fill:'transparent' },
            fontName: 'Cairo'
        };

        var chart = new google.visualization.LineChart(document.getElementById('pairs_chart'));

        chart.draw(data, options);

        var gameData = [
            ['Dimension', 'Value']
        ], time = 0, errors = 0, scores = 0;
        $.each(storage.get('game.pairs'), function (i, e) {
            $.each(e, function (i, e_) {
                $.each(e_, function (i, e__) {
                    time += e__.time;
                    errors += e__.errors;
                    scores += e__.scores;
                });
            });
        });
        gameData.push(['Scores', scores]);
        gameData.push(['Errors', errors]);
        // gameData.push(['Time', time]);
        data = google.visualization.arrayToDataTable(gameData);

        var options = {
            legend: {
                position: 'bottom',
                textStyle: {
                    color: 'white'
                }
            },
            backgroundColor: {
                fill:'transparent'
            },
            fontName: 'Cairo'
        };

        var chart = new google.visualization.PieChart(document.getElementById('pairs_pie'));

        chart.draw(data, options);
    },
    timer = {
        timer: 0,
        seconds: 0,
        timer_: 0,
        seconds_: 0
    },
    rand = function (min, max) {
        var rand = min + Math.random() * (max - min)
        rand = Math.round(rand);
        return rand;
    },
    storage = $.localStorage;
