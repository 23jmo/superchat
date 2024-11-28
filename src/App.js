import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore';
import { useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import './App.css';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvJZCviIoQmbZazOjvgSvfDPNYczZdt6A",
  authDomain: "superchat-45d3f.firebaseapp.com",
  projectId: "superchat-45d3f",
  storageBucket: "superchat-45d3f.firebasestorage.app",
  messagingSenderId: "209142585501",
  appId: "1:209142585501:web:daf49c353fcb2ec797dc74",
  measurementId: "G-89HMHNSGET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to SuperChat</h1>
                <SignOut />
            </header>
            <section>
                {user ? <ChatRoom /> : <SignIn />}
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        console.log('Auth object:', auth);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('User signed in:', user);
        } catch (error) {
            console.error('Error during sign-in:', error);
        }
    };

    return (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
    );
}

function SignOut() {
    return auth.currentUser && (
        <button onClick={() => auth.signOut()}>Sign Out</button>
    );
}

function ChatRoom() {
    const messagesRef = collection(firestore, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));
    const [messages] = useCollectionData(messagesQuery, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const dummy = useRef();

    const sendMessage = async (e) => {
        e.preventDefault();
        const { uid, photoURL } = auth.currentUser;
        await addDoc(messagesRef, {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL
        });
        dummy.current.scrollIntoView({ behavior: 'smooth' });
        setFormValue('');
    };

    return (
        <>
            <div>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} photoURL={msg.photoURL} />)}
                <div ref={dummy}></div>
            </div>
            <form onSubmit={sendMessage}>
                <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
                <button type="submit">Send</button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} alt="User" />
            <p>{text}</p>
        </div>
    );
}

export default App;
