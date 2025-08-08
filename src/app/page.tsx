
"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, addDoc, collection, onSnapshot } from 'firebase/firestore';

// ===========================================================================
// *** FIX: Using global variables provided by the environment ***
// This automatically fetches the correct Firebase configuration and project ID.
// ===========================================================================
const firebaseConfig = {
  "projectId": "featherfind-mf7x1",
  "appId": "1:1037568735635:web:74688b9d8e5abd50011066",
  "storageBucket": "featherfind-mf7x1.firebasestorage.app",
  "apiKey": "AIzaSyARzWAauCc_ggCMhj1PdEQ-fX4tOdDp_98",
  "authDomain": "featherfind-mf7x1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1037568735635"
};
const projectId = 'featherfind-mf7x1';
const initialAuthToken = null;

// Utility function to make the Gemini API call with structured JSON response
async function geminiApiCall(prompt: string) {
  let chatHistory = [{
    role: "user",
    parts: [{
      text: prompt
    }]
  }];
  const payload = {
    contents: chatHistory,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          "guesses": {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          }
        },
        "propertyOrdering": ["guesses"]
      }
    }
  };
  const apiKey = "AIzaSyARzWAauCc_ggCMhj1PdEQ-fX4tOdDp_98";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  let response;
  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.status !== 429) {
        break;
      }
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    } catch (error) {
      console.error("Fetch failed, retrying...", error);
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }

  if (!response || response.status === 429) {
    throw new Error('Gemini API call failed after multiple retries.');
  }

  const result = await response.json();

  if (result.candidates && result.candidates.length > 0 &&
      result.candidates[0].content && result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0) {
    return JSON.parse(result.candidates[0].content.parts[0].text);
  } else {
    throw new Error('Gemini API response was malformed or empty.');
  }
}

// Data for our expanded static bird database
const staticBirdData = [
  {
    name: 'American Robin',
    description: 'A plump, familiar songbird with a distinctive reddish-orange breast. It is the state bird of Connecticut, Michigan, and Wisconsin.',
    imageUrl: 'https://placehold.co/400x300/4F46E5/FFFFFF?text=American+Robin'
  },
  {
    name: 'Northern Cardinal',
    description: 'A vibrant red bird with a crest and a black mask around its beak. Males are bright red, while females are a duller reddish-brown.',
    imageUrl: 'https://placehold.co/400x300/DC2626/FFFFFF?text=Northern+Cardinal'
  },
  {
    name: 'Blue Jay',
    description: 'A noisy, intelligent bird with a prominent blue, black, and white plumage. They are known for mimicking the calls of other birds.',
    imageUrl: 'https://placehold.co/400x300/3B82F6/FFFFFF?text=Blue+Jay'
  },
  {
    name: 'House Sparrow',
    description: 'A small, brown and gray bird with a thick conical beak, common in urban areas. They are highly adaptable and can be found almost anywhere people live.',
    imageUrl: 'https://placehold.co/400x300/71717A/FFFFFF?text=House+Sparrow'
  },
  {
    name: 'Ruby-throated Hummingbird',
    description: 'A tiny, iridescent green hummingbird with a male boasting a vibrant red throat patch. It is the only hummingbird species that regularly breeds in eastern North America.',
    imageUrl: 'https://placehold.co/400x300/EF4444/FFFFFF?text=Ruby-throated+Hummingbird'
  },
  {
    name: 'Mourning Dove',
    description: 'A graceful, slender-tailed, small-headed dove. Their mournful cooing is a familiar sound across North America.',
    imageUrl: 'https://placehold.co/400x300/6366F1/FFFFFF?text=Mourning+Dove'
  },
  {
    name: 'Common Grackle',
    description: 'A lanky blackbird with a long tail and a shiny, iridescent body. They are often found in large flocks, especially during migration.',
    imageUrl: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Common+Grackle'
  },
  {
    name: 'American Crow',
    description: 'A large, intelligent, all-black bird with a distinctive caw. They are social birds and can be found in a variety of habitats.',
    imageUrl: 'https://placehold.co/400x300/000000/FFFFFF?text=American+Crow'
  },
];

