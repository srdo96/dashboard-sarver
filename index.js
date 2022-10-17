const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://admin:ad123456@cluster0.j4zmlny.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("dashboard-server").collection("users");

    app.get("/users", async (req, res) => {
      const allUsers = await usersCollection.find().toArray();
      res.send(allUsers);
    });
    // check admin and role
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin, role: user?.role });
    });

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put("/update-role/:email", async (req, res) => {
      const email = req.params.email;
      const role = req.body;
      // console.log(role.role);
      const filter = { email: email };
      const option = { upsert: true };
      const update = {
        $set: {
          role: role.role,
        },
      };
      const result = await usersCollection.updateOne(filter, update, option);
      res.send(result);
    });

    app.delete("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Dashboard");
});
app.listen(port, () => {
  console.log("Listening to port ->", port);
});
