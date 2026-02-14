"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UseRealtimeOrdersOptions {
  status?: string
  refreshInterval?: number
}

export function useRealtimeOrders({
  status = "PENDING,PREPARING",
  refreshInterval = 5000, // 5 seconds
}: UseRealtimeOrdersOptions = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/orders?status=${status}&limit=50&sortBy=createdAt&sortOrder=asc`,
    fetcher,
    {
      refreshInterval, // Auto-refresh
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    orders: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  }
}