import { useNavigate } from 'react-router-dom'
import { CalendarPlus, Disc3, LayoutGrid, ListMusic, PlusCircle, Star, Users } from 'lucide-react'

export default function Home({ generos = [], sets = [], djs = [], festivais = [] }) {
	const navigate = useNavigate()
	const totalSets = sets.length
	const totalDjs = djs.length
	const totalFestivais = festivais.length
	const totalGeneros = generos.length
	const averageRating =
		sets.length > 0
			? sets.reduce((sum, set) => sum + (Number(set.avaliacao) || 0), 0) / sets.length
			: 0

	const quickActions = [
		{
			label: 'Ver Lista',
			description: `Consultar os ${totalSets} sets guardados`,
			icon: LayoutGrid,
			onClick: () => navigate('/lista'),
		},
		{
			label: 'Adicionar Set',
			description: 'Registar um novo set na coleção',
			icon: PlusCircle,
			onClick: () => navigate('/adicionar'),
		},
		{
			label: 'Adicionar DJ',
			description: `Gerir ${totalDjs} DJs no catálogo`,
			icon: Users,
			onClick: () => navigate('/djs/adicionar'),
		},
		{
			label: 'Adicionar Género',
			description: `Gerir ${totalGeneros} géneros musicais`,
			icon: Disc3,
			onClick: () => navigate('/generos/adicionar'),
		},
		{
			label: 'Adicionar Festival',
			description: `Gerir ${totalFestivais} festivais no sistema`,
			icon: CalendarPlus,
			onClick: () => navigate('/festivais/adicionar'),
		},
		{
			label: 'Estatísticas',
			description: 'Explorar métricas e tendências do catálogo',
			icon: Star,
			onClick: () => navigate('/estatisticas'),
		},
	]

	return (
		<div className="w-full min-h-full p-8 relative flex flex-col z-10 bg-transparent isolate">
			<div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
				<div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px] animate-aurora-1 dark:bg-purple-500/15" />
				<div className="absolute bottom-[10%] right-[-5%] h-[550px] w-[550px] rounded-full bg-indigo-600/25 blur-[120px] animate-aurora-2 dark:bg-indigo-500/10" />
			</div>

			<div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 text-slate-900 dark:text-slate-100">
				<section className="space-y-4">
					<p className="inline-flex items-center rounded-full border border-slate-200/50 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-purple-700 backdrop-blur-md shadow-xl dark:border-slate-800/50 dark:bg-slate-900/40 dark:text-purple-300 dark:shadow-2xl">
						DJDex live console
					</p>
					<div className="max-w-3xl space-y-3">
						<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
							Bem-vindo ao DJDex, o cockpit da tua coleção eletrónica.
						</h1>
						<p className="text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
							Organiza sets, DJs, géneros e festivais num dashboard dinâmico, com métricas em tempo real e
							ações rápidas para acelerar o fluxo de trabalho.
						</p>
					</div>
				</section>

				<section className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
					<div className="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-white/5 p-5 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/40 dark:shadow-2xl">
						<div>
							<p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Sets</p>
							<p className="mt-2 text-3xl font-semibold">{totalSets}</p>
						</div>
						<ListMusic className="h-10 w-10 text-purple-500" />
					</div>

					<div className="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-white/5 p-5 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/40 dark:shadow-2xl">
						<div>
							<p className="text-sm font-medium text-slate-500 dark:text-slate-400">DJs no Catálogo</p>
							<p className="mt-2 text-3xl font-semibold">{totalDjs}</p>
						</div>
						<Users className="h-10 w-10 text-blue-500" />
					</div>

					<div className="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-white/5 p-5 shadow-xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/40 dark:shadow-2xl">
						<div>
							<p className="text-sm font-medium text-slate-500 dark:text-slate-400">Média das Raves</p>
							<p className="mt-2 text-3xl font-semibold">
								{averageRating.toFixed(1)} <span className="text-lg text-slate-500 dark:text-slate-400">/ 10</span>
							</p>
						</div>
						<Star className="h-10 w-10 text-amber-500" />
					</div>
				</section>

				<section className="space-y-5">
					<div className="flex items-end justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-600 dark:text-purple-300">
								Atalhos
							</p>
							<h2 className="mt-2 text-2xl font-semibold tracking-tight">Ações Rápidas</h2>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{quickActions.map(({ label, description, icon: Icon, onClick }) => (
							<button
								key={label}
								type="button"
								onClick={onClick}
								className="group flex w-full items-center justify-between gap-4 rounded-3xl border border-slate-200/50 bg-white/5 px-5 py-5 text-left shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-200/70 hover:bg-white/10 hover:shadow-2xl dark:border-slate-800/50 dark:bg-slate-900/40 dark:hover:border-slate-700/80 dark:hover:bg-slate-900/55"
							>
								<div className="space-y-1">
									<p className="text-lg font-semibold">{label}</p>
									<p className="text-sm leading-6 text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
										{description}
									</p>
								</div>
								<Icon className="h-6 w-6 shrink-0 text-purple-500 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700 dark:group-hover:text-purple-300" />
							</button>
						))}
					</div>
				</section>
			</div>
		</div>
	)
}