const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 2500
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express()

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('volunteer network is increasing!')
})


const uri = `mongodb+srv://${process.env.VOLUNTEER_DB_USER}:${process.env.VOLUNTEER_DB_PASS}@cluster0.iw4kl2c.mongodb.net/?retryWrites=true&w=majority`;


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
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        const volunteerNetworkDB = client.db('volunteer-network-DB')
        const volunteerOpportunitiesCollection = volunteerNetworkDB.collection('volunteer-opportunities-collection')
        const volunteerCollection = volunteerNetworkDB.collection('volunteer-collection')

        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // create volunteer
        app.post('/add-volunteer', async (req, res) => {
            const newVolunteer = req.body
            const result = await volunteerCollection.insertOne(newVolunteer)
            res.send(result)
        })

        // get all volunteer
        app.get('/volunteers', async (req, res) => {
            const result = await volunteerCollection.find({}).toArray()
            res.send(result)
        })

        // get all volunteer opportunites
        app.get('/volunteer-opportunities', async (req, res) => {
            const {search} = req.query
            let find = {}
            if(search){
                find = {name: {$regex: search, $options: 'i'}}
            }
            const result = await volunteerOpportunitiesCollection.find(find).toArray()
            res.send(result)
        })
        
        // get volunteer opportunites by id
        app.get('/volunteer-opportunities/:id', async (req, res) => {
            const id = req.params.id
            const find = { _id: new ObjectId(id) }
            const result = await volunteerOpportunitiesCollection.findOne(find)
            res.send(result)
        })

        // remove single voluter
        app.delete('/volunteer-delete/:id', async(req, res)=>{
            const id = req.params.id
            const find = {_id: new ObjectId(id)}
            const result = await volunteerCollection.deleteOne(find)
            res.send(result)
        }) 

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`volunteer network is running on ${port}!`);
})