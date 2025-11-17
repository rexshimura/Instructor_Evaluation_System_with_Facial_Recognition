import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import App from './App';

// --- IMPORT AMPLIFY & CONFIGURATION ---
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
// ------------------------------------------

// --- CONFIGURE AMPLIFY ---
// Use the standard aws-exports pattern to prevent dependency conflicts.
Amplify.configure(awsExports);
// -------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);