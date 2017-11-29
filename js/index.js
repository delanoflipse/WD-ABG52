var serverData = {
    "habits" : [
        {
            id: 1,
            name: "Go swimming",
            type: "good",
            frequency: "daily",
            dates: {
                "26/11/2017": false,
                "27/11/2017": true,
                "28/11/2017": true,
                "29/11/2017": false,
                "30/11/2017": false,
            },
            stats: {
                streak: 2,
                bestStreak: 6,
                completions: 3,
            },
        },

        {
            id: 2,
            name: "Go running",
            type: "good",
            frequency: "weekly",
            dates: {
                "14/11/2017": false,
                "21/11/2017": true,
                "28/11/2017": true,
                "5/12/2017": true,
                "12/12/2017": false,
            },
            stats: {
                streak: 3,
                bestStreak: 6,
                completions: 3,
            },
        },
    ]
}

var App = {
    habits: [],
}

function Habit(id, name, type, frequency, stats) {
    this.id = id || -1
    this.name = name || ""
    this.goodHabit = type ? type == "good" : true
    this.frequency = frequency || "daily"
    this.stats = stats || {}

    this.dates = []
}

Habit.prototype.addDateEvent = function(date, value) {
    this.dates.push(new DateEvent(date, value))
}

function DateEvent(date, value) {
    this.date = date
    this.done = value || false
}

function parseServerData(data) {
    var habits = data.habits

    for (var x in habits) {
        var habitData = habits[x]
        App.habits.push(parseHabit(habitData))
    }

    console.log(App)
}

function parseHabit(data) {
    var habit = new Habit(data.id, data.name, data.type, data.frequency, data.stats)
    
    for (var key in data.dates) {
        habit.addDateEvent(key, data.dates[key])
    }

    return habit
}

function renderHabits() {
    var $el = $("table.habits tbody")
    $el.empty()

    for (var index in App.habits) {
        var habit = App.habits[index]
        $el.append(renderHabit(habit))
    }
}

function renderHabit(habit) {
    var $base = render.tr().addClass("habit").attr("data-habit-id", habit.id)
    $base.append(render.td(habit.name))
    $base.append(render.td(habit.goodHabit ? "Good habit" : "Bad habit"))
    $base.append(render.td(habit.frequency))

    for (var index in habit.dates) {
        var dateEvent = habit.dates[index]
        $base.append(render.td(dateEvent.date + "(" + (dateEvent.done ? "+" : "-") + ")"))
    }

    $base.append(render.td("streak: " + habit.stats.streak))

    return $base
}

var render = {
    tr() {
        return $("<tr>")
    },

    td(text) {
        return $("<td>").text(text || "")
    },
}

parseServerData(serverData)
renderHabits()
