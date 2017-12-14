class Habit {
    constructor() {
        [
            "id",
            "title",
            "description",
            "creationDate",
            "frequency",
            "dayOfWeek",
            "partOfWeek",
        ].forEach(x => {
            this[x] = null
        })

        this.dones = []
    }

    fillProperties(obj) {
        for (let key in obj) {
            if (typeof this[key] !== "undefined") {
                this[key] = obj[key]
            }
        }
    }
}

module.exports = Habit
