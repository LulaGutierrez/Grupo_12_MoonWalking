const { hashSync, compareSync } = require("bcryptjs");
const db = require("../database/models");
const { sendSequelizeError, createError } = require("../helpers/createError");
const { sign } = require("jsonwebtoken");

module.exports = {
    signUp: async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                dni,
                email,
                password,
            } = req.body;

            const { id, rolId } = await db.User.create({
                firstName: firstName && firstName.trim(),
                lastName: lastName && lastName.trim(),
                email: email && email.trim(),
                password: password && password.trim(),
                dni: dni && dni.trim(),
                avatar: req.file && req.file.filename,
                rolId: 2,
            });

            await db.User.create({
                userId: id,
            });

            const token = sign(
                {
                    id,
                    rolId,
                },
                process.env.SECRET_KEY_JWT,
                {
                    expiresIn: "1h",
                }
            );

            return res.status(201).json({
                ok: true,
                status: 201,
                data: token,
            });
        } catch (error) {
            let errors = sendSequelizeError(error);
            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
        }
    },
    signIn: async (req, res) => {
        try {
            const { email, password } = req.body;

            if(!email || !password) {
                throw createError(404, 'Se require email y password');
            }

            let user = await db.User.findOne({
                where : {
                    email
                }
            });

          /*   if(!user){
                throw createError(401, 'El usuario no se encuentra registrado');
            }
            if(!compareSync(password, user.password)){
                throw createError(401, 'La contraseña es incorrecta');
            } */

            if(!user || !compareSync(password, user.password)){
                throw createError(401, 'Credenciales inválidas');
            }

            const token = sign(
                {
                    id : user.id,
                    rolId : user.rolId,
                },
                process.env.SECRET_KEY_JWT,
                {
                    expiresIn: "1h",
                }
            );

            return res.status(200).json({
                ok: true,
                status: 200,
                data: token,
            });


        } catch (error) {
            let errors = sendSequelizeError(error);
            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
        }
    },
};