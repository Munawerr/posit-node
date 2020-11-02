const express = require("express");
const router = express.Router();
require("dotenv/config");
const mongoose = require("mongoose");
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
  res.send("hello world!!!!!!!");
});

router.get("/api/restaurants", (req, res) => {
  (async () => {
    let Client;
    try {
      Client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const dataBase = Client.db("sample_restaurants");

      const Restaurants = dataBase.collection("restaurants");

      const restaurant = await Restaurants.find({
        borough: "Brooklyn",
        cuisine: "American",
      }).toArray();
      res.send(restaurant);
    } catch (e) {
      console.error(e);
    } finally {
      Client.close();
    }
  })().catch((error) => {
    res.send(`An Error Occured \n\n${error}`);
  });
});

router.get("/api/restaurants/:rId", (req, resp) => {
  (async () => {
    let Client;
    try {
      testClient = await MongoClient.connect(process.env.MONGODB_URI, {
        connectTimeoutMS: 200,
        retryWrites: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const dataBase = Client.db("sample_restaurants");

      const Restaurants = dataBase.collection("restaurants");

      const restaurant = await Restaurants.findOne({
        restaurant_id: { $eq: req.params.rId },
      });
      resp.send(restaurant);
    } catch (e) {
      console.error(e);
    } finally {
      Client.close();
    }
  })().catch((error) => {
    resp.send(`An Error Occured \n\n${error}`);
  });
});

router.post("/api/restaurants", jsonParser, (req, resp) => {
  const rest = new RestModal(
    req.body.address,
    req.body.borough,
    req.body.cuisine,
    req.body.grades,
    req.body.name,
    req.body.restaurant_id
  );
  (async () => {
    try {
      testClient = await MongoClient.connect(process.env.MONGODB_URI, {
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
  })().catch((error) => {
    res.send(`An Error Occured \n\n${error}`);
  });
});

router.put("/api/restaurants/:rId", jsonParser, (req, resp) => {
  (async () => {
    // get Restaurant by Id
    try {
      testClient = await MongoClient.connect(process.env.MONGODB_URI, {
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
  })().catch((error) => {
    resp.send(`An Error Occured \n\n${error}`);
  });
});

router.delete("/api/restaurants/:rId", jsonParser, (req, resp) => {
  (async () => {
    // get Restaurant by Id
    try {
      testClient = await MongoClient.connect(process.env.MONGODB_URI, {
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
  })().catch(() => {
    resp.send(`An Error Occured \n\n${error}`);
  });
});

module.exports = router;
