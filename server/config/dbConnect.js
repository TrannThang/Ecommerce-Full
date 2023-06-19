const { default: mongoose } = require("mongoose");
mongoose.set("strictQuery", true);

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    if (conn.connection.readyState === 1)
      console.log("DB connection is successfully");
    else console.log("DB Connecting");
  } catch (error) {
    console.log("DB Connection is failed");
    throw new Error("s");
  }
};

module.exports = dbConnect;
