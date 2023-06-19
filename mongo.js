const mongoose = require('mongoose')

// exit if number of argument is less than 3 ie. password is not provided
if(process.argv.length < 3) {
    console.log('Give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://mjunaidansari:${password}@cluster0.bpe1h2a.mongodb.net/phonebookApp?retryWrites=true&w=majority`

// setting strict query to false will save the fields in db even if not mentioned in schema 
mongoose.set('strictQuery', false)
mongoose.connect(url)

// creating schema for docs
const personSchema = mongoose.Schema({
    name: String, 
    number: Number,
})

// creating a model for the constructor
const Person = mongoose.model('Person', personSchema)

if(process.argv.length === 5) {

    // creating a person object using above constructor
    const person = new Person({
        name: process.argv[3], 
        number: Number(process.argv[4]),
    })

    // saving person data to db
    person
        .save()
        .then(result => {
            console.log('Added', result.name, 'number', result.number, 'to phonebook')
            mongoose.connection.close()
        })

} else if (process.argv.length === 3) {
    console.log('phonebook')
    // finding all the entries in phonebook collection
    Person
        .find({})
        .then(result => {
            result.forEach(person => {
                console.log(person.name, person.number)
            })
            mongoose.connection.close()
        })
}



