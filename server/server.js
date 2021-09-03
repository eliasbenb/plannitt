const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectId;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
const port = 35053;

const client = new MongoClient(
  `mongodb+srv://${process.env.PLANNITT_USERNAME}:${process.env.PLANNITT_PASSWORD}@${process.env.PLANNITT_CLUSTER}/planners?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
client.connect();
const database = client.db("planners");
const collection = database.collection("main");

app.listen(port, () => console.log(`Listening on port ${port}`));

app.post("/api/v1/planner/post", async (req, res) => {
  console.log(req.url);

  const data = {
    mode:
      req.body.mode in ["calendar", "timetable"] ? req.body.mode : "timetable",
    password: req.body.password,
    planners: [],
    public: req.body.public,
    title: req.body.title,
    type: "group",
  };
  const result = await collection.insertOne(data);
  if (!result) {
    res.send({
      content: null,
      message: "The planner could not be created!",
      success: false,
    });
  } else {
    res.send({ content: result, success: true });
  }
});

app.post("/api/v1/planner/post/:oid", async (req, res) => {
  console.log(req.url);

  const oid = new ObjectID(req.params.oid);
  const post_data = {
    name: req.body.name,
    times: [],
  };
  const data = await collection.findOne({ _id: oid });
  if (!data) {
    res.send({
      content: null,
      message: "Planner not found!",
      success: false,
    });
  } else {
    if (data.public || req.query.password == data.password) {
      const result = await collection.updateOne(
        { _id: oid },
        { $push: { planners: post_data } }
      );
      if (result && result.modifiedCount > 0) {
        const new_data = await collection.findOne({ _id: oid });
        if (!new_data) {
          res.send({
            content: null,
            message: "Planner not found!",
            success: false,
          });
        } else {
          res.send({ content: new_data, success: true });
        }
      } else {
        res.send({
          content: null,
          message: "Deletion failed",
          success: false,
        });
      }
    } else {
      res.send({
        content: null,
        message: "The password provided was incorrect",
        success: false,
      });
    }
  }
});

app.get("/api/v1/planner/get/:oid", async (req, res) => {
  console.log(req.url);

  const oid = new ObjectID(req.params.oid);
  const result = await collection.findOne({ _id: oid });
  if (!result) {
    res.send({ content: null, message: "Planner not found!", success: false });
  } else {
    if (result.public || req.query.password == result.password) {
      res.send({ content: result, success: true });
    } else {
      res.send({
        content: null,
        message: "The password provided was incorrect",
        success: false,
      });
    }
  }
});

app.get("/api/v1/planner/pull/:oid", async (req, res) => {
  console.log(req.url);

  const oid = new ObjectID(req.params.oid);
  const data = await collection.findOne({ _id: oid });
  if (!data) {
    res.send({ content: null, message: "Planner not found!", success: false });
  } else {
    if (data.public || req.query.password == data.password) {
      const result = await collection.deleteOne({ _id: oid });
      if (result && result.deletedCount > 0) {
        res.send({ content: result, success: true });
      } else {
        res.send({
          content: null,
          message: "Deletion failed",
          success: false,
        });
      }
    } else {
      res.send({
        content: null,
        message: "The password provided was incorrect",
        success: false,
      });
    }
  }
});

app.get("/api/v1/planner/pull/:oid/:name", async (req, res) => {
  console.log(req.url);

  const oid = new ObjectID(req.params.oid);
  const name = req.params.name;
  const data = await collection.findOne({ _id: oid });
  if (!data) {
    res.send({ content: null, message: "Planner not found!", success: false });
  } else {
    if (data.public || req.query.password == data.password) {
      const result = await collection.updateOne(
        { _id: oid },
        { $pull: { planners: { name: name } } }
      );
      if (result && result.modifiedCount > 0) {
        const new_data = await collection.findOne({ _id: oid });
        if (!data) {
          res.send({
            content: null,
            message: "Planner not found!",
            success: false,
          });
        } else {
          res.send({ content: new_data, success: true });
        }
      } else {
        res.send({
          content: null,
          message: "Deletion failed",
          success: false,
        });
      }
    } else {
      res.send({
        content: null,
        message: "The password provided was incorrect",
        success: false,
      });
    }
  }
});
