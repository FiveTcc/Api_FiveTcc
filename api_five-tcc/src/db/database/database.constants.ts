export const DRIZZLE = Symbol('DRIZZLE');

//export const DATABASE_URL = 'mysql://root:@localhost:3306/bd_tcc_des_225_ocorrencia';
export const DATABASE_URL = process.env.DATABASE_URL!;