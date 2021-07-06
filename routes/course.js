const {Router} = require('express')
const courseModel = require('../models/courses')
const auth = require('../middleware/auth')
const { validationResult } = require('express-validator')
const { courseValidators } = require('../utils/validators')

const router = Router()

function isOwner(course, req) {
    return course.userId._id.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
    try {
        const courses = await courseModel
            .find()
            .lean()
            .populate('userId', 'email name')
            .select('title price img')
            
        res.render('courses', {
            title: 'Courses',
            isCourse: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id', async (req, res) => {
   try {
       const course = await courseModel.findById(req.params.id).lean()

       res.render('course', {
           layout: 'empty',
           title: `Course: ${course.title}`,
           course
       })
   } catch (e) {
       console.log(e)
   }
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
       return res.redirect('/')
    }
    try {
        const course = await courseModel.findById(req.params.id).lean()

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        res.render('editcourse', {
            title: `Edit course ${course.title}`,
            errors: req.flash('editError'),
            course
        })   
    } catch (e) {
        console.log(e)
    }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const { id }  = req.body
    delete req.body.id

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('editError', errors.array()[0].msg)
        return res.redirect(`/courses/${id}/edit?allow=true`)
    }

    try {
        // await courseModel.findByIdAndUpdate(id, req.body)
        const course = await courseModel.findById(id)
        
        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        Object.assign(course, req.body)
        await course.save()

        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }    
})

router.post('/delete', auth, async (req, res) => {
    try {
        await courseModel.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }
})

module.exports = router