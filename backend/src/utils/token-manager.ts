import jwt from "jsonwebtoken";

export const createToken = (id: string, email: string, expiresIn:any) => {
    const payload = {id, email};

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn });
    return token;
}