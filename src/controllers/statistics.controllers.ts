import type { Request, Response } from "express";
import { libros } from "../data/books.data.js";

export const getStatistics = (req : Request, res : Response) => {
    const total = libros.length;
    const available = libros.filter(x => x.disponible).length;
    const loaned = total - available;

    let topAuthor : string | null = null;
    let maxBooks = 0;
    libros.forEach(book => {
        const count = libros.filter(x => x.autor === book.autor).length;
        if(count > maxBooks) {
            maxBooks = count;
            topAuthor = book.autor;
        }
    });

    res.status(200).json({
        total,
        disponibles : available,
        prestados : loaned,
        autorConMasLibros : topAuthor
    });
}
