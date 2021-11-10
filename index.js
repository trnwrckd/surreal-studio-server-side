const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// uri and client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2w1ht.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// run
async function run() {
    try {
        await client.connect();
        
        const database = client.db("surrealStudio");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        
        // Get Products
        app.get('/products', async (req, res) => {
            // select all
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // Get product by _id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log("purchase" ,id);
            const query = { _id: ObjectId(id) };

            const currentProduct = await productsCollection.findOne(query);
            res.json(currentProduct);
        })

        // post new order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log("posting order", order);
            
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        });

        // get all orders - admin
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            console.log("Getting all orders for admin");
            const orders = await cursor.toArray();
            res.send(orders);
        })
        
        // get single users order
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            console.log("orders placed by" , email);

            const query = { email: email };
    
            const orders = await ordersCollection.find(query).toArray();
            res.json(orders);
        })


    }finally{}
}

run().catch(console.dir)

app.get('/', (req, res) => {
    console.log("Server started");
    res.send("Server running");
});

app.listen(port, () => {
    console.log("listening to port", port);
})