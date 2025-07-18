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
import { backOff } from 'exponential-backoff'
import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner' // or your preferred toast library
import { BACKOFF_OPTIONS_CONFIG } from '../../lib/backOffOptions'

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

// Express backend base url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4750'

export default function HistoryPage() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Wrap fetch history function with exponential backoff
  const fetchSearchHistory = async () => {
    try {
      setLoading(true)

      const data = await backOff<ApiResponse>(async () => {
        const response = await fetch(`${API_BASE_URL}/api/search-history`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()

        // console.log('Simulating always failure for testing')
        // throw new Error('Simulated API failure')
      }, BACKOFF_OPTIONS_CONFIG)

      if (data.success) {
        setSearchHistory(data.data)
      } else {
        throw new Error('Failed to fetch search history')
      }
    } catch (error) {
      console.error('All retry attempts failed:', error)
      toast.error(
        'The server is experiencing a high influx of requests. Please try again later.'
      )
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
        <p className="text-muted-foreground mt-4 w-full text-right text-sm">
          Total searches: {searchHistory.length}
        </p>
      )}
      <Toaster />
    </div>
  )
}
