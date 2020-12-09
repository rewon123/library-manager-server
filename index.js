const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');

app.use(bodyParser.json())
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.oqqwn.mongodb.net:27017,cluster0-shard-00-01.oqqwn.mongodb.net:27017,cluster0-shard-00-02.oqqwn.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-eg2ygn-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const booksCollection = client.db("libaray-manager").collection("books");
  const adminCollection = client.db("libaray-manager").collection('admins');
  const borrowedBooks = client.db("libaray-manager").collection('registered-books');


  app.get('/allBooks', (req, res) => {
    booksCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/allAdmin', (req, res) => {
    adminCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/bookDetail/:id', (req, res) => {
    booksCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })

  app.post('/AddRegistration', (req, res) => {
    const registrationsDetails = req.body;
    borrowedBooks.insertOne(registrationsDetails)
      .then(result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })


  app.get('/specificRegistration', (req, res) => {
    borrowedBooks.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


  app.post('/addBook', (req, res) => {
    const file = req.files.file;
    const bookName = req.body.bookName;
    const author = req.body.author;
    const genre = req.body.genre;
    const releaseDate = req.body.releaseDate;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');



    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    booksCollection.insertOne({
      genre, bookName, author, image, releaseDate
    })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })



  app.delete('/deleteRegistration/:id', (req, res) => {
    borrowedBooks.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        console.log(result, 'tui are nai');
      })
  })


  // it will show on terminal when database is connected successfully
  console.log('connected');

});

app.listen(process.env.PORT)