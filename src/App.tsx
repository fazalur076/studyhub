import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import QuizHistory from './pages/QuizHistory';
import { seedNCERTPDFs } from './services/storage.service';

function App() {
  useEffect(() => {
    // Seed NCERT PDFs on first load
    seedNCERTPDFs();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="/history" element={<QuizHistory />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;