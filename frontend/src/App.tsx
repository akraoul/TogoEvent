import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import EventDetailPage from './pages/EventDetailPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import PaymentSuccessPage from './pages/PaymentSuccessPage.tsx';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage.tsx';
import CreateEventPage from './pages/CreateEventPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/organizer" element={<OrganizerDashboardPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Pages à implémenter */}
            <Route path="/categories" element={<HomePage />} />
            <Route path="/contact" element={<HomePage />} />
            <Route path="/organiser" element={<CreateEventPage />} />
            <Route path="/search" element={<HomePage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
