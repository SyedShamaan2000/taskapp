const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const app = require("./app")
const port = process.env.PORT || 3000

//Connect DB
const url = process.env.MONGODB_URL
mongoose.connect(url)
const connection = mongoose.connection
connection.once("open", () => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
  console.log("DB connected")
})
