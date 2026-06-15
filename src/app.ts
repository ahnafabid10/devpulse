import express, { type Application, type Request, type Response } from 'express';
import { userRouter } from './modules/user/user.route';

const app: Application = express();


app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({extended: true}))
// app.use(express.cors())


app.get('/', (req: Request, res: Response) => {
  // res.send('Hello World!');
  res.status(200).json({
    "massage" : "Express Server",
    "author" : "Devpulse"
  })
});


app.use('/api/users', userRouter)

export default app