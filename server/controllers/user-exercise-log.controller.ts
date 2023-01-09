let db = require("../../db");
import { Request, Response } from 'express';
import { UserExerciseLog } from '../models/user-exercise-log.model';
import { User } from '../models/user.model';
import { getUserById } from './user.controller';

export const getUserExerciseLog = (req: Request, res: Response) => {
    const { from, to, limit } = req.query;
	let fromDate: number;
	let toDate: number;
	// if limit is 0 or undefined return first 100 records as limit
	let nonNullLimit = limit === '0' || limit === undefined ? 100 : limit;

	// sql needs to return count of all exercises record even when limit is set
	const sql =
	`SELECT (
		SELECT COUNT(*) FROM exercise WHERE userId = :userId) as count, u.id, u.username, e.*
	FROM exercise e
	JOIN user u ON u.id = e.userId
	WHERE u.id = :userId
	LIMIT ?`;
	const params = [req.params._id, nonNullLimit];
	db.all(sql, params, async (err: Error, data: UserExerciseLog[]) => {
		if (err) {
			res.status(400).json({'error': 'There is no exercises logs for that user!'});
			return;
		}
		// if there is no user with exercises check if user exist in db
		if (data.length === 0) {
			const result: User = await getUserById(req.params._id, res) as User;
			res.status(200);
			res.json({'id': result.id, 'username': result.username, 'count': 0, "log": []});
		} else {
			const log = data.filter((data: any) => {
				let date = new Date(data.date);
                const exerciseDate = date.getTime();
                if(from){
                    fromDate = transformDate(from, exerciseDate);
                }
                if(to){
                    toDate = transformDate(to, exerciseDate)
                }
                if (fromDate && toDate) {
                    return (exerciseDate >= fromDate && exerciseDate <= toDate);
                } else if (fromDate) {
                    return exerciseDate >= fromDate;
                } else if (toDate) {
                    return exerciseDate <= toDate
                } 
				return data.date;
			}).map((l: any) => ({
                duration: l.duration,
				description: l.description,
				date: l.date
			}));
			res.status(200);
			res.json({'_id': data[0].id, 'username': data[0].username, 'count': data[0].count, "log": log});
		}	
	});
}

function transformDate(date: string | any, exerciseDate: number) {
    const matches = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
    if (matches === null) {
        return exerciseDate;
    }
	const d: number = +matches![3];
    const m: number = +matches![2] - 1;
    const y: number = +matches![1];
  
	let composedDate = new Date(y, m, d);
    return composedDate.getTime();
}