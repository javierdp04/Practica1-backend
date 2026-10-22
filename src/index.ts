import express  from "express";
import booksRouter from "./routes/books.routes.js"
import loansRouter from "./routes/loans.routes.js"
import statisticsRouter from "./routes/statistics.routes.js"
const app = express();

app.use(express.json());
app.use("/libros", booksRouter)
app.use("/", loansRouter)
app.use("/estadisticas", statisticsRouter)

app.listen(3000, () => {
    console.log("Server running on port 3000");
}) 