export type LoanT = {
    id : number,
    libroId : number,
    usuario : string,
    fechaPrestamo : string,
    fechaDevolucion : string | null,
}