`use strict`
const express = require('express')
const bodyParser = require('body-parser')
const moment = require('moment')
const Habit = require('./habit')
let data = require('./data.json')
let app = new express()

app.use(bodyParser.json())
app.use(express.static("client"))

app.get("/api/getHabits", (req, res) => {
    res.send(getAllHabits())
})

app.post("/api/addHabit", (req, res) => {
    let id = ++data.idCount
    let body = req.body
    let habit = new Habit()

    if (body && body.title && body.frequency) {
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

    res.send({
        "error": null,
        succes: true,
    })
})

app.post("/api/updateHabit/:id", (req, res) => {
    let habit = getHabit(req.params.id)

    if (!habit) {
        res.send({
            "error": "habit does not exist",
            succes: false,
        })

        return
    }

    habit.fillProperties(req.body)

    res.send({
        "error": null,
        succes: true,
    })
})

app.get("/api/deleteHabit/:id", (req, res) => {
    let succes = deleteHabit(req.params.id)

    if (!succes) {
        res.send({
            "error": "habit does not exist",
            succes: false,
        })

        return
    }

    res.send({
        "error": null,
        succes: true,
    })
})

app.listen(8000, () => {
    console.log("server running on port 8080")
})

function getAllHabits() {
    let habits = []
    
    data.habits.forEach(x => {
        let h = new Habit()
        h.fillProperties(x)
        habits.push(h)
    })

    return habits
}

function getHabit(id) {
    data.habits.forEach(x => {
        let h = new Habit()
        h.fillProperties(x)

        if (h.id == id) {
            return h
        }
    })

    return null
}


function deleteHabit(id) {
    data.habits.forEach((x, i) => {
        let h = new Habit()
        h.fillProperties(x)

        if (h.id == id) {
            data.habits.splice(i, 1)
            return true
        }
    })

    return false
}