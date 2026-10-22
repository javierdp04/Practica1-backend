import type { Request, Response } from "express";
import { prestamos } from "../data/loans.data.js";
import { getBookById } from "./books.controllers.js";
import { changeBookById } from "../data/books.data.js";
import type { LoanT } from "../models/loans.models.js";

const MAX_ACTIVE_LOANS = 2;

export const getLoans = (req : Request, res : Response) => {
    res.status(200).json(prestamos);
}

export const getLoansHistoryOfBook = (req : Request, res : Response) => {
    const book = getBookById(req, res);
    if(!book) {
        return;
    }
    res.status(200).json(prestamos.filter(x => x.libroId === book.id));
}

export const loanBook = (req : Request, res : Response) => {
    const user = req.body?.usuario;

    if(typeof user !== "string" || user.trim() === "") {
        res.status(400).json({
            error : "usuario must be a non empty string"
        })
        return;
    }

    const book = getBookById(req, res);
    if(!book) {
        return;
    }
    if(!book.disponible) {
        res.status(409).json({
            error : "The book is already loaned"
        })
        return;
    }

    const activeLoans = prestamos.filter(x => x.usuario === user.trim() && x.fechaDevolucion === null);
    if(activeLoans.length >= MAX_ACTIVE_LOANS) {
        res.status(409).json({
            error : `User can't have more than ${MAX_ACTIVE_LOANS} books loaned at the same time`
        })
        return;
    }

    const newLoan : LoanT = {
        id : generateUniqueId(),
        libroId : book.id,
        usuario : user.trim(),
        fechaPrestamo : getCurrentDate(),
        fechaDevolucion : null
    }
    prestamos.push(newLoan);
    changeBookById(book.id, { ...book, disponible : false });

    res.status(201).json(newLoan);
}

export const returnBook = (req : Request, res : Response) => {
    const book = getBookById(req, res);
    if(!book) {
        return;
    }
    if(book.disponible) {
        res.status(409).json({
            error : "The book is not loaned"
        })
        return;
    }

    const loan = prestamos.find(x => x.libroId === book.id && x.fechaDevolucion === null);
    if(!loan) {
        res.status(404).json({
            error : "Active loan not found"
        })
        return;
    }

    loan.fechaDevolucion = getCurrentDate();
    changeBookById(book.id, { ...book, disponible : true });

    res.status(200).json(loan);
}


const getCurrentDate = () : string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

let lastId : number = prestamos.reduce((max, x) => Math.max(max, x.id), 0);

const generateUniqueId = () : number => {
    lastId += 1;
    return lastId;
}
