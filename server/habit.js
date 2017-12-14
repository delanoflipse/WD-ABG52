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

    toggleDate(date) {
        let index = this.dones.indexOf(date)
        if (index > -1) {
            this.dones.splice(index, 1)
            return false
        } else {
            this.dones.push(date)
            return true
        }
    }
}

module.exports = Habit
