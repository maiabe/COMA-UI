import express, {Request,Response,Application} from 'express';
const app:Application = express();
const PORT = process.env.PORT || 8000;

app.use(express.static('dist'));


app.listen(PORT, ():void => {
  console.log(`Server Running here 👉 https://localhost:${PORT}`);
});