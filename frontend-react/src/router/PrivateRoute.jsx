import { Navigate } from 'react-router-dom'
import useMe from '../hooks/useMe'

export default function PrivateRoute({ children }) {
  const { user, loading } = useMe()
  if (loading) return <div className="flex justify-center items-center min-h-screen">در حال بارگذاری...</div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}
