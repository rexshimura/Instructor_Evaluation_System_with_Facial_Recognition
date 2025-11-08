import 'dotenv/config'; // Loads .env file immediately
import express from 'express';
import session from 'express-session';
import cors from 'cors';

// Import all existing routes
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
import instructorFaceRoutes from './routes/instructorFaceRoutes.js';

// Import the new Azure-specific routes
import azureRoutes from './routes/azureRoutes.js';

const app = express();

app.use(cors());
// Increased limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(
    session({
        secret: 'my_super_secret_key',
        resave: false,
        saveUninitialized: true,
    })
);

// --- Mount All Routes ---
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
app.use('/instructor-faces', instructorFaceRoutes);

// Mount the new Azure Routes under the '/azure' path
app.use('/azure', azureRoutes);


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

// 404 handler
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