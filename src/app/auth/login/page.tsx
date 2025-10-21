'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Shield, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50 to-blue-50 p-4 relative overflow-hidden">
      {/* Enhanced decorative elements for admin theme with animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-linear-to-r from-slate-200/70 to-indigo-200/70 rounded-full blur-xl animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-linear-to-l from-indigo-200/70 to-blue-200/70 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-linear-to-r from-blue-200/50 to-slate-200/50 rounded-full blur-lg animate-bounce-slower"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/90 backdrop-blur-md ring-1 ring-white/20">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto w-24 h-24 bg-linear-to-br from-slate-400 to-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg ring-1 ring-slate-200/50 hover:scale-105 transition-transform duration-300">
            <Shield className="h-10 w-10 text-white drop-shadow-md" />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight bg-linear-to-r from-slate-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            PARFUM 
          </CardTitle>
          <p className="text-base font-medium text-gray-600">Panel de Administración</p>
          <CardDescription className="text-muted-foreground leading-relaxed">
            Acceso restringido solo para administradores. Ingrese sus credenciales para gestionar la perfumería.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin} className="space-y-6">
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-linear-to-r from-red-50/80 to-red-100/80 border  text-red-700 px-4 py-3 rounded-xl backdrop-blur-sm shadow-md border-l-4 border-red-500 animate-slide-in">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail className="h-4 w-4 text-indigo-500" />
                Correo electrónico
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 pr-4 h-12 bg-slate-50/50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200 hover:border-indigo-300"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Lock className="h-4 w-4 text-indigo-500" />
                Contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 pr-4 h-12 bg-slate-50/50 border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200 hover:border-indigo-300"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              type="submit" 
              className="cursor-pointer w-full h-12 bg-linear-to-r from-blue-500 via-indigo-500 to-blue-500 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Acceder al Panel
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="px-6 pb-6 pt-2 text-center text-xs text-muted-foreground border-t border-slate-100/50">
          <p>Acceso exclusivo para administradores de PARFUM.</p>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-bounce-slow { animation: bounce-slow 8s ease-in-out infinite; }
        .animate-bounce-slower { animation: bounce-slower 10s ease-in-out infinite reverse; }
        .animate-slide-in { animation: slide-in 0.4s ease-out; }
      `}</style>
    </div>
  )
}