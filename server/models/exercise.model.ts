export class Exercise {
    userId: number;
	duration: number;
	description: string;
	date: string;
    constructor(userId:number, duration: number, description: string, date: string) {
		this.userId = userId;
		this.duration = duration;
		this.description = description;
		this.date = date;
    }
}