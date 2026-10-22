import type { Request, Response } from "express"
import { changeBookById, libros, updateBooks } from "../data/books.data.js"
import { prestamos } from "../data/loans.data.js";
import type { BookT } from "../models/books.models.js";

export const getBooks = (req : Request, res : Response) => {
    res.status(200).json(libros);
}

export const getBookById = (req : Request, res : Response) => {
    const id = Number(req.params.id);

    if(!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            error : "Id must be a positive integer"
        })
        return;
    }

    const book : BookT | undefined = libros.find((x) => x.id === id);

    if(!book){
        res.status(404).json({
            error : "Can't find that book"
        })
        return;
    }

    return book;
}

export const postBook = (req : Request, res : Response) => {
    if(!validateBookPost(req, res)) {
        return;
    }

    const newBook : BookT = {
        id : generateUniqueId(),
        titulo : req.body.titulo.trim(),
        autor : req.body.autor.trim(),
        año : getYear(req.body),
        disponible : true,
    }
    libros.push(newBook)
    res.status(201).json(newBook)
}

export const putBook = (req : Request, res : Response) => {
    const book = getBookById(req, res);
    if(!book) {
        return;
    }

    if(!validateBookPut(req, res, book)) {
        return;
    }

    const newBook : BookT = {
        id : book.id,
        titulo : req.body.titulo.trim(),
        autor : req.body.autor.trim(),
        año : getYear(req.body),
        disponible : req.body.disponible,
    }
    changeBookById(book.id, newBook);
    res.status(200).json(newBook);
}

export const patchBook = (req : Request, res : Response) => {
    const book = getBookById(req, res);
    if(!book) {
        return;
    }

    if(!validateBookPatch(req, res, book)) {
        return;
    }

    const year = getYear(req.body);
    const newBook : BookT = {
        ...book,
        titulo : req.body.titulo !== undefined ? req.body.titulo.trim() : book.titulo,
        autor : req.body.autor !== undefined ? req.body.autor.trim() : book.autor,
        año : year !== undefined ? year : book.año,
        disponible : req.body.disponible !== undefined ? req.body.disponible : book.disponible
    }
    changeBookById(book.id, newBook);
    res.status(200).json(newBook);
}

export const deleteBook = (req : Request, res : Response) => {
    const book = getBookById(req, res);
    if(!book) {
        return;
    }

    if(!book.disponible || hasActiveLoan(book.id)) {
        res.status(409).json({
            error : "Can't delete a loaned book"
        })
        return;
    }

    updateBooks(libros.filter(x => x.id !== book.id))
    res.status(200).json({
        message : "Book deleted"
    })
}

const validateBookPost = (req : Request, res : Response) => {
    if(!req.body) {
        res.status(400).json({
            error : "Invalid request"
        })
        return false;
    }
    if(req.body.titulo === undefined || req.body.autor === undefined || getYear(req.body) === undefined) {
        res.status(400).json({
            error : "Missing fields: titulo, autor and anio are required"
        })
        return false;
    }
    if(!validateFieldTypes(req, res)) {
        return false;
    }
    if(bookExists(req.body.titulo.trim(), req.body.autor.trim())) {
        res.status(409).json({
            error : "A book with the same title and author already exists"
        })
        return false;
    }
    return true;
}

const validateBookPut = (req : Request, res : Response, book : BookT) => {
    if(!req.body) {
        res.status(400).json({
            error : "Invalid request"
        })
        return false;
    }
    if(req.body.titulo === undefined || req.body.autor === undefined || getYear(req.body) === undefined || req.body.disponible === undefined) {
        res.status(400).json({
            error : "Missing fields: titulo, autor, anio and disponible are required"
        })
        return false;
    }
    return validateUpdate(req, res, book, req.body.titulo.trim(), req.body.autor.trim());
}

const validateBookPatch = (req : Request, res : Response, book : BookT) => {
    if(!req.body) {
        res.status(400).json({
            error : "Invalid request"
        })
        return false;
    }
    if(req.body.titulo === undefined && req.body.autor === undefined && getYear(req.body) === undefined && req.body.disponible === undefined) {
        res.status(400).json({
            error : "At least one field must be given: titulo, autor, anio or disponible"
        })
        return false;
    }
    if(!validateFieldTypes(req, res)) {
        return false;
    }
    const titulo = req.body.titulo !== undefined ? req.body.titulo.trim() : book.titulo;
    const autor = req.body.autor !== undefined ? req.body.autor.trim() : book.autor;
    return validateUpdate(req, res, book, titulo, autor);
}

const validateUpdate = (req : Request, res : Response, book : BookT, titulo : string, autor : string) => {
    if(req.body.id !== undefined && req.body.id !== book.id) {
        res.status(400).json({
            error : "The id can't be modified"
        })
        return false;
    }
    if(!validateFieldTypes(req, res)) {
        return false;
    }
    if(bookExists(titulo, autor, book.id)) {
        res.status(409).json({
            error : "A book with the same title and author already exists"
        })
        return false;
    }
    if(req.body.disponible !== undefined && req.body.disponible === hasActiveLoan(book.id)) {
        res.status(409).json({
            error : "Availability depends on the loans, use /prestar or /devolver"
        })
        return false;
    }
    return true;
}

const validateFieldTypes = (req : Request, res : Response) => {
    const { titulo, autor, disponible } = req.body;
    const year = getYear(req.body);

    if(titulo !== undefined && (typeof titulo !== "string" || titulo.trim() === "")) {
        res.status(400).json({
            error : "titulo must be a non empty string"
        })
        return false;
    }
    if(autor !== undefined && (typeof autor !== "string" || autor.trim() === "")) {
        res.status(400).json({
            error : "autor must be a non empty string"
        })
        return false;
    }
    if(year !== undefined && !Number.isInteger(year)) {
        res.status(400).json({
            error : "anio must be an integer"
        })
        return false;
    }
    if(disponible !== undefined && typeof disponible !== "boolean") {
        res.status(400).json({
            error : "disponible must be a boolean"
        })
        return false;
    }
    return true;
}


const getYear = (body : any) => {
    return body.anio !== undefined ? body.anio : body.año;
}

const bookExists = (title : string, author : string, excludedId? : number) => {
    return libros.some((x) => x.autor === author && x.titulo === title && x.id !== excludedId);
}

const hasActiveLoan = (bookId : number) => {
    return prestamos.some(x => x.libroId === bookId && x.fechaDevolucion === null);
}

let lastId : number = libros.reduce((max, x) => Math.max(max, x.id), 0);

const generateUniqueId = () : number => {
    lastId += 1;
    return lastId;
}
