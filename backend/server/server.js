// server.js - FIXED VERSION
import express from 'express';
import session from 'express-session';
import cors from 'cors';

import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import moderatorRoutes from './routes/moderatorRoutes.js';
import instructorSubjectRoutes from './routes/instructorSubjectRoutes.js';
import logRoutes from './routes/logRoutes.js';
import studentSectionRoutes from './routes/studentSectionRoutes.js';
import sectionSubjectInstructorRoutes from './routes/sectionSubjectInstructorRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: 'my_super_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

// Mount routes
app.use('/students', studentRoutes);
app.use('/instructors', instructorRoutes);
app.use('/subjects', subjectRoutes);
app.use('/sections', sectionRoutes);
app.use('/evaluations', evaluationRoutes);
app.use('/moderators', moderatorRoutes);
app.use('/instructor-subject', instructorSubjectRoutes);
app.use('/logs', logRoutes);
app.use('/student-sections', studentSectionRoutes);
app.use('/section-assignments', sectionSubjectInstructorRoutes);

// Health check
app.get('/', (req, res) =>
  res.json({
    status: 'ok',
    message: 'Faculty Evaluation System API is running',
    timestamp: new Date().toISOString(),
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// ✅ 404 handler (FIXED)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
