`use strict`
const express = require('express')
let data = require('./data.json')
let app = new express()

app.use(express.static("client"))

app.get("/api/getData", (req, res) => {
    res.send(data)
})

app.listen(8080, () => {
    console.log("server running on port 8080")
})