import type { BookT } from "../models/books.models.js";

export let libros : BookT[] = [
  { id: 1, titulo: "Clean Code", autor: "Robert C. Martin", año: 2008, disponible: true },
  { id: 2, titulo: "El Quijote", autor: "Miguel de Cervantes", año: 1605, disponible: true },
  { id: 3, titulo: "Sapiens", autor: "Yuval Noah Harari", año: 2011, disponible: false }
];

export const updateBooks = (newBooks : BookT[]) => {
  libros = newBooks;
}
 
export const changeBookById = (id: number, newBook : BookT) => {
  libros = libros.map(x => x.id === id ? newBook : x);
}