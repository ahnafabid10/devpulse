import express, { type Application, type Request, type Response } from 'express'

const app: Application = express();
const port = 5000;


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


app.post('/', async(req: Request, res: Response) =>{
  const {name, email, password, role} = req.body
  res.status(200).json({
    massage : "Post Created Successful",
    data: {name, email, password, role}
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});