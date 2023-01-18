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
    let formattedDate;
	// if date is not set use today's date
	if (!req.body.date){
		const today = new Date(); 
        const year = today.toLocaleString("default", { year: "numeric" });
        const month = today.toLocaleString("default", { month: "2-digit" });
        const day = today.toLocaleString("default", { day: "2-digit" });
        formattedDate = year + "-" + month + "-" + day;
	} else {
		if (!isValidDate(req.body.date)) {
			errors.push("Please enter date in a format YYYY-MM-DD");
		}
        formattedDate = req.body.date;
	}
	if (errors.length){
		res.status(400).json({"error": errors.join(",")});
		return;
	}
	let data = {
		userId: +req.params._id,
		description: req.body.description,
		duration: +req.body.duration,
		date: formattedDate
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
        // saved date string format YYYY-MM-DD transform with toDateString method to achieve expected
        // output
        const inputDate = new Date(data.date); 
		const date = inputDate.toDateString();
        const exercise = new Exercise(data.userId, data.duration, data.description, date);
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