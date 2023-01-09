import { Exercise } from "./exercise.model";
import { User } from "./user.model";

export class UserExerciseLog extends User {
    logs: Exercise[];
	count: number;
	
    constructor(_id: number, username: string, count: number, logs: Exercise[]) {
		super(_id, username);
		this.count = count;
		this.logs = logs;
    }
}