const express = require("express");
const router = express.Router();
require("dotenv/config");
const MongoClient = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
const Joi = require("joi");

// create application/json parser
var jsonParser = bodyParser.json();
const RestModal = require("../models/rest");

const schema = Joi.object({
  Borough: Joi.string().min(3).max(20),
  Cuisine: Joi.string(),
  Name: Joi.string().max(300),
  RType: Joi.string().min(2).max(2),
});
router.get("/", (req, res) => {
  res.send("hello world!!!");
});

router.get("/api/restaurants", (req, res) => {
  (async () => {
    let testClient;
    try {
      testClient = await MongoClient.connect(process.env.mongoCredi, {
        connectTimeoutMS: 200,
        retryWrites: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const dataBase = testClient.db("sample_restaurants");

      const Restaurants = dataBase.collection("restaurants");

      const restaurant = await Restaurants.find({
        borough: "Brooklyn",
        cuisine: "American",
      }).toArray();
      res.send(restaurant);
    } catch (e) {
      console.error(e);
    } finally {
      testClient.close();
    }
  })();
});

router.get("/api/restaurants/:rId", (req, resp) => {
  (async () => {
    let testClient;
    try {
      testClient = await MongoClient.connect(process.env.mongoCredi, {
        connectTimeoutMS: 200,
        retryWrites: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const dataBase = testClient.db("sample_restaurants");

      const Restaurants = dataBase.collection("restaurants");

      const restaurant = await Restaurants.findOne({
        restaurant_id: { $eq: req.params.rId },
      });
      resp.send(restaurant);
    } catch (e) {
      console.error(e);
    } finally {
      testClient.close();
    }
  })();
});

router.post("/api/restaurants", jsonParser, async (req, resp) => {
  const rest = new RestModal(
    req.body.address,
    req.body.borough,
    req.body.cuisine,
    req.body.grades,
    req.body.name,
    req.body.restaurant_id
  );

  try {
    testClient = await MongoClient.connect(process.env.mongoCredi, {
      connectTimeoutMS: 200,
      retryWrites: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dataBase = testClient.db("sample_restaurants");

    const Restaurants = dataBase.collection("restaurants");

    await Restaurants.insertOne(rest);
    resp.send("Restaurant added successfully!");
  } catch (e) {
    console.error(e);
  } finally {
    testClient.close();
  }
});

router.put("/api/restaurants/:rId", jsonParser, async (req, resp) => {
  // get Restaurant by Id
  try {
    testClient = await MongoClient.connect(process.env.mongoCredi, {
      connectTimeoutMS: 200,
      retryWrites: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dataBase = testClient.db("sample_restaurants");

    const Restaurants = dataBase.collection("restaurants");

    const restaurant = await Restaurants.findOne({
      restaurant_id: { $eq: req.params.rId },
    });

    if (!restaurant || restaurant == null || restaurant == undefined) {
      return resp
        .status(404)
        .send("The Restaurant with the given ID was not found");
    }

    // Validate The new Restaurant Data
    const boroughValid = schema.validate({ Borough: req.body.borough });
    const cuisineValid = schema.validate({ Cuisine: req.body.cuisine });
    const nameValid = schema.validate({
      Name: req.body.name,
    });
    if (boroughValid.error) {
      return resp.status(400).send(boroughValid.error.details[0].message);
    } else if (cuisineValid.error) {
      return resp.status(400).send(cuisineValid.error.details[0].message);
    } else if (nameValid.error) {
      return resp.status(400).send(nameValid.error.details[0].message);
    }

    await Restaurants.updateOne(
      {
        restaurant_id: { $eq: req.params.rId },
      },
      {
        $set: {
          borough: req.body.borough,
          cuisine: req.body.cuisine,
          name: req.body.name,
        },
      }
    );

    resp.send("Restaurant Updated Successfully!");
  } catch (e) {
    console.error(e);
  } finally {
    testClient.close();
  }
});

router.delete("/api/restaurants/:rId", jsonParser, async (req, resp) => {
  // get Restaurant by Id
  try {
    testClient = await MongoClient.connect(process.env.mongoCredi, {
      connectTimeoutMS: 200,
      retryWrites: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dataBase = testClient.db("sample_restaurants");

    const Restaurants = dataBase.collection("restaurants");

    await Restaurants.deleteOne({
      restaurant_id: { $eq: req.params.rId },
    });

    resp.send("Restaurant Deleted Successfully!");
  } catch (e) {
    console.error(e);
  } finally {
    testClient.close();
  }
});

module.exports = router;
