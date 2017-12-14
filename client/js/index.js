
var templates = {}

function templateRender(templateName, context) {
    var template = templates[templateName]

    return template.replace(/{{=([^}]*)}}/g, function (m, $1) {
        return function (str) {
            return eval(str)
        }.call(context, $1)
    })
}


$("[data-template-id]").each(function () {
    let id = $(this).attr("data-template-id")
    let str = this.outerHTML
    templates[id] = str

    $(this).remove()
})

var days = 13
var data = {
    days: [],
    version: 0,
}

var day = new Date()

var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
var dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-');
  };

for (var i = 0; i < days; i++) {
    data.days.push({
        day: day.getDate(),
        month: monthNames[day.getMonth()],
        dayname: dayNames[day.getDay()],
        date: day.yyyymmdd(),
    })

    day.setDate(day.getDate() - 1)
}


$.get("/api/getHabits", function (res) {
    data.habits = res.habits
    data.version = res.version
    data.habits.forEach(function(habit) {
        habit = parseHabit(habit)
    })

    sortHabits(0)
    renderHabits()
    $(".splash").fadeOut(100)
})

setInterval(function() {
    $.post("/api/poll", {version: data.version})
    .done(function (res) {
        if (res.dirty) {
            data.habits = res.habits
            data.version = res.version
            data.habits.forEach(function(habit) {
                habit = parseHabit(habit)
            })
        
            sortHabits(Number($("select#sort-field-select").val()))
            renderHabits()
        }
    })
}, 200)

function parseHabit(habit) {
    habit.days = data.days.map(function(day) {
        return {
            day: day,
            done: habit.dones.indexOf(day.date) > -1
        }
    })

    habit.getScore = function() {
        return habit.days.filter(function(x) {return x.done}).length
    }

    return habit
}

$(document).on("click", ".tracker .habit .title", function() {
    var habit = $(this).closest(".habit").data("habit")
    showEdit(habit)
})

$(document).on("click", ".tracker .habit .day", function() {
    var $habit = $(this).closest(".habit")
    var habit = $habit.data("habit")
    var day = $(this).data("habit-day")

    $.post("/api/toggleHabit/", {
        id: habit.id,
        date: day.day.date,
    })
    .done(function(d) {
        if (!d.succes) {
            console.log(error)
            return
        }
        day.done = d.value
        $habit.replaceWith(renderHabit(habit))
    })
})

$(document).on("submit", "form.add-habit", function(e) {
    var $form = $(this)
    e.preventDefault()

    var formdata = $form.serializeArray().reduce(function (obj, x) {
        obj[x.name] = x.value
        return obj
    }, {})

    $.post("api/addHabit", formdata)
        .done(function(d) {
            if (d.succes) {
                var habit = parseHabit(d.habit)
                data.habits.push(habit)
                renderHabits()
            } else {
                console.log(d.error)
            }
        })
    $form.trigger("reset")
    console.log(formdata)
})

$(document).on("click", ".edit-habit button.remove", function(e) {
    var $form = $(this).closest("form")
    var habit = $form.data("selected-habit")
    e.preventDefault()
    e.stopImmediatePropagation()

    $.post("/api/deleteHabit", {id: habit.id})
    .done(function(d) {
        if (d.succes) {
            deleteHabit(habit.id)
            renderHabits()
        } else {
            console.log(d.error)
        }
    })

    $form.remove()
})

$(document).on("change", "select#sort-field-select", function(e) {
    var val = $(this).val()
    sortHabits(Number(val))
    renderHabits()
})

$(document).on("submit", "form.edit-habit", function(e) {
    var $form = $(this)
    var habit = $form.data("selected-habit")
    e.preventDefault()
    e.preventDefault()
    e.stopImmediatePropagation()

    var formdata = $form.serializeArray().reduce(function (obj, x) {
        obj[x.name] = x.value
        return obj
    }, {})
    formdata.id = habit.id

    $.post("api/updateHabit", formdata)
        .done(function(d) {
            if (d.succes) {
                habit.title = formdata.title
                renderHabits()
            } else {
                console.log(d.error)
            }
        })
})

function sortHabits(sortType) {
    var self = this
    data.habits = data.habits.sort(function(a, b) {
        switch (sortType) {
            case 0:
                var textA = a.title.toUpperCase()
                var textB = b.title.toUpperCase()
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                break;
            case 1:
                return b.getScore() - a.getScore()
                break;
            case 2:
                return a.getScore() - b.getScore()
                break;
            default:
                return 0
                break;
        }
    })
}

function renderHabits() {
    var $base = $(".header .days")
    $base.empty()

    data.days.filter(Boolean).reverse().forEach(function(day) {
        $base.append(templateRender("habit-day-header", day))
    })

    $base = $(".tracker .habits")
    $base.empty()

    data.habits.forEach(function(habit) {
        $base.append(renderHabit(habit))
    })
}

function renderHabit(habit) {
    var $html = $(templateRender("habit", habit))
    $html.data("habit", habit)
    var $container = $html.find(".days")

    habit.days.forEach(function(day) {
        var $day = $(templateRender("habit-day", day))
        $day.data("habit-day", day)
        $container.append($day)
    })

    return $html
}

function showEdit(habit) {
    $(".edit-habit-container").html(
        $(templateRender("edit-habit-form", habit)).data("selected-habit", habit)
    )
    console.log(habit)
}

function deleteHabit(id) {
    data.habits.forEach((h, i) => {
        if (h.id == id) {
            data.habits.splice(i, 1)
            return true
        }
    })

    return false
}
