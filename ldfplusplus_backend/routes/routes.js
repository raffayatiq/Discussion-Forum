// Routing the Requests that come to our server
const crypto = require('crypto');

const express = require('express')
const router = express.Router()
const userprofile = require('../models/userprofile');
const gettogehter = require('../models/gettogether');
const events = require('../models/events');
const jobposting = require('../models/jobposting');
const donations = require('../models/donation');
const fooddelivery = require('../models/fooddelivery');
const instructorreviews = require('../models/instructoreviws');
const coursereviews = require('../models/coursereviews');
const courses =  require('../models/courses');
const discussionportal = require('../models/discussionportal');
const reqadmin = require('../models/reqadmin');
const swaprequest = require('../models/swaprequest');
const marketpalce = require('../models/marketplace');
const sanitize = require('mongo-sanitize');


function isSuperadmin(req, res, next) {
    try  
    {
        userprofile.findById(req.body.user_id, (err,docs) =>{
            if (err){
                res.send({"Error": "Not Super Admin"})
            }
            else{
                if (docs.length <=0)
                {
                    res.send({"Error": "Not Super Admin"})
                }
                if (docs.length ==1 && docs[0].superadmin == true)
                {
                    next()
                } 
            }
        })
    }
    catch{
        res.send({"Error": "Not Super Admin"})
    }
}

function isAdmin(req, res, next) {
    try  
    {
        userprofile.findById(req.body.user_id, (err,docs) =>{
            if (err){
                res.send({"Error": "Not Super Admin"})
            }
            else{
                if (docs.length <=0)
                {
                    res.send({"Error": "Not Super Admin"})
                }
                if (docs.length ==1 && (docs[0].superadmin == true || docs[0].adminstatus == true))
                {
                    next()
                } 
            }
        })
    }
    catch{
        res.send({"Error": "Not Super Admin"})
    }
}


