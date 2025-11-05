import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';


import authRouter from './routes/auth';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';
import usersRouter from './routes/users';


const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));


app.get('/', (req, res) => res.json({ ok: true }));


app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);


app.use((err: any, req: any, res: any, next: any) => {
console.error(err);
res.status(err.status || 500).json({ error: err.message || 'Server error' });
});


const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API listening on ${port}`));