const express = require("express");
const path = require("path");
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
app.use(express.static(path.join(__dirname, "../client/build")));
const port = process.env.PORT || 35053;

const client = new MongoClient(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/planners?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
client.connect();
const database = client.db("planners");
const collection = database.collection("main");

app.listen(port, () => console.log(`Served successfully at port ${port}!`));

app.post("/api/v1/planner/post", async (req, res) => {
  console.log(req.url);

  const data = {
    mode: req.body.mode == "calendar" ? "calendar" : "timetable",
    password: req.body.password || "",
    users: [],
    public: req.body.public || true,
    title: req.body.title || "Planner",
  };

  const result = await collection.insertOne(data);
  if (!result) {
    res.status(500);
    res.send({
      code: 500,
      content: null,
      message: "The planner could not be created!",
      success: false,
    });
    return;
  } else {
    res.status(200);
    res.send({ code: 200, content: result, success: true });
    return;
  }
});

app.post("/api/v1/planner/post/:oid", async (req, res) => {
  console.log(req.url);

  if (req.params.oid.length == 24) {
    const oid = new ObjectID(req.params.oid);
    const post_data = {
      _id: new ObjectID(),
      name: req.body.name,
      times: [],
    };
    if (!isAlpha(post_data.name)) {
      res.status(400);
      res.send({
        code: 400,
        content: null,
        message: "Illegal characters were used in the name!",
        success: false,
      });
      return;
    }
    const data = await collection.findOne({ _id: oid });
    if (!data) {
      res.status(404);
      res.send({
        code: 404,
        content: null,
        message: "Planner not found!",
        success: false,
      });
      return;
    } else {
      if (data.public || req.query.password == data.password) {
        if (data.users.some((i) => i.name == req.body.name)) {
          res.status(409);
          res.send({
            code: 409,
            content: null,
            message: "That name already exists in this planner",
            success: false,
          });
          return;
        } else {
          const result = await collection.updateOne(
            { _id: oid },
            { $push: { users: post_data } }
          );
          if (result && result.modifiedCount > 0) {
            const new_data = await collection.findOne({ _id: oid });
            if (!new_data) {
              res.status(404);
              res.send({
                code: 404,
                content: null,
                message: "Planner not found!",
                success: false,
              });
              return;
            } else {
              res.status(200);
              res.send({ code: 200, content: new_data, success: true });
              return;
            }
          } else {
            res.status(500);
            res.send({
              code: 500,
              content: null,
              message: "Deletion failed",
              success: false,
            });
            return;
          }
        }
      } else {
        res.status(401);
        res.send({
          code: 401,
          content: null,
          message: "The password provided was incorrect",
          success: false,
        });
        return;
      }
    }
  } else {
    res.status(400);
    res.send({
      code: 400,
      content: null,
      message: "The OID provided was incorrect",
      success: false,
    });
    return;
  }
});

app.get("/api/v1/planner/get/:oid", async (req, res) => {
  console.log(req.url);

  if (req.params.oid.length == 24) {
    const oid = new ObjectID(req.params.oid);
    const result = await collection.findOne({ _id: oid });
    if (!result) {
      res.status(404);
      res.send({
        code: 404,
        content: null,
        message: "Planner not found!",
        success: false,
      });
      return;
    } else {
      if (result.public || req.query.password == result.password) {
        res.status(200);
        res.send({ code: 200, content: result, success: true });
        return;
      } else {
        res.status(401);
        res.send({
          code: 401,
          content: null,
          message: "The password provided was incorrect",
          success: false,
        });
        return;
      }
    }
  } else {
    res.status(400);
    res.send({
      code: 400,
      content: null,
      message: "The OID provided was incorrect",
      success: false,
    });
    return;
  }
});

app.get("/api/v1/planner/get/:oid/:name", async (req, res) => {
  console.log(req.url);

  if (req.params.oid.length == 24) {
    const oid = new ObjectID(req.params.oid);
    const data = await collection.findOne({ _id: oid });
    if (!data) {
      res.status(404);
      res.send({
        code: 404,
        content: null,
        message: "Planner not found!",
        success: false,
      });
      return;
    } else {
      if (data.public || req.query.password == data.password) {
        const result = data.users.find((i) => i.name == req.params.name);
        if (result) {
          res.status(200);
          res.send({
            code: 200,
            content: result,
            mode: data.mode,
            success: true,
          });
          return;
        } else {
          res.status(404);
          res.send({
            code: 404,
            content: null,
            message: "The planner was found, but not the user!",
            success: false,
          });
          return;
        }
      } else {
        res.status(401);
        res.send({
          code: 401,
          content: null,
          message: "The password provided was incorrect",
          success: false,
        });
        return;
      }
    }
  } else {
    res.status(400);
    res.send({
      code: 400,
      content: null,
      message: "The OID provided was incorrect",
      success: false,
    });
    return;
  }
});

app.post("/api/v1/planner/post/:oid/:name", async (req, res) => {
  console.log(req.url);

  const post_data = req.body;
  if (req.params.oid.length == 24) {
    const oid = new ObjectID(req.params.oid);
    const data = await collection.findOne({ _id: oid });
    if (!data) {
      res.status(404);
      res.send({
        code: 404,
        content: null,
        message: "Planner not found!",
        success: false,
      });
      return;
    } else {
      if (data.public || req.query.password == data.password) {
        const result = await collection.updateOne(
          { _id: oid, "users.name": req.params.name },
          { $set: { "users.$.times": post_data } }
        );
        if (result && result.modifiedCount > 0) {
          const new_data = await collection.findOne({ _id: oid });
          if (!new_data) {
            res.status(404);
            res.send({
              code: 404,
              content: null,
              message: "Planner not found!",
              success: false,
            });
            return;
          } else {
            res.status(200);
            res.send({ code: 200, content: new_data, success: true });
            return;
          }
        } else {
          res.status(500);
          res.send({
            code: 500,
            content: null,
            message: "Insertion failed",
            success: false,
          });
          return;
        }
      } else {
        res.status(401);
        res.send({
          code: 401,
          content: null,
          message: "The password provided was incorrect",
          success: false,
        });
        return;
      }
    }
  } else {
    res.status(400);
    res.send({
      code: 400,
      content: null,
      message: "The OID provided was incorrect",
      success: false,
    });
    return;
  }
});

app.get("/api/v1/planner/pull/:oid", async (req, res) => {
  console.log(req.url);

  if (req.params.oid.length == 24) {
    const oid = new ObjectID(req.params.oid);
    const data = await collection.findOne({ _id: oid });
    if (!data) {
      res.status(404);
      res.send({
        code: 404,
        content: null,
        message: "Planner not found!",
        success: false,
      });
      return;
    } else {
      if (data.public || req.query.password == data.password) {
        const result = await collection.deleteOne({ _id: oid });
        if (result && result.deletedCount > 0) {
          res.status(200);
          res.send({ code: 200, content: result, success: true });
          return;
        } else {
          res.status(500);
          res.send({
            code: 500,
            content: null,
            message: "Deletion failed",
            success: false,
          });
          return;
        }
      } else {
        res.status(401);
        res.send({
          code: 401,
          content: null,
          message: "The password provided was incorrect",
          success: false,
        });
        return;
      }
    }
  } else {
    res.status(400);
    res.send({
      code: 400,
      content: null,
      message: "The OID provided was incorrect",
      success: false,
    });
    return;
  }
});

app.get("/api/v1/planner/pull/:oid/:name", async (req, res) => {
  console.log(req.url);
  if (req.params.oid.length == 24) {
    const oid = new ObjectID(req.params.oid);
    const name = req.params.name;
    const data = await collection.findOne({ _id: oid });
    if (!data) {
      res.status(404);
      res.send({
        code: 404,
        content: null,
        message: "Planner not found!",
        success: false,
      });
      return;
    } else {
      if (data.public || req.query.password == data.password) {
        const result = await collection.updateOne(
          { _id: oid },
          { $pull: { users: { name: name } } }
        );
        if (result && result.modifiedCount > 0) {
          const new_data = await collection.findOne({ _id: oid });
          if (!data) {
            res.status(404);
            res.send({
              code: 404,
              content: null,
              message: "Planner not found!",
              success: false,
            });
            return;
          } else {
            res.status(200);
            res.send({ code: 200, content: new_data, success: true });
            return;
          }
        } else {
          res.status(500);
          res.send({
            code: 500,
            content: null,
            message: "Deletion failed",
            success: false,
          });
          return;
        }
      } else {
        res.status(401);
        res.send({
          code: 401,
          content: null,
          message: "The password provided was incorrect",
          success: false,
        });
        return;
      }
    }
  } else {
    res.status(400);
    res.send({
      code: 400,
      content: null,
      message: "The OID provided was incorrect",
      success: false,
    });
    return;
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

isAlpha = (value) => {
  if (!value) {
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    ascii_code = value.codePointAt(i);
    if (
      !(
        (ascii_code >= 65 && ascii_code <= 90) ||
        (ascii_code >= 97 && ascii_code <= 122) ||
        (ascii_code >= 48 && ascii_code <= 57) ||
        ascii_code == 32
      )
    ) {
      return false;
    }
  }
  return true;
};
