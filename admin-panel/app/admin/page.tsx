'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminApi, type AnalyticsData } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import {
  Users,
  CreditCard,
  TrendingUp,
  Baby,
  Activity,
  Target,
  MessageSquare,
  BarChart3,
  DollarSign,
  UserPlus,
  UserCheck,
  Trophy
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { admin, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    console.log('DashboardPage useEffect:', { 
      admin, 
      isAuthenticated, 
      authLoading,
      localStorage: typeof window !== 'undefined' ? {
        token: !!localStorage.getItem('admin_token'),
        data: !!localStorage.getItem('admin_data')
      } : 'SSR'
    })
    
    if (isAuthenticated && !authLoading) {
      loadDashboardData()
    }
  }, [isAuthenticated, authLoading])

  const loadDashboardData = async () => {
    try {
      console.log('Carregando dados do dashboard...')
      const response = await adminApi.getDashboard()
      console.log('Resposta completa do dashboard:', JSON.stringify(response, null, 2))
      
      if (response.success && response.data) {
        console.log('Dados da API dashboard:', response.data)
        console.log('Total de usuários da API:', response.data.users?.total)
        console.log('Novos usuários da API:', response.data.users?.newThisMonth)
        
        // Mapear os dados da API para o formato esperado pelo componente
        const mappedData = {
          totalUsers: response.data.users?.total || 0,
          activeUsers: response.data.users?.total || 0, // Assumindo que todos são ativos por enquanto
          newUsers: response.data.users?.newThisMonth || 0,
          totalRevenue: response.data.revenue?.total || 0,
          monthlyRevenue: response.data.revenue?.monthly || 0,
          subscriptionStats: {
            basic: 0,
            premium: 0,
            family: 0
          },
          engagementStats: {
            dailyActive: 0,
            weeklyActive: 0,
            monthlyActive: 0
          }
        }
        
        console.log('Dados mapeados:', mappedData)
        console.log('Total de usuários mapeado:', mappedData.totalUsers)
        
        // Carregar dados de planos para calcular subscriptionStats
        try {
          const plansResponse = await adminApi.getPlans()
          if (plansResponse.success && Array.isArray(plansResponse.data)) {
            const plans = plansResponse.data
            const basicPlan = plans.find(p => p.name.toLowerCase().includes('básico'))
            const premiumPlan = plans.find(p => p.name.toLowerCase().includes('premium'))
            const familyPlan = plans.find(p => p.name.toLowerCase().includes('família'))
            
            mappedData.subscriptionStats = {
              basic: 0,
              premium: 0,
              family: 0
            }
          }
        } catch (plansError) {
          console.error('Erro ao carregar dados de planos:', plansError)
        }
        
        console.log('Dados finais antes de setAnalytics:', mappedData)
        setAnalytics(mappedData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  console.log('DashboardPage render:', { 
    admin, 
    isAuthenticated, 
    authLoading,
    isLoading 
  })

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: analytics?.totalUsers || 0,
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Usuários Ativos',
      value: analytics?.activeUsers || 0,
      change: '+8%',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Novos Usuários',
      value: analytics?.newUsers || 0,
      change: '+15%',
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Receita Total',
      value: formatCurrency(analytics?.totalRevenue || 0),
      change: '+23%',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const subscriptionData = analytics?.subscriptionStats ? [
    { name: 'Básico', value: analytics.subscriptionStats.basic, color: '#3B82F6' },
    { name: 'Premium', value: analytics.subscriptionStats.premium, color: '#10B981' },
    { name: 'Família', value: analytics.subscriptionStats.family, color: '#F59E0B' },
  ] : []

  const monthlyData = [
    { month: 'Jan', users: 0, revenue: 0 },
    { month: 'Fev', users: 0, revenue: 0 },
    { month: 'Mar', users: 0, revenue: 0 },
    { month: 'Abr', users: 0, revenue: 0 },
    { month: 'Mai', users: 0, revenue: 0 },
    { month: 'Jun', users: analytics?.totalUsers || 0, revenue: analytics?.totalRevenue || 0 },
  ]

  // Componente de debug
  const DebugInfo = () => (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>Auth Loading: {authLoading ? 'true' : 'false'}</div>
          <div>Is Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
          <div>Admin: {admin ? `${admin.name} (${admin.email})` : 'null'}</div>
          <div>LocalStorage Token: {typeof window !== 'undefined' ? (localStorage.getItem('admin_token') ? 'present' : 'missing') : 'SSR'}</div>
          <div>LocalStorage Data: {typeof window !== 'undefined' ? (localStorage.getItem('admin_data') ? 'present' : 'missing') : 'SSR'}</div>
          <div>Analytics Loading: {isLoading ? 'true' : 'false'}</div>
          <div>Analytics Data: {analytics ? 'present' : 'null'}</div>
          {analytics && (
            <>
              <div>Total Users: {analytics.totalUsers}</div>
              <div>Active Users: {analytics.activeUsers}</div>
              <div>New Users: {analytics.newUsers}</div>
              <div>Total Revenue: {analytics.totalRevenue}</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Verificando autenticação...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Não autenticado. Redirecionando...</div>
        <DebugInfo />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <DebugInfo />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do Baby Diary - {formatDate(new Date())}
          </p>
          <p className="text-sm text-muted-foreground">
            Logado como: {admin?.name} ({admin?.email})
          </p>
        </div>
        <Button onClick={loadDashboardData}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> desde o mês passado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento Mensal</CardTitle>
            <CardDescription>
              Evolução de usuários e receita nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Usuários"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>
              Proporção de usuários por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Gerenciar Usuários</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CreditCard className="h-6 w-6 mb-2" />
              <span className="text-sm">Planos</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Trophy className="h-6 w-6 mb-2" />
              <span className="text-sm">Gamificação</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
