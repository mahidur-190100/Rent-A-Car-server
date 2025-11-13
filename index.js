const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());
require("dotenv").config();
 
app.get("/", (req, res) => {
  res.send("Server is running fine 2!");
});

// console.log(process.env.DB_USERNAME);
// console.log(process.env.DB_PASSWORD);
const uri =
  `mongodb+srv://${process.env.DB_USERNAME }:${process.env.DB_PASSWORD }@cluster0.zuity7f.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const db = client.db("aas_10DB");
    const modelCollections = db.collection("models");
    const bookingCollections =db.collection("bookings")

    // find,findOne
    app.get("/models", async (req, res) => {
      const cursor = modelCollections.find(); // promise
      const result = await cursor.toArray();
      res.send(result);
    });
    // particular data find
    app.get("/models/:id", async (req, res) => {
      const { id } = req.params;
      // console.log(id);
      const result = await modelCollections.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        result,
      });
    });

    // post method
    // insert, insertMany
    app.post("/models", async (req, res) => {
      const newModel = req.body;
      console.log(newModel);
      const result = await modelCollections.insertOne(newModel);
      res.send({
        success: true,
        result,
      });
    });

    // update (PUT) a model by id
    // updateOne
    // updateMany
   app.put('/models/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ success: false, message: 'Invalid id format' })
    }
    const update = req.body || {}
    delete update._id 
    const { value: updated } = await modelCollections.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )
    if (!updated) {
      return res.status(404).send({ success: false, message: 'Model not found' })
    }
    res.send({ success: true, result: updated })
  } catch (err) {
    console.error('PUT /models/:id error:', err)
    res.status(500).send({ success: false, message: 'Server error' })
  }
})


    // delete ,deleteOne, deleteMany
    app.delete("/models/:id", async (req, res) => {
      const { id } = req.params;
      const result = await modelCollections.deleteOne({ _id: new ObjectId(id) });

      res.send({
        success: true,
        result,
        
      });
    });


  
app.get('/latest-models', async (req, res) => {
  try {
    const result = await modelCollections.find({})
      .sort({ _id: -1 })
      .limit(6)
      .toArray();
    
    console.log(result);
    res.send(result);
    
  } catch (error) {
    console.error('Error fetching sorted data:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


// my models er jonne
app.get('/my-models', async (req, res) => {
  const email = req.query.email;
  const result = await modelCollections.find({ userEmail: email }).toArray();
  res.send(result);

})

// seacrh
app.get('/search', async (req, res) => {
  const search_text = req.query.search
  const result = await modelCollections.find({
    vehicleName :{$regex: search_text, $options: 'i' }
  }).toArray();
  res.send(result);

});


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});





