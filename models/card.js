const path = require('path')
const fs = require('fs')
const { resolve } = require('path')

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'card.json'
)

class Card {

   static async fetchData() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(p), 'utf-8', (err, content) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(JSON.parse(content))
                    }
                })
        }
        )
    }

   static async add(course) {
        const card = await Card.fetchData()
        const ind = card.courses.findIndex(el => el.id === course.id)
        const credentials = card.courses[ind]

        if (credentials) {
            card.courses[ind].count++
        } else {
            course.count = 1
            card.courses.push(course)
        }

        card.price += +course.price

        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(p), JSON.stringify(card), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    static async remove(id) {
        const card = await Card.fetchData()
        const idx = card.courses.findIndex(el => el.id = id)
        const course = card.courses[idx]

        if (course.count === 1) {
            card.courses = card.courses.filter(el => el.id !== id)
        } else {
            card.courses[idx].count--
        }

        card.price -= course.price
        
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(p), JSON.stringify(card), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(card)
                }
            })
        })
    }
}

module.exports = Card