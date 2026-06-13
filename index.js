const { configDotenv } = require("dotenv");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const port = 5000;
configDotenv();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    const myDB = client.db("arif-website");
    const courseCollection = myDB.collection("courses");
    const videoCollection = myDB.collection("videos");

    // Courses api
    app.post("/api/courses", async (req, res) => {
      try {
        const courseDetails = req.body;

        const courseDoc = {
          ...courseDetails,
          createdAt: new Date(),
        };

        // ডেটাবেসে ইনসার্ট করা
        const result = await courseCollection.insertOne(courseDoc);

        // --- গুরুত্বপূর্ণ: এখানে রেসপন্স পাঠাতে হবে ---
        res.status(201).json({
          success: true,
          message: "Course added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        // এরর হলে সেটির রেসপন্স পাঠানো
        console.error("Database Error:", error);
        res.status(500).json({ success: false, message: "Server side error" });
      }
    });

    // Get all courses api
    app.get("/api/courses", async (req, res) => {
      try {
        // কোর্স কালেকশন থেকে সব ডেটা নিয়ে আসা
        const cursor = courseCollection.find({});
        const courses = await cursor.toArray();

        // ক্লায়েন্টের কাছে ডেটা পাঠানো
        res.status(200).json({
          success: true,
          data: courses,
        });
      } catch (error) {
        console.error("Fetch Courses Error:", error);
        res
          .status(500)
          .json({ success: false, message: "Failed to fetch courses" });
      }
    });

    app.get("/api/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const course = await courseCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!course) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        res.status(200).json({
          success: true,
          data: course,
        });
      } catch (error) {
        console.error("Get Course Details Error:", error);

        res.status(500).json({
          success: false,
          message: "Failed to get course details",
        });
      }
    });

    // Videos api
    app.post("/api/videos", async (req, res) => {
      try {
        const videoDetails = req.body;

        const videoDoc = {
          ...videoDetails,
          createdAt: new Date(),
        };

        const result = await videoCollection.insertOne(videoDoc);

        res.status(201).json({
          success: true,
          message: "Video added successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Video Insert Error:", error);
        res.status(500).json({
          success: false,
          message: "Server error while adding video",
        });
      }
    });

 

    // Get videos by courseId
    app.get("/api/videos/:courseId", async (req, res) => {
      try {
        const courseId = req.params.courseId;

        const videos = await videoCollection
          .find({ courseId: courseId })
          .toArray();

        res.status(200).json({
          success: true,
          data: videos,
        });
      } catch (error) {
        console.error("Get Videos By Course Error:", error);

        res.status(500).json({
          success: false,
          message: "Failed to fetch videos for this course",
        });
      }
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
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
