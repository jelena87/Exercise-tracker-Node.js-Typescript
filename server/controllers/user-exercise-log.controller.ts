let db = require("../../db");
import { Request, Response } from 'express';
import { Exercise } from '../models/exercise.model';
import { UserExerciseLog } from '../models/user-exercise-log.model';
import { User } from '../models/user.model';
import { getUserById } from './user.controller';

export const getUserExerciseLog = (req: Request, res: Response) => {
    const { limit } = req.query;
    
	// if limit is 0 or undefined return first 100 records as limit
	let nonNullLimit = limit === '0' || limit === undefined ? 100 : limit;

    // define what data you need from db based on req.query
    const sql = sqlDeffinition(req);
    const params = getSqlParams(req, nonNullLimit);

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
			const log: Exercise[] = data.filter((data: any) => {
				let date = new Date(data.date);
                data.date = date.toDateString();
				return data.date;
			}).map((l: any) => ({
                duration: l.duration,
				description: l.description,
				date: l.date
			}));
            const exerciseLog = new UserExerciseLog(data[0].id, data[0].username, data[0].count, log);
			res.status(200);
			res.json(exerciseLog);
		}	
	});
}

function sqlDeffinition(req: Request) {
    const { from, to } = req.query;
    let sql;
    if (from && to) {
        sql =
        `SELECT (
            SELECT COUNT(*) FROM exercise WHERE userId = :userId) as count, u.id, u.username, e.*
        FROM exercise e
        JOIN user u ON u.id = e.userId
        WHERE u.id = :userId
        AND e.date between ? and ?
        ORDER BY date(e.date) ASC
        LIMIT ?`;
    } else if (from) {
        sql =
        `SELECT (
            SELECT COUNT(*) FROM exercise WHERE userId = :userId) as count, u.id, u.username, e.*
        FROM exercise e
        JOIN user u ON u.id = e.userId
        WHERE u.id = :userId
        AND e.date >= ?
        ORDER BY date(e.date) ASC
        LIMIT ?`;
    } else if (to) {
        sql =
        `SELECT (
            SELECT COUNT(*) FROM exercise WHERE userId = :userId) as count, u.id, u.username, e.*
        FROM exercise e
        JOIN user u ON u.id = e.userId
        WHERE u.id = :userId
        AND e.date <= ?
        ORDER BY date(e.date) ASC
        LIMIT ?`;
    } else {
        sql =
        `SELECT (
            SELECT COUNT(*) FROM exercise WHERE userId = :userId) as count, u.id, u.username, e.*
        FROM exercise e
        JOIN user u ON u.id = e.userId
        WHERE u.id = :userId
        ORDER BY date(e.date) ASC
        LIMIT ?`;
    }
    return sql;
}

function getSqlParams(req: Request, nonNullLimit: any) {
    const { from, to } = req.query;
    let params;
    if (from && to) {
        params = [req.params._id, from, to, nonNullLimit];
    } else if (from) {
        params = [req.params._id, from, nonNullLimit];
    } else if (to) {
        params = [req.params._id, to, nonNullLimit];
    } else {
        params = [req.params._id, nonNullLimit];
    }
    return params;
}