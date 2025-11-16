// src/services/apiService.js

// Use environment variables or a default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Helper function to handle fetch responses
 */
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

export const apiService = {

    // --- GENERIC INSTRUCTOR API CALLS (Unchanged) ---
    async getInstructors() {
        try {
            const response = await fetch(`${API_BASE_URL}/instructors`);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching instructors:', error);
            throw error;
        }
    },

    async getInstructorById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructors/${id}`);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching instructor:', error);
            throw error;
        }
    },

    // --- LUXAND FACE API CALLS (Updated) ---

    /**
     * Replaces ALL the Azure steps. This one call does everything.
     * It calls your backend's POST /instructor-faces/register route.
     */
    async registerLuxandFace(ins_id, imageBase64) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor-faces/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // The backend expects this payload:
                body: JSON.stringify({ ins_id, imageBase64 })
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error registering Luxand face:', error);
            throw error;
        }
    },

    /**
     * Gets all active faces for one instructor.
     * Calls your backend's GET /instructor-faces/instructor/:instructorId route.
     * (Make sure your backend route file matches this!)
     */
    async getInstructorFaces(instructorId) {
        try {
            // *** CHECK THIS URL ***
            // Your apiService.js has /instructor/:instructorId
            // My previous route suggestion was /:ins_id
            // Make sure your backend route matches this!
            const response = await fetch(`${API_BASE_URL}/instructor-faces/instructor/${instructorId}`);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error fetching instructor faces:', error);
            throw error;
        }
    },

    /**
     * Gets instructor details from a face UUID.
     * Calls your backend's GET /instructor-faces/face/:faceUuid route.
     */
    async getInstructorByFaceUuid(faceUuid) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor-faces/face/${faceUuid}`);
            return await handleResponse(response);
        } catch (error) {
            console.error('Error finding instructor by face UUID:', error);
            if (error.message.includes('404')) {
                return { success: false, message: 'Instructor not found for this face UUID' };
            }
            throw error;
        }
    },

    /**
     * Deletes a specific face record.
     * Calls your backend's DELETE /instructor-faces/:id route.
     */
    async deleteInstructorFace(faceId) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor-faces/${faceId}`, {
                method: 'DELETE',
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error deleting instructor face:', error);
            throw error;
        }
    },

    /**
     * NEW FUNCTION for the login/recognition page.
     * This will call a new backend route we need to create.
     */
    async recognizeLuxandFace(imageBase64) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor-faces/recognize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageBase64 })
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error recognizing face:', error);
            throw error;
        }
    }
};