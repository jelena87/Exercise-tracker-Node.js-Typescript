let db = require("../../db");
import { Request, Response } from 'express';
import { Exercise } from '../models/exercise.model';

export const addExercise = (req: Request, res: Response) => {
    let errors = [];
	if (!req.params._id){
		errors.push("No userId specified");
	}
	if (!req.body.description){
		errors.push("No description specified");
	}
	if (!req.body.duration){
		errors.push("No duration specified");
	}
	// if date is not set use today's date
	if (!req.body.date){
		const today = new Date(); 
		req.body.date = today.toDateString();
	} else {
		if (!isValidDate(req.body.date)) {
			errors.push("Please enter date in a format YYYY-MM-DD");
		}
		const inputDate = new Date(req.body.date); 
		req.body.date = inputDate.toDateString();
	}
	if (errors.length){
		res.status(400).json({"error": errors.join(",")});
		return;
	}
	let data = {
		userId: +req.params._id,
		description: req.body.description,
		duration: +req.body.duration,
		date: req.body.date
	};
	const sql =
	`INSERT INTO exercise 
	(userId, duration, description, date)
	VALUES (?, ?, ?, ?)`;
	const params =[req.params._id, data.duration, data.description, data.date]
	db.run(sql, params, function (err: Error) {
		if (err){
			res.status(400).json({"error": err.message});
			return;
		}
        const exercise = new Exercise(data.userId, data.duration, data.description, data.date)
        res.status(201);
		res.json(exercise);
	});
}

function isValidDate(date: string | any) {
	const matches = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
	if (matches == null) return false;
	const d: number = +matches[3];
    const m: number = +matches[2] - 1;
    const y: number = +matches[1];
  
	let composedDate = new Date(y, m, d);
	return ((composedDate.getMonth() == m) &&
			(composedDate.getDate() == d) &&
			(composedDate.getFullYear() == y));
}