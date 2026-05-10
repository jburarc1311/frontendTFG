export interface Usuario {
    _id:string;
    name:string;
    email:string;
    descripcion:string;
    ubicacion:string;
    role: "Admin" | "Usuario";
    active:boolean;
    photo:string;
    animales: string[];
    favoritos: string[];
    creado_en: Date;
}
