import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/apiRouter";
import { sendSuccess } from "./utils/network";
import morgan from "morgan";
import path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: "*",
};


app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get("/", (req, res) => {
  sendSuccess(res, {message: "API Online"});
});

app.use('/api', apiRoutes)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
