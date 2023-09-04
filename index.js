require('dotenv').config()

const express = require('express')
const morgan = require('morgan') // http request logger middleware for nodejs https://github.com/expressjs/morgan
const cors = require('cors')

const Person = require('./models/phonebook')

/* ---MIDDLEWARE PART--- */

morgan.token('body', (request, response) => JSON.stringify(request.body))

const app = express()

// middleware for unknownrequests
const unknownEndpoint = (request, response) => {
  response.status(404).send({
    error: 'unknown endpoint'
  })
}

// middleware for error handling (is defined with 4 parameters)
const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if(error.name === 'CastError')
    return response.status(400).send({error: 'malformatted id'})
  else if(error.name === 'ValidationError')
    return response.status(400).json({error: error.message, status: 400})

  // in other situations error will be passed to default express error handler by below function  
  next(error)
}

//middleware are called in order they are taken into use
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body '))

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
]

// root tab
app.get('/', (request, response) => {
    response.send('<h1>Backend for Phonebook</h1>')
})

//info tab
app.get('/info', (request, response, next) => {
  const date = new Date();
  Person
    .countDocuments()
    .then(result => {
      response.send(`
        <p>Phonebook has info for ${result} people</p>
        <p>${date}</p>
      `)
    })
    .catch(error => next(error))
})

// to get all the contacts
app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons)
    })
})

// get a single contact
app.get('/api/persons/:id', (requset, response, next) => {
  const id = requset.params.id
  console.log(id)
  Person 
    .findById(id)
    .then(person => {
      if(person)
        response.json(person)
      else 
        response.status(404).end()
    })
    .catch(error => next(error))
})

// delete a contact
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  console.log(id)
  Person 
    .findByIdAndRemove(id)
    .then(result => {
      console.log('deleted')
      response.status(204).end()
    })
    .catch(error => next(error))
})

// create a contact
app.post('/api/persons', (request, response, next) => {
  const {name, number} = request.body
  console.log({name, number})
  
  //return if name or number is missing 
  
  const person = new Person({
    name: name,
    number: number 
  })

  person  
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

// to update the phone number
app.put('/api/persons/:id', (request, response, next) => {
  const {name, number} = request.body
  const id = request.params.id

  Person
    .findByIdAndUpdate(id, {name, number}, {new: true, runValidators: true, context: 'query'}) // {new: true } will cause the event handler to be called with new modified document
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})