router.post('/signup', (request, response) => {
    try{
        const emailtemp = sanitize(request.body.email)
        const password = sanitize(request.body.password)
        const fullname = sanitize(request.body.fullname)
        userprofile.find({ email: emailtemp}, (err,docs) => {
            if (err){
                console.log(err)
            }
            else{
                if (docs.length >= 1)
                {
                    response.json(false)
                }
                else{
                    const hashedpassword = crypto.createHash('sha256').update(password).digest('base64')
                    const signedUpUser = new userprofile({
                        fullname: fullname,
                        email: (emailtemp).toLowerCase(),
                        password: hashedpassword
                    })
                    signedUpUser.save().then(data => {
                        response.json(data)
                    }).catch(error => {
                        response.json(error)
                    })
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

router.post('/login', (request,response) => {
    try{
        const emailtemp = sanitize(request.body.email)
        const passwordy = sanitize(request.body.password)
        const hashedpassword = crypto.createHash('sha256').update(passwordy).digest('base64')
        userprofile.find({ email: emailtemp}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                if (docs.length < 1)
                {
                    response.send(false)
                }
                else{
                    const doc = docs[0]
                    if (doc.password == hashedpassword)
                    {
                        response.send(doc)
                    }
                    else{
                        response.send(false)
                    }
                }
            }
        });
    }
    catch(err){
        console.log(err)
    }
})

//// Get Togethers
// load posts view more button, view post simply uses the object returned here
router.get('/gettogether', (request,response) => {
    try{
        const numberofposts = sanitize(request.body.numberofposts)
        gettogehter.find({}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/gettogether/post', async (request,response) => {
    try{
        const gettogetherpost = new gettogehter({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            contact: sanitize(request.body.contact),
            postedby: sanitize(request.body.user_id)
        })
        const getpost = await gettogetherpost.populate("postedby", "fullname")
        getpost.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err)
    {
        console.log(err)
    }
})

// render my posts
router.get('/gettogether/myposts', async (request,response) => {
    try{
        gettogehter.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })    
    }
    catch(err)
    {
        console.log(err)
    }
})

// delete selected post
router.post('/gettogether/myposts', async (request,response) => {
    try{
        gettogehter.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
////


/// Events

// load posts view more button, view post simply uses the object returned here
router.get('/events', (request,response) => {
    try{
        const numberofposts = sanitize(request.body.numberofposts)
        events.find({}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err)
    {
        console.log(err)
    }
})

//mark interested
router.post('/events/interested', async (request,response) => {
    try{
        events.updateOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)},{ $push: { "interested": sanitize(request.body.user_id) }}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// mark going
router.post('/events/going', async (request,response) => {    
    try{
        events.updateOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)},{ $push: { "going": sanitize(request.body.user_id) }}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/events/post', async (request,response) => {
    try{
        const eventspost = new events({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            contact: sanitize(request.body.contact),
            postedby: sanitize(request.body.user_id)
        })
        const getpost = await eventspost.populate("postedby", "fullname")
        getpost.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })    
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/events/myposts', async (request,response) => {
    try{
        events.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })    
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/events/myposts', async (request,response) => {
    try{
        events.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

//////


/// Job Posting/Career help

// load posts view more button, view post simply uses the object returned here
router.get('/careerhelp', (request,response) => {
    try{
        const numberofposts = sanitize(request.body.numberofposts)
        jobposting.find({}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/careerhelp/post', async (request,response) => {
    try{
        const jobposty = new jobposting({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            salary: sanitize(request.body.salary),
            location: sanitize(request.body.location),
            postedby: sanitize(request.body.user_id)
        })
        const jobpost = await jobposty.populate("postedby", "fullname")
        jobpost.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/careerhelp/myposts', async (request,response) => {
    try{
        jobposting.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/careerhelp/myposts', async (request,response) => {
    try{
        jobposting.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })    
    }
    catch(err){
        console.log(err)
    }
})
////



// Donations

// load posts view more button, view post simply uses the object returned here
router.get('/donations', (request,response) => {
    try{
        const numberofposts = request.body.numberofposts
        donations.find({}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/donations/post', async (request,response) => {
    try{
        const donationpost = new donations({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            postedby: sanitize(request.body.user_id)
        })
        const donpost = await donationpost.populate("postedby", "fullname")
        donpost.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/donations/myposts', async (request,response) => {
    try{
        donations.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })    
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/donations/myposts', async (request,response) => {
    try{
        donations.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })    
    }
    catch(err){
        console.log(err)
    }
})
////


// Food Delivery

// load posts view more button, view post simply uses the object returned here
router.get('/fooddelivery', (request,response) => {
    try{
        const numberofposts = request.body.numberofposts
        fooddelivery.find({}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/fooddelivery/post', async (request,response) => {
    try{
        const foodpost = new fooddelivery({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            postedby: sanitize(request.body.user_id),
            contact: sanitize(request.body.contact),
            compensation: sanitize(request.body.compensation),
            areafrom: sanitize(request.body.areafrom),
            areato: sanitize(request.body.areato)
        })
        const foopos = await foodpost.populate("postedby", "fullname")
        foopos.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/fooddelivery/myposts', async (request,response) => {
    try{
        fooddelivery.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })    
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/fooddelivery/myposts', async (request,response) => {
    try{
        fooddelivery.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
////

// Instructor Reviews

// search based on keywords
router.get('/instructorreviews', (request,response) => {
    try{
        const numbeofposts = sanitize(request.body.numberofposts)
        const tmp = `.*`+sanitize(request.body.keywords)+'.*'
        instructorreviews.find({ "title": { "$regex": tmp, "$options": "i" } }).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numbeofposts)
                {
                    response.send(docs.slice(0, numbeofposts))
                }
                if(docs.length <= numbeofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/instructorreviews/post', async (request,response) => {
    try{
        const insrev = new instructorreviews({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            postedby: sanitize(request.body.user_id),
            rating: sanitize(request.body.rating)
        })
        const inspos = await insrev.populate("postedby", "fullname")
        inspos.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/instructorreviews/myposts', async (request,response) => {
    try{
        instructorreviews.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })    
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/instructorreviews/myposts', async (request,response) => {
    try{
        instructorreviews.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
////

// Course Reviews

// search based on keywords
router.get('/coursereviews', (request,response) => {
    try{
        const tmp = `.*`+sanitize(request.body.keywords)+'.*'
        const numbeofposts = request.body.numberofposts
        coursereviews.find({ "title": { "$regex": tmp, "$options": "i" } }).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numbeofposts)
                {
                    response.send(docs.slice(0, numbeofposts))
                }
                if(docs.length <= numbeofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/coursereviews/post', async (request,response) => {
    try{
        const corsrev = new coursereviews({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            postedby: sanitize(request.body.user_id),
            rating: sanitize(request.body.rating)
        })
        const corspos = await corsrev.populate("postedby", "fullname")
        corspos.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/coursereviews/myposts', async (request,response) => {
    try{
        coursereviews.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/coursereviews/myposts', async (request,response) => {
    try{
        coursereviews.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

router.get('/coursereviews/browse', (request,response) => {
    try{
        const numberofposts = request.body.numberofposts
        courses.find({ semester: sanitize(request.body.semester), major: sanitize(request.body.major)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
////


// Discussion Portal

// search based on keywords
router.get('/discussionportal', (request,response) => {
    try{
        const tmp = `.*`+sanitize(request.body.keywords)+'.*'
        const numberofposts = request.body.numberofposts
        discussionportal.find({ "title": { "$regex": tmp, "$options": "i" } }).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/discussionportal/post', async (request,response) => {
    try{
        const disport = new discussionportal({
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            postedby: sanitize(request.body.user_id),
            anonymous: sanitize(request.body.anonymous)
        })
        const disp = await disport.populate("postedby", "fullname")
        disp.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/discussionportal/myposts', async (request,response) => {
    try{
        discussionportal.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/discussionportal/myposts', async (request,response) => {
    try{
        discussionportal.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

router.post('/discussionportal/like', async (request,response) => {    
    try{
        discussionportal.updateOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)},{ $push: { "likes": sanitize(request.body.user_id) }}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

router.post('/discussionportal/comment', async (request,response) => {    
    try{
        discussionportal.updateOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)},{ $push: { "comments": (sanitize(request.body.user_id),sanitize(request.body.comments)) }}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

router.get('/discussionportal/comment', async (request,response) => {    
    try{
        const numberofposts = request.body.numberofposts
        discussionportal.find({}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
////


/// Request Admin
router.post('/discussionportal/post', async (request,response) => {
    try{
        const adminpos = new reqadmin({
            content: sanitize(request.body.content),
            fullname: sanitize(request.body.fullname)
        })
        const reqad = await adminpos.populate("postedby", "fullname")
        reqad.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })    
    }
    catch(err){
        console.log(err)
    }
})

//// Admin Items

// search based on email or fullname number of posts required
router.get('/removeadmin',isSuperadmin, (request,response) => {
    try{
        const tmp = `.*`+sanitize(request.body.keywords)+'.*'
        const numberofposts = sanitize(request.body.numberofposts)
        userprofile.find({ $or:[ { "fullname": { "$regex": tmp, "$options": "i" }},{"email":sanitize(request.body.keywords) } ]}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
//remove admin based on _id
router.post('/removeadmin', isSuperadmin, (request,response)=> {
    // request.body.toremove
    try{
        userprofile.updateOne({ _id: sanitize(request.body.toremove)},{ $set: { "adminstatus": false }}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
//reject admin request based on postid
router.post('/adminreqs/reject', isSuperadmin, (request,response)=> {
    // request.body.toremove
    // request.body.postid // id of to delete request
    try{
        reqadmin.deleteOne({ _id:sanitize(request.body.postid)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })    
    }
    catch(err){
        console.log(err)
    }
})

//accept admin request based on postid, 
router.post('/adminreqs/accept', isSuperadmin, (request,response)=> {
    // request.body.toremove
    // request.body.postid // id of to delete request
    try{
        userprofile.findOne({$and: [{_id: sanitize(req.body.user_id)}, { "adminstatus": false }]}, (err,docs) =>{
            if (err){
                res.send({"Error": "Not Super Admin"})
            }
            else{
                if (docs.length <=0)
                {
                    res.send({"Error": "Not Found"})
                }
                else 
                {
                    userprofile.updateOne({ _id: sanitize(request.body.toadd)},{ $set: { "adminstatus": true }}, (err) => {
                        if (err){
                            console.log(err);
                        }
                        else{
                            reqadmin.deleteOne({ _id:sanitize(request.body.postid)}, (err) =>{
                                if (err){
                                    console.log(err);
                                }
                                else{
                                    response.json({'deleted':1})
                                }
                            })
                            console.log('updated')
                        }
                    })
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// get all admin requests
router.get('/adminreqs',isSuperadmin, (request,response) => {
    try{
        const numberofposts = request.body.numberofposts
        reqadmin.find({}).sort({date: -1}).exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// list remove user based on keywords,email, (search)
router.get('/removeuser',isAdmin, (request,response) => {
    try{
        const numberofposts = sanitize(request.body.numberofposts)
        const tmp = `.*`+sanitize(request.body.keywords)+'.*'
        userprofile.find({ $or:[ { "fullname": { "$regex": tmp, "$options": "i" }},{"email":sanitize(request.body.keywords) } ]}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numberofposts)
                {
                    response.send(docs.slice(0, numberofposts))
                }
                if(docs.length <= numberofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// remove user based on _id
router.post('/removeuser', isAdmin, (request,response)=> {
    // request.body.toremove
    try{
        userprofile.deleteOne({ _id: sanitize(request.body.toremove)}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('deleted')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})




/// Swap Reqeust

// load posts view more button, view post simply uses the object returned here
router.get('/swaprequest', (request,response) => {
    try{
        const numbeofposts = sanitize(request.body.numberofposts)
        swaprequest.find({fullfilled:false}).sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numbeofposts)
                {
                    response.send(docs.slice(0, numbeofposts))
                }
                if(docs.length <= numbeofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/swaprequest/post', async (request,response) => {
    try{
        const swappost = new swaprequest({
            want: sanitize(request.body.want),
            contact: sanitize(request.body.contact),
            have: sanitize(request.body.have),
            postedby: sanitize(request.body.user_id)
        })
        const swapy = await swappost.populate("postedby", "fullname")
        swapy.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })    
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/swaprequest/myposts', async (request,response) => {
    try{
        swaprequest.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/swaprequest/myposts', async (request,response) => {
    try{
        swaprequest.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
// mark as fullfileed
router.post('/swaprequest/myposts/fulfilled', async (request,response) => {
    try{
        events.updateOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)},{ $set: { "fullfilled": true }}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
//////


//// Marketplace

// load posts view more button, view post simply uses the object returned here
router.get('/marketpalce', (request,response) => {
    try{
        const numbeofposts = request.body.numberofposts
        marketpalce.find().sort({date: -1}).populate("postedby", "fullname").exec((err, docs) => {   
            if(err)
            {
                console.log(err)
                response.send({"error":err})
            }
            else{
                if(docs.length > numbeofposts)
                {
                    response.send(docs.slice(0, numbeofposts))
                }
                if(docs.length <= numbeofposts)
                {
                    response.send(docs)
                }
                else{
                    response.send(docs)
                }
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// post 
router.post('/marketpalce/post', async (request,response) => {
    try{
        const marketpost = new marketpalce({
            field: sanitize(request.body.field),
            contact: sanitize(request.body.contact),
            content: sanitize(request.body.content),
            title: sanitize(request.body.title),
            image: sanitize(request.body.image),
            postedby: sanitize(request.body.user_id)
        })
        const masky = await marketpost.populate("postedby", "fullname")
        masky.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err){
        console.log(err)
    }
})

// render my posts
router.get('/marketpalce/myposts', async (request,response) => {
    try{
        marketpalce.find({ postedby: sanitize(request.body.user_id)}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// delete selected post
router.post('/marketpalce/myposts', async (request,response) => {
    try{
        marketpalce.deleteOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)}, (err) =>{
            if (err){
                console.log(err);
            }
            else{
                response.json({'deleted':1})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
// 


/// Myprofile
// load posts view more button, view post simply uses the object returned here

// render my status
router.get('/myprofile/status', async (request,response) => {

    try{
        userprofile.find({ postedby: sanitize(request.body.user_id)}).select({ "status": 1})
        .exec(function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                // Sending an array of posts
                response.send(docs) 
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// add to status
router.post('/myprofile/poststatus', async (request,response) => {    
    try{
        userprofile.updateOne({ postedby: sanitize(request.body.user_id), _id:sanitize(request.body._id)},{ $push: { "status": sanitize(request.body.status) }}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

router.post('/requestadminship', async (request,response) => {
    try{
        const adminreq = new reqadmin({
            fullname: sanitize(request.body.fullname),
            content: sanitize(request.body.content),
            postedby: sanitize(request.body.user_id)
        })
        const reqy = await adminreq.populate("postedby", "fullname")
        reqy.save().then(data => {
            response.json(data)
        }).catch(error => {
            response.json(error)
        })
    }
    catch(err){
        console.log(err)
    }
})


router.post('/changepassword', (request,response) => {
    // newpassword
    // password
    //user_id
    try{
        const hashedpassword = crypto.createHash('sha256').update(sanitize(request.body.password)).digest('base64')
        userprofile.find({$and:[{ _id: sanitize(request.body.user_id)}, {password:hashedpassword}]}, (err, docs) =>{
            if (err){
                console.log(err);
            }
            else{
                if (docs.length < 1)
                {
                    response.send(false)
                }
                else{
                    const newhashpass = crypto.createHash('sha256').update(sanitize(request.body.newpassword)).digest('base64')
                    userprofile.updateOne({ email: sanitize(request.body.email)},{$set:{password:newhashpass}}, (err) => {
                        console.log(err)
                        response.send('updated')
                    })
                }
            }
        });
    }
    catch(err){
        console.log(err)
    }
})
  
router.post('/changedisplayname', (request,response) => {
    // display name
    // user_id
    try{
        userprofile.updateOne({ _id: sanitize(request.body.user_id)},{ $set: { fullname: sanitize(request.body.displayname)}}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})
   
router.post('/changedisplaypic', (request,response) => {
    // image
    // user_id
    try{
        userprofile.updateOne({ _id: sanitize(request.body.user_id)},{ $set: { image: sanitize(request.body.image)}}, (err) => {
            if (err){
                console.log(err);
            }
            else{
                console.log('updated')
            }
        })
    }
    catch(err){
        console.log(err)
    }
})


// To de Done
router.post('/forgotpassword', (request,resppnse) => {
    crypto.randomBytes(32, (err,buffer) => {
        if(err)
        {
            console.log(err)
        }
        const token = buffer.toString('hex')
        userprofile.findOne({_id:req.body.user_id})
        .then(user => {
            if(!user)
            {
                response.send({"Error":"Not Found"})
            }
            user.resettoken = token 
            user.expiretoken = Date.now() + 3600000 // token valid for 1 hour
            href = `http://localhost:3000/reset/${token}`
            user.save().then(res=> {
                transporter.sendMail({
                    to:user.email,
                    from:"no-reply@ldf.com",
                    subject:"Password Reset",
                    html:`
                    <p> You Requested for password reset</p>
                    <h5> Click on this <a href = "${href}">link</a> to reset!</h5>`
                })
            res.json({"message": "check email"})

            })
        })
    })
})
module.exports = router