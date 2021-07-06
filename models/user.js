const {Schema, model} = require('mongoose')

const user = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: String,
    resetToken: String,
    resetTokenExp: Date,
    card: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true
                }
            }
        ]
    }
})

user.methods.addToCard = function(course) {
    const items = [...this.card.items]
    const idx = items.findIndex(el => el.courseId.toString() === course._id.toString())

    if (idx >= 0) {
        items[idx].count++
    } else {
        items.push({count: 1, courseId: course._id})
    }

    this.card = {items}

    return this.save()
}

user.methods.removeCard = function(id) {
    let items = [...this.card.items]
    const idx = items.findIndex(el => el.courseId.toString() === id.toString())

    if (items[idx].count === 1) {
        items = items.filter(el => el.courseId.toString() !== id.toString())
    } else {
        items[idx].count--
    }

    this.card = {items}

    return this.save()
}

user.methods.removeData = function() {
    this.card = {items: []}

    return this.save()
}

module.exports = model('User', user)