// Reusable Modal Component
const Modal = ({ isOpen, onClose, children }: {isOpen: boolean, onClose: () => void, children: React.ReactNode}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto transform transition-all duration-300 scale-95 md:scale-100">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Main App Component
const App = () => {
  const [activePage, setActivePage] = useState('explore');
  const [selectedBird, setSelectedBird] = useState(null);

  const [db, setDb] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    // Check if Firebase config is provided by the environment
    if (!Object.keys(firebaseConfig).length) {
      console.error("Firebase config is missing from the environment. Please check your project settings.");
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestore);

      const authStateListener = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase auth error:", error);
          }
        }
        setFirebaseInitialized(true);
      });

      return () => authStateListener();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-['Alegreya']">
      <Header setActivePage={setActivePage} setSelectedBird={setSelectedBird} />
      <main className="flex-1 p-4 md:p-8">
        {activePage === 'explore' && !selectedBird && <ExploreBirds setSelectedBird={setSelectedBird} />}
        {activePage === 'explore' && selectedBird && <BirdDetails bird={selectedBird} />}
        {activePage === 'guesser' && <AIBirdGuesser />}
        {activePage === 'sightings' && firebaseInitialized && <MySightings db={db} userId={userId} projectId={projectId} />}
        {activePage === 'sightings' && !firebaseInitialized && <LoadingMessage />}
        {activePage === 'publicSightings' && firebaseInitialized && <PublicSightings db={db} projectId={projectId} />}
        {activePage === 'publicSightings' && !firebaseInitialized && <LoadingMessage />}
      </main>
      <Footer />
    </div>
  );
};

// Loading component
const LoadingMessage = () => (
  <div className="text-center text-gray-500 text-lg">
    Loading...
  </div>
);

// Header Component
const Header = ({ setActivePage, setSelectedBird }: {setActivePage: (page: string) => void, setSelectedBird: (bird: any) => void}) => {
  const NavButton = ({ children, page }: {children: React.ReactNode, page: string}) => (
    <button
      onClick={() => {
        setActivePage(page);
        setSelectedBird(null);
      }}
      className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 py-2 px-4 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      {children}
    </button>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-['Belleza'] text-gray-800">FeatherFind</h1>
        <nav className="hidden md:flex space-x-4">
          <NavButton page="explore">Explore Birds</NavButton>
          <NavButton page="guesser">AI Guesser</NavButton>
          <NavButton page="sightings">My Sightings</NavButton>
          <NavButton page="publicSightings">Public Sightings</NavButton>
        </nav>
        <div className="md:hidden">
          {/* Mobile menu button could go here */}
        </div>
      </div>
    </header>
  );
};

