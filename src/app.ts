import express, { type Application, type Request, type Response } from 'express';
import { userRouter } from './modules/user/user.route';
import { issueRouter } from './modules/issues/issues.route';
import { authRouter } from './modules/auth/auth.route';

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


app.use('/api/auth', userRouter)
app.use('/api/issue', issueRouter)
app.use('/api/auth', authRouter)
export default app