const mongoose = require('mongoose')

// setting strict query to false will save the fields in db even if not mentioned in schema 
mongoose.set('strictQuery', false)

// url will be accesssed from env variables, dotenv library is used with .env file at root directory to delacre env variables
const url = process.env.MONGODB_URI

// console.log('Connecting to', url)
mongoose
    .connect(url)
    .then(result => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
        console.log('Error occurred while connecting to MongoDB:', error.message)
    })

// creating a schema for contact docs
const personSchema = mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        require: true
    }, 
    number: {
        type: String,
        validate: {
            validator: value =>/^[0-9]{2,3}[-]?[0-9]{6,8}$/.test(value), 
            message: props => `${props.value} is not a valid phone number!`
        },
        required: true
    },
})

// transforming the incoming doc into JSON having _id changed to id and removing __v versioning field
personSchema.set('toJSON', {
    transform: (document, returnedObject) => { // document = incoming doc, returnedObject = transformed object that is returned
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// creating and exporting a contructor for note docs with reference to above schema
module.exports = mongoose.model('Person', personSchema)