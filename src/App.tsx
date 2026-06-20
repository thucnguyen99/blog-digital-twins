import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase/config'
import { useAuthStore } from './stores/authStore'
import AuthGuard from './components/ui/AuthGuard'
import NavBar from './components/ui/NavBar'
import ChatWidget from './components/chat/ChatWidget'

// Public pages
import HomePage from './pages/public/HomePage'
import BlogPage from './pages/public/BlogPage'
import PostPage from './pages/public/PostPage'
import TimelinePage from './pages/public/TimelinePage'
import SearchPage from './pages/public/SearchPage'

// Admin pages
import LoginPage from './pages/admin/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import EditorPage from './pages/admin/EditorPage'
import ContentListPage from './pages/admin/ContentListPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import SnapshotsPage from './pages/admin/SnapshotsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 300_000 } },
})

function AuthListener() {
  const setUser = useAuthStore((s) => s.setUser)
  useEffect(() => onAuthStateChanged(auth, setUser), [setUser])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthListener />
        <Routes>
          {/* Public — all share NavBar */}
          <Route element={<><NavBar /><main><Outlet /></main><ChatWidget /></>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<PostPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin — protected */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="editor" element={<EditorPage />} />
            <Route path="editor/:id" element={<EditorPage />} />
            <Route path="content" element={<ContentListPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="snapshots" element={<SnapshotsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  )
}
