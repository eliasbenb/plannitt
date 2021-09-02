const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectId;
const config = require("./config.json");

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
const port = 35053;

const client = new MongoClient(
  `mongodb+srv://${config.username}:${config.password}@${config.cluster}/timetablesDB?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
client.connect();
const database = client.db("timetablesDB");
const collection = database.collection("main");

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/api/v1/timetables/get/:oid", async (req, res) => {
  const oid = new ObjectID(req.params.oid);
  const result = await collection.findOne({ _id: oid });
  res.send({ content: result, success: true });
});

app.post("/api/v1/timetables/post", async (req, res) => {
  console.log(req.body);
  const result = await collection.insertOne(req.body);
  res.send({ content: result, success: true });
});
