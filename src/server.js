require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require('method-override');
const { Server } = require('socket.io');

const { connectDatabase } = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');
const { attachUser } = require('./middleware/auth');

const webRoutes = require('./routes/web');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

connectDatabase(process.env.MONGO_URI);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(globalLimiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(csrf({ cookie: true }));
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(attachUser);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', webRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

io.on('connection', (socket) => {
  socket.emit('message', { text: 'Connected to Rivals Watch updates.' });
});

app.use((err, _req, res, _next) => {
  if (err.code === 'EBADCSRFTOKEN') return res.status(403).send('Invalid CSRF token.');
  return res.status(500).send('Internal server error.');
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Rivals Watch running on port ${PORT}`);
});
