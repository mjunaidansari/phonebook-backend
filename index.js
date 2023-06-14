const express = require('express')
const morgan = require('morgan') // http request logger middleware for nodejs https://github.com/expressjs/morgan
const cors = require('cors')

morgan.token('body', (request, response) => JSON.stringify(request.body))

const app = express()

// middleware for unknownrequests
const unknownEndpoint = (request, response) => {
  response.status(404).send({
    error: 'unknown endpoint'
  })
}
 
//middleware are called in order they are taken into use
app.use(cors())
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
app.get('/info', (request, response) => {
  const n = persons.length
  const date = new Date()
  response.send(`
    <p>Phonebook has info for ${n} people</p>
    <p>${date}</p>
  `)
})

// to get all the contacts
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// get a single contact
app.get('/api/persons/:id', (requset, response) => {
  const id = Number(requset.params.id)
  const person = persons.find(person => person.id === id)
  console.log(person)
  if(person) response.json(person)
  else response.status(404).end()  //end() is used to send response without data
})

// delete a contact
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

// receive a contact
const generateId = () => {
  const maxId = persons.length > 0 
  ? Math.max(...persons.map(p => p.id)) //spread operator is used to pass array as separate numbers
  : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body)
  
  //return if name or number is missing 
  if(!body.name || !body.number) 
    return response.status(400).json({
      error: 'content missing'
    })

  const found = persons.find(person => person.name === body.name)

  if(found) 
    return response.status(400).json({
      error: 'name must be unique'
    })
  
  const person = {
  name: body.name, 
  number: body.number, 
  id: generateId()
  }

  persons = persons.concat(person)

  response.json(person)
})

app.use(unknownEndpoint)

// making app listen to the port 3001
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})