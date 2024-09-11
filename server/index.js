// const { MongoClient, ServerApiVersion } = require("mongodb");
// const express = require("express");
// const cors = require("cors");
// const uri =
//   "mongodb+srv://jinmoyee99:jinmoyee99@cluster0.vpa0f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const port = 5000;

// const app = express();
// app.use(cors());
// app.use(express.json());

// const client = new MongoClient(uri);

// async function run() {
//   try {
//     await client.connect();
//     const postcollection = client.db("database").collection("posts");
//     const usercollection = client.db("database").collection("users");
//     app.post("/register", async (req, res) => {
//       const user = req.body;
//       const result = await usercollection.insertOne(user);
//       res.send(result);
//     });
//     app.get("/loggedinuser", async (req, res) => {
//       const email = req.query.email;
//       const user = await usercollection.find({ email: email }).toArray();
//       res.send(user);
//     });
//     app.post("/post", async (req, res) => {
//       const post = req.body;
//       const result = await postcollection.insertOne(post);
//       res.send(result);
//     });
//     app.get("/post", async (req, res) => {
//       const post = (await postcollection.find().toArray()).reverse();
//       res.send(post);
//     });
//     app.get("/userpost", async (req, res) => {
//       const email = req.query.email;
//       const post = (
//         await postcollection.find({ email: email }).toArray()
//       ).reverse();
//       res.send(post);
//     });

//     app.get("/user", async (req, res) => {
//       const user = await usercollection.find().toArray();
//       res.send(user);
//     });

//     app.patch("/userupdate/:email", async (req, res) => {
//       const filter = req.params;
//       const profile = req.body;
//       const options = { upsert: true };
//       const updateDoc = { $set: profile };
//       // console.log(profile)
//       const result = await usercollection.updateOne(filter, updateDoc, options);
//       res.send(result);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }
// run().catch(console.dir);

// app.get("/", (req, res) => {
//   res.send("Twiller is working");
// });

// app.listen(port, () => {
//   console.log(`Twiller clone is workingon ${port}`);
// });




const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const uri = "mongodb+srv://jinmoyee99:jinmoyee99@cluster0.vpa0f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const port = 5000;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri);

// Helper function to check if the current time is within 10:00 AM to 10:30 AM IST
const isWithinTimeWindow = () => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  start.setHours(10, 0, 0); // 10:00 AM IST
  end.setHours(10, 30, 0);  // 10:30 AM IST

  return now >= start && now <= end;
};

async function run() {
  try {
    await client.connect();
    const postcollection = client.db("database").collection("posts");
    const usercollection = client.db("database").collection("users");

    // User registration
    app.post("/register", async (req, res) => {
      const user = req.body;
      user.followers = [];
      user.dailyPosts = 0;
      user.lastPostDate = new Date(0); // Default date for the first post
      const result = await usercollection.insertOne(user);
      res.send(result);
    });

    // Get logged-in user by email
    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await usercollection.find({ email: email }).toArray();
      res.send(user);
    });

    // Get all users
    app.get("/user", async (req, res) => {
      const user = await usercollection.find().toArray();
      res.send(user);
    });

    app.get("/usersId", async (req, res) => {
      try {
        const users = await usercollection.find().toArray();
        const userIds = users.map(user => user.userId || user._id); // Extract only userId
        res.send(userIds);
      } catch (error) {
        res.status(500).send({ error: "An error occurred while fetching user IDs" });
      }
    });

    // Update user profile
    app.patch("/userupdate/:email", async (req, res) => {
      const filter = { email: req.params.email };
      const profile = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: profile };
      const result = await usercollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Post tweet
    app.post("/post", async (req, res) => {
      const { email, postContent } = req.body;

      // Fetch the user by email
      const user = await usercollection.findOne({ email: email });

      const now = new Date();
      const isSameDay = user.lastPostDate && user.lastPostDate.toDateString() === now.toDateString();

      // If user doesn't follow anyone, allow posting only once between 10:00 AM and 10:30 AM IST
      if (user.followers.length === 0) {
        if (isWithinTimeWindow()) {
          if (!isSameDay || user.dailyPosts === 0) {
            await postcollection.insertOne({ email, postContent });
            await usercollection.updateOne(
              { email: email },
              { $set: { dailyPosts: 1, lastPostDate: now } }
            );
            return res.send({ success: true, message: "Tweet posted!" });
          } else {
            return res.status(403).send({ success: false, message: "You've already posted today." });
          }
        } else {
          return res.status(403).send({
            success: false,
            message: "You can only post between 10:00 AM and 10:30 AM IST.",
          });
        }
      }

      // If user follows 2 people, allow only 2 posts per day
      if (user.followers.length === 2) {
        if (!isSameDay || user.dailyPosts < 2) {
          await postcollection.insertOne({ email, postContent });
          const updatedPosts = isSameDay ? user.dailyPosts + 1 : 1;
          await usercollection.updateOne(
            { email: email },
            { $set: { dailyPosts: updatedPosts, lastPostDate: now } }
          );
          return res.send({ success: true, message: "Tweet posted!" });
        } else {
          return res.status(403).send({ success: false, message: "Post limit reached for today." });
        }
      }

      // If user follows more than 10 people, allow unlimited posts
      if (user.followers.length > 10) {
        await postcollection.insertOne({ email, postContent });
        await usercollection.updateOne(
          { email: email },
          { $set: { dailyPosts: user.dailyPosts + 1, lastPostDate: now } }
        );
        return res.send({ success: true, message: "Tweet posted!" });
      }

      res.status(403).send({ success: false, message: "Post limit reached or invalid conditions." });
    });

    // Get all posts
    app.get("/post", async (req, res) => {
      const post = (await postcollection.find().toArray()).reverse();
      res.send(post);
    });

    // Get posts by user
    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const post = (await postcollection.find({ email: email }).toArray()).reverse();
      res.send(post);
    });

  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Twiller is working");
});

// Server listening
app.listen(port, () => {
  console.log(`Twiller clone is working on ${port}`);
});
