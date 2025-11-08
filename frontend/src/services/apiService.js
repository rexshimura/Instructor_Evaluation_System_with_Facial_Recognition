// src/services/apiService.js

// For development - adjust based on your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiService = {
    // --- INSTRUCTOR API CALLS ---
    async getInstructors() {
        try {
            const response = await fetch(`${API_BASE_URL}/instructors`);
            if (!response.ok) throw new Error('Failed to fetch instructors');
            return await response.json();
        } catch (error) {
            console.error('Error fetching instructors:', error);
            throw error;
        }
    },

    async getInstructorById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructors/${id}`);
            if (!response.ok) throw new Error('Failed to fetch instructor');
            return await response.json();
        } catch (error) {
            console.error('Error fetching instructor:', error);
            throw error;
        }
    },

    // --- FACE DATABASE API CALLS (Local DB) ---
    async registerInstructorFace(ins_id, face_uuid, person_id_azure, created_by = 'system') {
        try {
            // Note: Ensure your backend's /instructor-faces/register endpoint accepts 'person_id_azure'
            const response = await fetch(`${API_BASE_URL}/instructor-faces/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ins_id, face_uuid, person_id_azure, created_by })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to register face' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error registering instructor face:', error);
            throw error;
        }
    },

    async getInstructorFaces(instructorId) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor-faces/instructor/${instructorId}`);
            if (!response.ok) throw new Error('Failed to fetch instructor faces');
            return await response.json();
        } catch (error) {
            console.error('Error fetching instructor faces:', error);
            throw error;
        }
    },

    async getInstructorByFaceUuid(faceUuid) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor-faces/face/${faceUuid}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return { success: false, message: 'Instructor not found for this face UUID' };
                }
                throw new Error('Failed to find instructor by face UUID');
            }
            return await response.json();
        } catch (error) {
            console.error('Error finding instructor by face UUID:', error);
            return {
                success: false,
                message: error.message || 'Failed to lookup instructor'
            };
        }
    },

    async deleteInstructorFace(faceId) {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor-faces/${faceId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete instructor face');
            return await response.json();
        } catch (error) {
            console.error('Error deleting instructor face:', error);
            throw error;
        }
    },

    // --- NEW AZURE FACE API CALLS (Backend Proxy) ---
    async ensurePersonGroupExists() {
        const response = await fetch(`${API_BASE_URL}/azure/group/ensure-exists`, { method: 'POST' });
        if (!response.ok) throw new Error(`Azure Error: ${response.statusText}`);
        return await response.json();
    },

    async createAzurePerson(ins_id, name) {
        const response = await fetch(`${API_BASE_URL}/azure/person/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userData: ins_id.toString() })
        });
        if (!response.ok) throw new Error(`Azure Error: ${response.statusText}`);
        return await response.json();
    },

    async deletePersonFaces(personId, faceIds) {
        const response = await fetch(`${API_BASE_URL}/azure/person/delete-faces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personId, faceIds })
        });
        if (!response.ok) throw new Error(`Azure Error: ${response.statusText}`);
        return await response.json();
    },

    async addPersonFace(personId, base64Image) {
        const response = await fetch(`${API_BASE_URL}/azure/person/add-face`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personId, base64Image })
        });
        if (!response.ok) throw new Error(`Azure Error: ${response.statusText}`);
        return await response.json();
    },

    async trainPersonGroup() {
        const response = await fetch(`${API_BASE_URL}/azure/group/train`, { method: 'POST' });
        if (!response.ok) throw new Error(`Azure Error: ${response.statusText}`);
        return await response.json();
    },
    async identifyFace(base64Image) {
        const response = await fetch(`${API_BASE_URL}/azure/identify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image })
        });
        if (!response.ok) throw new Error(`Azure Error: ${response.statusText}`);
        return await response.json();
    },
};