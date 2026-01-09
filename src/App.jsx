import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Events from "./pages/buyer/Events";
import EventDetails from "./pages/buyer/EventDetails";
import MyTickets from "./pages/buyer/MyTickets";
import MyOrders from "./pages/buyer/MyOrders";
import PaymentVerify from "./pages/buyer/PaymentVerify";
import MockCheckout from "./pages/buyer/MockCheckout";
import Profile from "./pages/Profile";

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import CreateEvent from "./pages/organizer/CreateEvent";
import ManageEvents from "./pages/organizer/ManageEvents";
import SetupPayout from "./pages/organizer/SetupPayout";

import ValidatorDashboard from "./pages/validator/ValidatorDashboard";
import Scanner from "./pages/validator/Scanner";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import PendingOrganizers from "./pages/admin/PendingOrganizers";
import TransactionMonitor from "./pages/admin/TransactionMonitor";
import DisputeManagement from "./pages/admin/DisputeManagement";
import Reconciliation from "./pages/admin/Reconciliation";
import AuditLog from "./pages/admin/AuditLog";

import MockCreateEvent from "./pages/organizer/MockCreateEvent";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to='/login' />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to='/' />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />
      <main>
        <Routes>
          <Route path='/' element={<Events />} />
          <Route path='/events' element={<Events />} />
          <Route path='/events/:id' element={<EventDetails />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/mock-checkout' element={<MockCheckout />} />

          <Route
            path='/my-tickets'
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path='/my-orders'
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path='/payment/verify'
            element={
              <ProtectedRoute>
                <PaymentVerify />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path='/organizer'
            element={
              <ProtectedRoute roles={["organizer", "admin"]}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/organizer/create'
            element={
              <ProtectedRoute roles={["organizer", "admin"]}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path='/organizer/events'
            element={
              <ProtectedRoute roles={["organizer", "admin"]}>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path='/organizer/setup-payout'
            element={
              <ProtectedRoute roles={["organizer", "admin"]}>
                <SetupPayout />
              </ProtectedRoute>
            }
          />

          {/* Validator routes */}
          <Route
            path='/validator'
            element={
              <ProtectedRoute roles={["validator", "admin"]}>
                <ValidatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/validator/scan'
            element={
              <ProtectedRoute roles={["validator", "admin"]}>
                <Scanner />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path='/admin'
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/users'
            element={
              <ProtectedRoute roles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/organizers'
            element={
              <ProtectedRoute roles={["admin"]}>
                <PendingOrganizers />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/transactions'
            element={
              <ProtectedRoute roles={["admin"]}>
                <TransactionMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/disputes'
            element={
              <ProtectedRoute roles={["admin"]}>
                <DisputeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/reconciliation'
            element={
              <ProtectedRoute roles={["admin"]}>
                <Reconciliation />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/audit'
            element={
              <ProtectedRoute roles={["admin"]}>
                <AuditLog />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path='*'
            element={
              <div className='flex items-center justify-center h-[60vh]'>
                <div className='text-center'>
                  <h1 className='text-6xl font-bold text-gray-300'>404</h1>
                  <p className='text-gray-500 mt-2'>Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
