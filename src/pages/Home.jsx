import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ListMusic, Users, Star, Compass, FolderKanban } from 'lucide-react'

export default function Home({ sets = [], djs = [], festivais = [], generos = [] }) {
  const navigate = useNavigate()

  // Cálculo da média de avaliações
  const mediaAvaliacao = sets.length > 0
    ? (sets.reduce((acc, curr) => acc + Number(curr.avaliacao || 0), 0) / sets.length).toFixed(1)
    : '0.0'

  return (
    <div className="w-full p-8 md:p-12 flex flex-col gap-12">

      {/* Cabeçalho de Alto Impacto */}
      <div className="flex flex-col gap-3 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full w-fit">
          DJDex Live Console
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          O cockpit da tua <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">coleção eletrónica</span>.
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
          Gere os teus sets favoritos, cataloga DJs, mapeia festivais de norte a sul do país e organiza as vertentes mais pesadas da tua biblioteca musical num único painel analítico.
        </p>
      </div>

      {/* Grelha de Métricas (Morfismo Premium) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Sets */}
        <div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-xl transition-all hover:border-purple-500/30 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Sets</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white">{sets.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <ListMusic size={24} />
          </div>
        </div>

        {/* DJs Catalogados */}
        <div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-xl transition-all hover:border-blue-500/30 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DJs no Catálogo</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white">{djs.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
        </div>

        {/* Média de Avaliações */}
        <div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-xl transition-all hover:border-amber-500/30 group">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Média das Raves</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              {mediaAvaliacao} <span className="text-sm font-normal text-slate-500">/10</span>
            </span>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
            <Star size={24} className="fill-amber-500/20" />
          </div>
        </div>
      </div>

      {/* Secção de Atalhos e Fluxos de Trabalho */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Ações e Fluxos Rápidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Botão Ver Histórico */}
          <button
            onClick={() => navigate('/lista')}
            className="flex flex-col gap-3 p-5 rounded-xl text-left bg-white/70 hover:bg-purple-600/10 border border-slate-200/70 hover:border-purple-500/40 transition-all duration-300 group hover:-translate-y-1 dark:bg-slate-950/20 dark:border-slate-800/40"
          >
            <FolderKanban className="text-purple-400" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Explorar Histórico</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consultar a base de sets gravados</span>
            </div>
          </button>

          {/* Botão Gerir DJs */}
          <button
            onClick={() => navigate('/djs')}
            className="flex flex-col gap-3 p-5 rounded-xl text-left bg-white/70 hover:bg-blue-600/10 border border-slate-200/70 hover:border-blue-500/40 transition-all duration-300 group hover:-translate-y-1 dark:bg-slate-950/20 dark:border-slate-800/40"
          >
            <Users className="text-blue-400" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Gerir DJs</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Adicionar ou detalhar artistas</span>
            </div>
          </button>

          {/* Botão Gerir Festivais */}
          <button
            onClick={() => navigate('/festivais')}
            className="flex flex-col gap-3 p-5 rounded-xl text-left bg-white/70 hover:bg-cyan-600/10 border border-slate-200/70 hover:border-cyan-500/40 transition-all duration-300 group hover:-translate-y-1 dark:bg-slate-950/20 dark:border-slate-800/40"
          >
            <Compass className="text-cyan-400" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Mapear Festivais</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configurar locais e edições</span>
            </div>
          </button>

          {/* Botão Gerir Estatísticas */}
          <button
            onClick={() => navigate('/estatisticas')}
            className="flex flex-col gap-3 p-5 rounded-xl text-left bg-white/70 hover:bg-emerald-600/10 border border-slate-200/70 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1 dark:bg-slate-950/20 dark:border-slate-800/40"
          >
            <Star className="text-emerald-400" size={20} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Métricas Avançadas</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ver gráficos e distribuições</span>
            </div>
          </button>
        </div>
      </div>

    </div>
  )
}