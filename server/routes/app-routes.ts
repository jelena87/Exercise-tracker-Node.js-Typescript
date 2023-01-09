import express, { Request, Response } from 'express';
import path from 'path';
import { addExercise } from '../controllers/exercise.controller';
import { getUserExerciseLog } from '../controllers/user-exercise-log.controller';
import { getAllUsers, addNewUser } from '../controllers/user.controller';

const routes = express.Router();

routes.get('/', (req: Request, res: Response) => {
  res.sendFile(path.resolve('views/index.html'));
});

routes.get('/api/users', getAllUsers);

routes.post('/api/users', addNewUser);

routes.post('/api/users/:_id/exercises', addExercise);

routes.get('/api/users/:_id/logs', getUserExerciseLog);

export default routes;