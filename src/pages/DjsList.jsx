import { useNavigate } from 'react-router-dom'

export default function DjsList({ djs = [], generos = [], handleDeleteDj }) {
  const navigate = useNavigate()

  return (
    <section className="page-section flex-1 min-h-0 overflow-y-auto pr-1">
      <div className="section-header flex items-center justify-between">
        <div>
          <p className="eyebrow dark:text-gray-400">Catálogo</p>
          <h1 className="dark:text-gray-100">Lista de DJs</h1>
          <p className="dark:text-slate-300">Todos os DJs guardados na aplicação.</p>
        </div>
        <div>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={() => navigate('/djs/adicionar')}
          >
            Adicionar DJ
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <div className="sets-grid">
          {djs.length === 0 && <p className="dark:text-slate-400">Ainda não existem DJs.</p>}
          {djs.map((dj) => (
            <div key={dj.id} className="glass-card flex items-start gap-4">
              <img src={dj.imagem || '/images/default-dj.png'} alt={dj.nome} className="h-16 w-16 rounded-full object-cover" />
              <div className="flex-1">
                <h2 className="m-0 text-lg font-semibold dark:text-gray-100">{dj.nome}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{dj.biografia}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.isArray(dj.generoIds) && dj.generoIds.length > 0 ? (
                    dj.generoIds.map((gid) => {
                      const genero = generos.find((g) => g.id === gid)
                      return (
                        <span key={gid} className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                          {genero?.nome ?? '—'}
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-300">Sem géneros definidos</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => navigate(`/djs/adicionar?edit=${dj.id}`)} className="text-sm text-slate-600 dark:text-slate-300">Editar</button>
                <button type="button" onClick={() => handleDeleteDj && handleDeleteDj(dj.id)} className="text-sm text-red-600">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
