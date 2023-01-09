let db = require("../../db");
import { Request, Response } from 'express';
import { User } from '../models/user.model';

export const getAllUsers = (req: Request, res: Response) => {
    const sql =
    `SELECT
    user.id AS _id,
    user.username AS username
    FROM user`;
    const params: never[] = [];
    db.all(sql, params, (err: { message: any; }, users: User[]) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.status(200);
        res.json(users);
    });
}

export const addNewUser = (req: Request, res: Response) => {
    let errors = [];
	if (!req.body.username){
		errors.push("No username specified");
	}
	if (errors.length){
		res.status(400).json({"error": errors.join(",")});
		return;
	}
	let data = {
		username: req.body.username
	};
	const sql ='INSERT INTO user (username) VALUES (?)'
	const params = [ data.username ]
	db.run(sql, params, function (this: any, err: Error) {
		if (err){
			res.status(400).json({"error": err.message});
			return;
		}
        const user = new User(this.lastID, data.username);
		res.status(201);
        res.json(user);
	});
}

export const getUserById = (id: string, res: Response) => new Promise((resolve) => {
	const sql = `SELECT username, id FROM user WHERE id = ?`;
	const params = id;
	db.all(sql, params, (err: Error, data: User[]) => {
		if (err || data.length === 0) {
			res.status(400).json({'error': 'No user in a db with that id'});
			return;
		}
		resolve(data[0]);
	})
})
