import { Router } from "express";
import { getLoans, getLoansHistoryOfBook, loanBook, returnBook } from "../controllers/loans.controllers.js";

const router = Router();

router.get("/prestamos", getLoans);
router.get("/libros/:id/prestamos", getLoansHistoryOfBook);
router.post("/libros/:id/prestar", loanBook);
router.post("/libros/:id/devolver", returnBook);

export default router;
