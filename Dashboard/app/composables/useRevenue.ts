import type { RevenueResponse } from '~/types/analytics'

export const useRevenue = () => {
    const config = useRuntimeConfig()
    const revenue = ref<RevenueResponse | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const { getToken } = useAuth()

    const getAuthHeaders = (): Record<string, string> => {
        const token = getToken()

        if (!token) {
            return {}
        }

        return {
            Authorization: `Bearer ${token}`
        }
    }

    const fetchRevenue = async (period: 'day' | 'month', year: number, month?: number) => {
        loading.value = true
        error.value = null

        try {
            const query: Record<string, string | number> = {
                period,
                year
            }

            if (period === 'day' && month) {
                query.month = month
            }

            revenue.value = await $fetch<RevenueResponse>(
                `${config.public.apiBase}/analytics/revenue`,
                {
                    query,
                    headers: getAuthHeaders()
                }
            )
        } catch (err: any) {
            console.error('Revenue fetch error:', err?.message || err)

            error.value =
                err?.data?.message ||
                err?.message ||
                'Failed to load revenue data'

            revenue.value = null
        } finally {
            loading.value = false
        }
    }

    return {
        revenue,
        loading,
        error,
        fetchRevenue
    }
}