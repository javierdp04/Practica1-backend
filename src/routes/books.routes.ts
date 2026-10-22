import { Router } from "express";
import { deleteBook, getBookById, getBooks, patchBook, postBook, putBook } from "../controllers/books.controllers.js";

const router = Router();

router.get("/", getBooks);
router.post("/", postBook);

router.get("/:id", (req, res) => {
    const book = getBookById(req, res);
    if(!book) {
        return;
    }
    res.status(200).json(book);
});
router.put("/:id", putBook);
router.patch("/:id", patchBook);
router.delete("/:id", deleteBook);

export default router;
