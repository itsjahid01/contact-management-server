const express = require('express')
const cors = require('cors')
const app = express()
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ekjerqg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const contactCollection= client.db('contactManagementDb').collection('contacts');


    // ------get api-----------
    app.get('/contacts',async(req,res)=>{
        const sortOrder = req.query.sort === 'desc' ? -1 : 1;
        const search=req.query.search;
        
        const result= await contactCollection.find().sort({ name: sortOrder }).toArray()
        res.send(result)
    })

    app.get('/contacts/:id',async(req,res)=>{
        const id =req.params.id
        const query={
            _id: new ObjectId(id)
        }
        if (!query) {
            res.send({error:true,  message:"data not found"})
        }
        const result= await contactCollection.findOne(query)
        res.send(result)
    })

 // ------post api-----------
    app.post('/contacts',async(req,res)=>{
        const newContact= req.body;
        if (!newContact) {
            res.send({error:true,message:"data not found"})
        }
        const result= await contactCollection.insertOne(newContact)
        res.send(result)
    })


 // ------put api-----------

    app.put('/contacts/:id',async(req,res)=>{
        const id= req.params.id;
        if (!id) {
            res.send({error:true, message:"data not found"})
        }

        const updateContact=req.body;
        // console.log(updateContact);

        const filter={
            _id:new ObjectId(id)
        }

        const updateDoc={
            $set:{
                name:updateContact?.name,
                email:updateContact?.email,
                date:updateContact?.date,
                number:updateContact?.number,
            }
        }
        
        const result= await contactCollection.updateOne(filter,updateDoc)
        res.send(result)
    })


 // ------delete api-----------
 app.delete('/contacts/:id',async(req,res)=>{
    const id= req.params.id;
    if (!id) {
        res.send({error:true, message:"data not found"})
    }
    const query={
        _id:new ObjectId(id)
    }
    const result= await contactCollection.deleteOne(query)
    res.send(result)
})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Welcome to Contact Management Server')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})