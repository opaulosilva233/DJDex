import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setError('')
    setIsLoading(true)

    login(email, password)
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        setError(err.message || 'Credenciais incorretas ou erro de ligação.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative z-10">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[90px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[90px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="DJDex Logo" 
            className="w-20 h-20 object-contain drop-shadow-xl mb-4 hover:scale-105 transition-transform duration-300" 
          />
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            Área de Administração
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Inicie sessão para gerir os DJs, Festivais e Sets.
          </p>
        </div>

        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-8 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-semibold">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email-address" 
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block"
              >
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail 
                  size={16} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" 
                />
                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@dominio.com"
                  className="w-full rounded-xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block"
              >
                Palavra-passe
              </label>
              <div className="relative">
                <Lock 
                  size={16} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" 
                />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white/70 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98] transition-all text-sm disabled:opacity-75 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>A iniciar sessão...</span>
                </>
              ) : (
                <span>Entrar como Administrador</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
