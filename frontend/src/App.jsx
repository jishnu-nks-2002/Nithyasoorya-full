import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Slides from './pages/Slides';
import Settings from './pages/Settings';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Contacts from './pages/Contacts';
import AboutCMS from './pages/AboutCMS';
import Enquiries from './pages/Enquiries';
import StonesList from './pages/StonesList';       // ← NEW: stones list page
import StoneForm from './pages/StoneForm';          // ← NEW: stone create/edit form
import ReviewsCMS from './pages/ReviewsCMS';
import GalleryCMS from './pages/Gallerycms';


function ProtectedRoute({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { admin } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={admin ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/"                        element={<Dashboard />} />
                <Route path="/slides"                  element={<Slides />} />
                <Route path="/products"                element={<Products />} />
                <Route path="/products/new"            element={<ProductForm />} />
                <Route path="/products/edit/:id"       element={<ProductForm />} />
                <Route path="/settings"                element={<Settings />} />
                <Route path="/contacts"                element={<Contacts />} />
                <Route path="/about"                   element={<AboutCMS />} />
                <Route path="/enquiries"               element={<Enquiries />} />

                {/* ── Stones ── */}
                <Route path="/stones-admin"            element={<StonesList />} />
                <Route path="/stones-admin/new"        element={<StoneForm />} />
                <Route path="/stones-admin/:id/edit"   element={<StoneForm />} />


                  <Route path="/reviews"   element={<ReviewsCMS/>} />
                   <Route path="/gallery"   element={<GalleryCMS/>} />

                <Route path="*"                        element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}