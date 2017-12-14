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

function Habit(id, name, type, frequency, stats) {
    this.id = id || -1
    this.name = name || ""
    this.type = type || false
    this.frequency = frequency || "daily"
    this.stats = stats || {}

    this.dates = []
}

Habit.prototype.addDateEvent = function(date, value) {
    this.dates.push(new DateEvent(date, value))
}

Habit.prototype.getScore = function() {
    var score = 0

    for (var key in this.dates) {
        var date = this.dates[key]
        if (date.done) {
            score++
        }
    }

    return score
}

function parseHabit(data) {
    var habit = new Habit(data.id, data.name, data.type, data.frequency, data.stats)
    
    for (var key in data.dates) {
        habit.addDateEvent(key, data.dates[key])
    }

    return habit
}

function DateEvent(date, value) {
    this.date = date
    this.done = value || false
}

function isNullForm(data, keys) {
    for (var index in keys) {
        var key = keys[index]
        if (!data[key] || data[key] == "") {
            return true
        }
    }

    return false
}

function clearForm(data) {
    for (var index in data) {
        data[index] = ""
    }

    return false
}

var app = new Vue({
    el: "#app",
    data: {
        habits: [],
        forms: {
            addForm: {
                showForm: "",
                text: "",
                type: "",
                frequency: "",
                error: "",
            },

            sortType: "0",

            editHabit: {
                habit: null,
                showForm: "",
            }
        }
    },

    methods: {
        addHabit() {
            if (isNullForm(this.forms.addForm, ["text", "frequency", "type"])) {
                this.forms.addForm.error = "Please fill all values"
                return
            }

            // server-side imitiation currently
            this.habits.push(new Habit(
                this.forms.addForm.text + "-" + this.forms.addForm.type, 
                this.forms.addForm.text,
                this.forms.addForm.type,
                this.forms.addForm.frequency,
                {
                    streak: 0,
                    bestStreak: 0,
                    completions: 0,
                },
            ))

            this.sort()

            clearForm(this.forms.addForm)
        },

        sort() {
            var self = this
            var sortType = Number(this.forms.sortType)
            this.habits = this.habits.sort(function(a, b) {
                switch (sortType) {
                    case 0:
                        var textA = a.name.toUpperCase()
                        var textB = b.name.toUpperCase()
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
        },

        removeHabit(id) {
            for (var key in this.habits) {
                if (this.habits[key].id == id) {
                    this.habits.splice(key, 1)
                    return
                }
            }
        },

        editHabit(habit) {
            this.forms.editHabit.habit = habit
            this.forms.editHabit.showForm = "true"
        },

        toggleDate(date) {
            date.done = !date.done
            this.sort()
        }
    },

    mounted() {
        for (var x in serverData.habits) {
            var habitData = serverData.habits[x]
            this.habits.push(parseHabit(habitData))
        }
        
        this.sort()
    }
})

