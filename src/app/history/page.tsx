// import { Button } from '@/components/ui/button'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// export default function HistoryPage() {
//   return (
//     <div className="flex min-h-screen w-full max-w-lg flex-col items-center">
//       <Table className="rounded-lg shadow-lg">
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[100px]">ID</TableHead>
//             <TableHead>City Name</TableHead>
//             <TableHead>Search Date</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           <TableRow>
//             <TableCell className="font-medium">John Doe</TableCell>
//             <TableCell>Toronto</TableCell>
//             <TableCell>June 6, 2025</TableCell>
//             <TableCell className="text-right">
//               <Button size="sm" variant="outline">
//                 Delete
//               </Button>
//             </TableCell>
//           </TableRow>
//           <TableRow>
//             <TableCell className="font-medium">Jane Smith</TableCell>
//             <TableCell>Shanghai</TableCell>
//             <TableCell>June 6, 2025</TableCell>
//             <TableCell className="text-right">
//               <Button size="sm" variant="outline">
//                 Delete
//               </Button>
//             </TableCell>
//           </TableRow>
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { toast } from 'sonner' // or your preferred toast library

// TypeScript interfaces for type safety
interface SearchHistory {
  id: number
  cityName: string
  createdAt: string // ISO string from database
}

interface ApiResponse {
  success: boolean
  data: SearchHistory[]
  count: number
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4750'

export default function HistoryPage() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Fetch search history from backend
  const fetchSearchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/search-history`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      console.log('data', data)

      if (data.success) {
        setSearchHistory(data.data)
      } else {
        throw new Error('Failed to fetch search history')
      }
    } catch (error) {
      console.error('Error fetching search history:', error)
      toast.error('Failed to load search history')
    } finally {
      setLoading(false)
    }
  }

  // Delete search history item
  const deleteSearchHistory = async (id: number) => {
    try {
      setDeletingId(id)

      const response = await fetch(`${API_BASE_URL}/api/search-history/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Remove the deleted item from local state
        setSearchHistory((prev) => prev.filter((item) => item.id !== id))
        toast.success('Search history deleted successfully')
      } else {
        throw new Error(data.error || 'Failed to delete search history')
      }
    } catch (error) {
      console.error('Error deleting search history:', error)
      toast.error('Failed to delete search history')
    } finally {
      setDeletingId(null)
    }
  }

  // Fetch data when component mounts
  useEffect(() => {
    fetchSearchHistory()
  }, [])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-start p-4">
      <div className="mb-4 flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Search History</h1>
        <Button
          onClick={fetchSearchHistory}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Table className="rounded-lg shadow-lg">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">ID</TableHead>
            <TableHead>City Name</TableHead>
            <TableHead>Search Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center">
                Loading search history...
              </TableCell>
            </TableRow>
          ) : searchHistory.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground py-8 text-center"
              >
                No search history found. Start searching for cities to see your
                history here!
              </TableCell>
            </TableRow>
          ) : (
            searchHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell className="font-semibold">{item.cityName}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {item.createdAt?.slice(0, 10)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteSearchHistory(item.id)}
                    disabled={deletingId === item.id}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {searchHistory.length > 0 && (
        <p className="text-muted-foreground mt-4 text-sm">
          Total searches: {searchHistory.length}
        </p>
      )}
    </div>
  )
}
