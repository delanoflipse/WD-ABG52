`use strict`
const express = require('express')
const bodyParser = require('body-parser')
const moment = require('moment')
const Habit = require('./habit')
let data = require('./data.json')
let app = new express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static("client"))

let dataVersion = 0

app.get("/api/getHabits", (req, res) => {
    res.send({
        habits: getAllHabits(),
        version: dataVersion,
    })
})

app.post("/api/addHabit", (req, res) => {
    let id = ++data.idCount
    let body = req.body
    let habit = new Habit()
    let frequency = body.frequency || 0

    if (body && body.title) {
        habit.fillProperties(body)
        habit.id = id
    } else {
        res.send({
            error: "not enough information given",
            succes: false,
        })

        return
    }

    data.habits.push(habit)
    dataVersion++

    res.send({
        "error": null,
        succes: true,
        habit: habit
    })
})

app.post("/api/updateHabit", (req, res) => {
    let habit = getHabit(req.body.id)

    if (!habit) {
        res.send({
            "error": "habit does not exist",
            succes: false,
        })

        return
    }

    habit.fillProperties(req.body)
    dataVersion++

    res.send({
        "error": null,
        succes: true,
    })
})

app.post("/api/toggleHabit", (req, res) => {
    let habit = getHabit(Number(req.body.id))
    let date = req.body.date

    if (!habit || !date) {
        res.send({
            "error": "habit does not exist",
            succes: false,
        })

        return
    }
    dataVersion++

    res.send({
        error: null,
        succes: true,
        value: habit.toggleDate(date),
    })
})


app.post("/api/poll", (req, res) => {
    if (req.body && req.body.version && req.body.version != dataVersion) {
        res.send({
            habits: getAllHabits(),
            version: dataVersion,
            dirty: true,
        })
    } else {
        res.send({
            dirty: false,
        })
    }
})

app.post("/api/deleteHabit", (req, res) => {
    let succes = deleteHabit(req.body.id)

    if (!succes) {
        res.send({
            "error": "habit does not exist",
            succes: false,
        })

        return
    }
    dataVersion++

    res.send({
        "error": null,
        succes: true,
    })
})

app.listen(8080, () => {
    console.log("server running on port 8080")
})

data.habits = data.habits.map(x => {
    let h = new Habit()
    h.fillProperties(x)
    return h
})

function getAllHabits() {
    return data.habits
}

function getHabit(id) {
    for (let key in data.habits) {
        let x = data.habits[key]

        if (x.id == id) {
            return x
        }
    }

    return null
}

function deleteHabit(id) {
    for (let key in data.habits) {
        let x = data.habits[key]

        if (x.id == id) {
            data.habits.splice(key, 1)
            return true
        }
    }

    return false
}
