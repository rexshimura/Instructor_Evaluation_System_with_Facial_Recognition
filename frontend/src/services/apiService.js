// src/services/apiService.js

// For development - adjust based on your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiService = {
  // Instructor-related API calls
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

  // Face recognition API calls
  async registerInstructorFace(ins_id, face_uuid, created_by = 'system') {
    try {
      const response = await fetch(`${API_BASE_URL}/instructor-faces/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ins_id, face_uuid, created_by })
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

  // FIXED: Updated route path to match the backend route
  async getInstructorByFaceUuid(faceUuid) {
    try {
      const response = await fetch(`${API_BASE_URL}/instructor-faces/face/${faceUuid}`);
      if (!response.ok) {
        // If 404, return success: false instead of throwing error
        if (response.status === 404) {
          return { success: false, message: 'Instructor not found for this face UUID' };
        }
        throw new Error('Failed to find instructor by face UUID');
      }
      return await response.json();
    } catch (error) {
      console.error('Error finding instructor by face UUID:', error);
      // Return structured error instead of throwing
      return {
        success: false,
        message: error.message || 'Failed to lookup instructor'
      };
    }
  },

  // NEW: Delete instructor face
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
  }
};

// Luxand Face API service (client-side only)
export const luxandService = {
  API_TOKEN: process.env.REACT_APP_LUXAND_API_TOKEN || "5a710a6aa96942afb14a221350760edc",

  async addPerson(name, image, collections) {
    const myHeaders = new Headers();
    myHeaders.append("token", this.API_TOKEN);

    const formdata = new FormData();
    formdata.append("name", name);

    if ((typeof image === "string") && (image.indexOf("https://") === 0)) {
      formdata.append("photos", image);
    } else {
      formdata.append("photos", image, "file");
    }

    formdata.append("store", "1");
    if (collections) {
      formdata.append("collections", collections);
    }

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };

    try {
      const response = await fetch("https://api.luxand.cloud/v2/person", requestOptions);
      const result = await response.json();

      console.log('🔑 Luxand addPerson raw response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // Handle different Luxand response structures
      if (result.uuid) {
        return { status: 'success', uuid: result.uuid, person: result };
      } else if (result.id) {
        return { status: 'success', uuid: result.id, person: result };
      } else {
        throw new Error('No UUID returned from Luxand. Response: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('❌ Error adding person to Luxand:', error);
      throw error;
    }
  },

  async addFace(person_uuid, image) {
    const myHeaders = new Headers();
    myHeaders.append("token", this.API_TOKEN);

    const formdata = new FormData();

    if ((typeof image === "string") && (image.indexOf("https://") === 0)) {
      formdata.append("photos", image);
    } else {
      formdata.append("photos", image, "file");
    }

    formdata.append("store", "1");

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };

    try {
      const response = await fetch(`https://api.luxand.cloud/v2/person/${person_uuid}`, requestOptions);
      const result = await response.json();

      console.log('📸 Luxand addFace raw response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return { status: 'success', result };
    } catch (error) {
      console.error('❌ Error adding face to Luxand:', error);
      throw error;
    }
  },

  async recognize(image) {
    const myHeaders = new Headers();
    myHeaders.append("token", this.API_TOKEN);

    const formdata = new FormData();

    if ((typeof image === "string") && (image.indexOf("https://") === 0)) {
      formdata.append("photo", image);
    } else {
      formdata.append("photo", image, "file");
    }

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
    };

    try {
      const response = await fetch("https://api.luxand.cloud/photo/search/v2", requestOptions);
      const result = await response.json();

      console.log('🔍 Luxand recognize raw response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // Handle different Luxand response structures
      let recognizedFaces = [];

      if (result.result && Array.isArray(result.result)) {
        recognizedFaces = result.result;
      } else if (Array.isArray(result)) {
        recognizedFaces = result;
      } else if (result.faces && Array.isArray(result.faces)) {
        recognizedFaces = result.faces;
      } else if (result.status === 'success' && Array.isArray(result.data)) {
        recognizedFaces = result.data;
      }

      console.log('👥 Processed recognized faces:', recognizedFaces);

      return {
        status: 'success',
        result: recognizedFaces,
        raw: result // Include raw response for debugging
      };
    } catch (error) {
      console.error('❌ Error recognizing face with Luxand:', error);
      throw error;
    }
  },

  // NEW: Get person details
  async getPerson(person_uuid) {
    const myHeaders = new Headers();
    myHeaders.append("token", this.API_TOKEN);

    try {
      const response = await fetch(`https://api.luxand.cloud/v2/person/${person_uuid}`, {
        method: 'GET',
        headers: myHeaders,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return { status: 'success', person: result };
    } catch (error) {
      console.error('❌ Error getting person from Luxand:', error);
      throw error;
    }
  },

  // NEW: Delete person
  async deletePerson(person_uuid) {
    const myHeaders = new Headers();
    myHeaders.append("token", this.API_TOKEN);

    try {
      const response = await fetch(`https://api.luxand.cloud/v2/person/${person_uuid}`, {
        method: 'DELETE',
        headers: myHeaders,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return { status: 'success', message: 'Person deleted successfully' };
    } catch (error) {
      console.error('❌ Error deleting person from Luxand:', error);
      throw error;
    }
  },

  // Add to apiService in apiService.js
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

  async findPersonByName(name) {
    const myHeaders = new Headers();
    myHeaders.append("token", this.API_TOKEN);

    try {
      const response = await fetch(`https://api.luxand.cloud/v2/person?name=${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: myHeaders,
      });

      const result = await response.json();

      if (response.ok) {
        // Luxand returns an array of persons
        if (Array.isArray(result)) {
          return { status: 'success', persons: result };
        }
        // Or sometimes an object with persons array
        else if (result.persons && Array.isArray(result.persons)) {
          return { status: 'success', persons: result.persons };
        }
        else {
          return { status: 'success', persons: [] };
        }
      } else {
        return { status: 'error', message: result.message || 'Failed to search persons' };
      }
    } catch (error) {
      console.error('Error finding person by name:', error);
      return { status: 'error', message: error.message };
    }
  },

  async deletePerson(person_uuid) {
    const myHeaders = new Headers();
    myHeaders.append("token", this.API_TOKEN);

    try {
      const response = await fetch(`https://api.luxand.cloud/v2/person/${person_uuid}`, {
        method: 'DELETE',
        headers: myHeaders,
      });

      if (response.ok) {
        return { status: 'success', message: 'Person deleted successfully' };
      } else {
        const result = await response.json();
        // If person not found, still consider it success (already deleted)
        if (response.status === 404) {
          return { status: 'success', message: 'Person already deleted or not found' };
        }
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error deleting person from Luxand:', error);
      // If it's a 404, still consider it success
      if (error.message.includes('404') || error.message.includes('not found')) {
        return { status: 'success', message: 'Person already deleted or not found' };
      }
      throw error;
    }
  },

  // Helper method to test Luxand connection
  async testConnection() {
    try {
      const myHeaders = new Headers();
      myHeaders.append("token", this.API_TOKEN);

      const response = await fetch("https://api.luxand.cloud/v2/person", {
        method: 'GET',
        headers: myHeaders,
      });

      if (response.ok) {
        return { status: 'success', message: 'Luxand API connection successful' };
      } else {
        const error = await response.json();
        return { status: 'error', message: error.message || 'Luxand API connection failed' };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
};