// Explore Birds Page
const ExploreBirds = ({ setSelectedBird }: {setSelectedBird: (bird: any) => void}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBirds = staticBirdData.filter(bird =>
    bird.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <h2 className="text-4xl font-['Belleza'] text-gray-800 text-center mb-8">Explore Birds</h2>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for a bird..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow text-lg"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBirds.map((bird) => (
          <div
            key={bird.name}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
            onClick={() => setSelectedBird(bird)}
          >
            <img src={bird.imageUrl} alt={bird.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 font-['Belleza'] mb-2">{bird.name}</h3>
              <p className="text-gray-600 text-base">{bird.description.substring(0, 70)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bird Details Page
const BirdDetails = ({ bird }: {bird: any}) => {
  return (
    <div className="container mx-auto max-w-4xl bg-white rounded-xl shadow-lg p-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img src={bird.imageUrl} alt={bird.name} className="w-full md:w-1/2 h-auto object-cover rounded-lg shadow-md" />
        <div className="md:w-1/2">
          <h2 className="text-4xl font-['Belleza'] text-gray-800 mb-4">{bird.name}</h2>
          <p className="text-gray-600 text-lg">{bird.description}</p>
        </div>
      </div>
    </div>
  );
};

// AI Bird Guesser Page
const AIBirdGuesser = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [guesses, setGuesses] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGuess = async () => {
    if (!description.trim()) {
      setError("Please provide a description of the bird.");
      return;
    }
    
    setError('');
    setGuesses(null);
    setLoading(true);
    setIsModalOpen(true);

    try {
      const prompt = `Based on the following description, identify the top 3 most likely bird species. Return a JSON object with a single key "guesses" which is an array of strings. Only use common bird names, no other text. Description: "${description}"`;
      const aiResponse = await geminiApiCall(prompt);
      
      const birdGuesses = aiResponse.guesses;
      const matchedBirds = birdGuesses
        .map((guess: string) => staticBirdData.find(b => b.name.toLowerCase().includes(guess.toLowerCase())))
        .filter((b: any) => b !== undefined);

      setGuesses(matchedBirds.length > 0 ? matchedBirds : null);
      if (matchedBirds.length === 0) {
        setError("Merlin couldn't identify a matching bird from the database. Please try a different description.");
      }
    } catch (err) {
      setError("An error occurred during identification. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl text-center">
      <h2 className="text-4xl font-['Belleza'] text-gray-800 mb-4">AI Bird Guesser</h2>
      <p className="text-lg text-gray-600 mb-8">Describe a bird you've seen, and I'll try to identify it for you!</p>
      
      <textarea
        className="w-full h-32 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow text-base resize-none"
        placeholder="e.g., 'A small bird with a bright yellow belly and black stripes on its wings.'"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      <button
        onClick={handleGuess}
        disabled={loading}
        className="mt-6 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Identifying...' : 'Guess the Bird'}
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {loading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <p className="text-gray-600 text-lg font-semibold">Merlin is guessing...</p>
          </div>
        )}
        {!loading && guesses && (
          <div className="text-center">
            <h3 className="text-3xl font-['Belleza'] font-bold mb-4">Top Guesses:</h3>
            <div className="space-y-4">
              {guesses.map((guess, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xl font-bold">{guess.name}</h4>
                  <p className="text-sm text-gray-500">{guess.description.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && !guesses && (
          <div className="text-center">
            <h3 className="text-3xl font-['Belleza'] font-bold mb-4">No Match Found</h3>
            <p className="text-gray-700">Merlin couldn't identify a matching bird. Please try a different description or check the "Explore Birds" page.</p>
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes spinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loader {
          border-top-color: #4F46E5;
          animation: spinner 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

// My Sightings Page (Private)
const MySightings = ({ db, userId, projectId }: {db: any, userId: string | null, projectId: string}) => {
  const [sightings, setSightings] = useState<any[]>([]);
  const [newSightingBird, setNewSightingBird] = useState('');
  const [newSightingNotes, setNewSightingNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      setIsLoading(false);
      return;
    }

    const sightingsCollectionPath = `artifacts/${projectId}/users/${userId}/sightings`;
    const q = collection(db, sightingsCollectionPath);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sightingsData: any[] = [];
      querySnapshot.forEach((doc) => {
        sightingsData.push({ id: doc.id, ...doc.data() });
      });
      setSightings(sightingsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching sightings: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, userId, projectId]);

  const handleAddSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !userId || !newSightingBird) {
      return;
    }

    try {
      const sightingsCollectionPath = `artifacts/${projectId}/users/${userId}/sightings`;
      await addDoc(collection(db, sightingsCollectionPath), {
        birdName: newSightingBird,
        notes: newSightingNotes,
        dateSeen: new Date().toISOString()
      });
      setNewSightingBird('');
      setNewSightingNotes('');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl text-center">
      <h2 className="text-4xl font-['Belleza'] text-gray-800 mb-4">My Sightings (Private)</h2>
      {userId && <p className="text-sm text-gray-500 mb-4 break-words">Your User ID: {userId}</p>}
      
      <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold mb-4">Add a New Sighting</h3>
        <form onSubmit={handleAddSighting}>
          <input
            type="text"
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow text-base mb-4"
            placeholder="Bird name (e.g., American Robin)"
            value={newSightingBird}
            onChange={(e) => setNewSightingBird(e.target.value)}
          />
          <textarea
            className="w-full h-24 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow text-base resize-none mb-4"
            placeholder="Notes about your sighting..."
            value={newSightingNotes}
            onChange={(e) => setNewSightingNotes(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="w-full px-8 py-3 bg-green-500 text-white rounded-full font-bold shadow-lg hover:bg-green-600 transition-colors duration-200"
          >
            Add Sighting
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Recent Sightings</h3>
        {isLoading && <p className="text-gray-500">Loading your sightings...</p>}
        {!isLoading && sightings.length === 0 && <p className="text-gray-500">You haven't logged any sightings yet.</p>}
        <div className="space-y-4">
          {sightings.map((sighting) => (
            <div key={sighting.id} className="bg-white rounded-xl shadow p-4 text-left">
              <p className="font-bold text-lg text-gray-800">{sighting.birdName}</p>
              <p className="text-gray-600">{sighting.notes}</p>
              <p className="text-sm text-gray-400 mt-2">Logged on: {new Date(sighting.dateSeen).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Public Sightings Page
const PublicSightings = ({ db, projectId }: {db: any, projectId: string}) => {
  const [sightings, setSightings] = useState<any[]>([]);
  const [newSightingBird, setNewSightingBird] = useState('');
  const [newSightingNotes, setNewSightingNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Set up Firestore listener for public sightings
  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    // Path for public data
    const publicCollectionPath = `artifacts/${projectId}/public/data/sightings`;
    const q = collection(db, publicCollectionPath);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sightingsData: any[] = [];
      querySnapshot.forEach((doc) => {
        sightingsData.push({ id: doc.id, ...doc.data() });
      });
      // Sort sightings by date in descending order
      sightingsData.sort((a, b) => new Date(b.dateSeen).valueOf() - new Date(a.dateSeen).valueOf());
      setSightings(sightingsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching public sightings: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, projectId]);

  const handleAddSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newSightingBird) {
      return;
    }

    try {
      const publicCollectionPath = `artifacts/${projectId}/public/data/sightings`;
      await addDoc(collection(db, publicCollectionPath), {
        birdName: newSightingBird,
        notes: newSightingNotes,
        dateSeen: new Date().toISOString()
      });
      setNewSightingBird('');
      setNewSightingNotes('');
    } catch (e) {
      console.error("Error adding public sighting: ", e);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl text-center">
      <h2 className="text-4xl font-['Belleza'] text-gray-800 mb-4">Public Sightings</h2>
      <p className="text-sm text-gray-500 mb-4">Share your sightings with the world!</p>

      <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold mb-4">Add a New Public Sighting</h3>
        <form onSubmit={handleAddSighting}>
          <input
            type="text"
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow text-base mb-4"
            placeholder="Bird name (e.g., American Robin)"
            value={newSightingBird}
            onChange={(e) => setNewSightingBird(e.target.value)}
          />
          <textarea
            className="w-full h-24 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow text-base resize-none mb-4"
            placeholder="Notes about your sighting..."
            value={newSightingNotes}
            onChange={(e) => setNewSightingNotes(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="w-full px-8 py-3 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Add Public Sighting
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Recent Public Sightings</h3>
        {isLoading && <p className="text-gray-500">Loading public sightings...</p>}
        {!isLoading && sightings.length === 0 && <p className="text-gray-500">No public sightings have been logged yet.</p>}
        <div className="space-y-4">
          {sightings.map((sighting) => (
            <div key={sighting.id} className="bg-white rounded-xl shadow p-4 text-left">
              <p className="font-bold text-lg text-gray-800">{sighting.birdName}</p>
              <p className="text-gray-600">{sighting.notes}</p>
              <p className="text-sm text-gray-400 mt-2">Logged on: {new Date(sighting.dateSeen).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Footer component
const Footer = () => (
  <footer className="bg-gray-800 text-white py-6 mt-12">
    <div className="container mx-auto px-4 text-center">
      <p className="text-sm">FeatherFind &copy; 2025</p>
    </div>
  </footer>
);

export default App;
