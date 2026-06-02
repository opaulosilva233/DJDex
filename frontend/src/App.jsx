import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { api } from './services/api'

import './App.css'
import Navbar from './components/Navbar'
import AddSetPage from './pages/AddSetPage'
import AddDjPage from './pages/AddDjPage'
import AddFestivalPage from './pages/AddFestivalPage'
import Home from './pages/Home'
import AddGeneroPage from './pages/AddGeneroPage'
import SetList from './pages/SetList'
import EstatisticasPage from './pages/EstatisticasPage'
import DjsList from './pages/DjsList'
import GenerosList from './pages/GenerosList'
import FestivaisList from './pages/FestivaisList'

function normalizeGeneroIds(generoIds) {
  if (!Array.isArray(generoIds)) {
    return []
  }

  return generoIds
    .map((genero) => (typeof genero === 'string' ? genero : genero?.id))
    .filter(Boolean)
}

function normalizeDj(dj) {
  if (!dj || typeof dj !== 'object') {
    return dj
  }

  return {
    ...dj,
    generoIds: normalizeGeneroIds(dj.generoIds ?? dj.generos),
  }
}

function normalizeSet(set) {
  if (!set || typeof set !== 'object') {
    return set
  }

  return {
    ...set,
    djId: set.djId ?? set.dj?.id ?? '',
    festivalId: set.festivalId ?? set.festival?.id ?? '',
    data: set.data ?? '',
    horaInicio: set.horaInicio ?? set.hora ?? '',
    horaFim: set.horaFim ?? '',
    hora: set.hora ?? set.horaInicio ?? '',
    avaliacao: set.avaliacao ?? null,
  }
}

function normalizeFestival(festival) {
  if (!festival || typeof festival !== 'object') {
    return festival
  }

  const edicoes = Array.isArray(festival.edicoes)
    ? festival.edicoes.map((e) => ({
        ...e,
        dataInicio: e.data_inicio ?? e.dataInicio ?? '',
      }))
    : (festival.local || festival.ano)
      ? [
          {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
            ano: festival.ano ? Number(festival.ano) : new Date().getFullYear(),
            dataInicio: festival.dataInicio || `${festival.ano || new Date().getFullYear()}-06-01`,
            duracao: festival.duracao ? Number(festival.duracao) : 1,
            local: festival.local || '',
          }
        ]
      : []

  return {
    ...festival,
    edicoes,
    generoIds: Array.isArray(festival.generoIds)
      ? festival.generoIds
      : Array.isArray(festival.generos)
        ? festival.generos.map((g) => g.id).filter(Boolean)
        : [],
    tipo: festival.tipo ?? '',
    website: festival.website ?? '',
  }
}

export default function App() {
  const [generos, setGeneros] = useState([])
  const [djs, setDjs] = useState([])
  const [festivais, setFestivais] = useState([])
  const [sets, setSets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    const storedTheme = window.localStorage.getItem('ravedex_theme')

    if (storedTheme === null) {
      return true
    }

    try {
      return JSON.parse(storedTheme)
    } catch {
      return true
    }
  })

  // Load all initial data from the database
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    Promise.all([
      api.get('/generos'),
      api.get('/djs'),
      api.get('/festivais'),
      api.get('/sets'),
    ])
      .then(([generosData, djsData, festivaisData, setsData]) => {
        if (isMounted) {
          setGeneros(generosData)
          setDjs(djsData.map(normalizeDj))
          setFestivais(festivaisData.map(normalizeFestival))
          setSets(setsData.map(normalizeSet))
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Erro de ligação ao servidor.')
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('ravedex_theme', JSON.stringify(darkMode))
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function handleAddGenero(novoGenero) {
    api.post('/generos', novoGenero)
      .then((data) => {
        setGeneros((currentGeneros) => [data, ...currentGeneros])
      })
      .catch((err) => alert('Erro ao adicionar género: ' + err.message))
  }

  function handleAddDj(novoDj) {
    api.post('/djs', novoDj)
      .then((data) => {
        setDjs((currentDjs) => [normalizeDj(data), ...currentDjs])
      })
      .catch((err) => alert('Erro ao adicionar DJ: ' + err.message))
  }

  function handleAddFestival(novoFestival) {
    api.post('/festivais', novoFestival)
      .then((data) => {
        setFestivais((currentFestivais) => [normalizeFestival(data), ...currentFestivais])
      })
      .catch((err) => alert('Erro ao adicionar festival: ' + err.message))
  }

  function handleAddSet(novoSet) {
    api.post('/sets', novoSet)
      .then((data) => {
        setSets((currentSets) => [normalizeSet(data), ...currentSets])
      })
      .catch((err) => alert('Erro ao adicionar set: ' + err.message))
  }

  function handleImportAllData(importedData) {
    // Note: We can implement batch import to the API if needed,
    // but for now, we reset local states for visual demonstration.
    if (Array.isArray(importedData)) {
      setSets(importedData.map(normalizeSet))
      return
    }

    if (!importedData || typeof importedData !== 'object') {
      return
    }

    setGeneros(Array.isArray(importedData.generos) ? importedData.generos : [])
    setDjs(Array.isArray(importedData.djs) ? importedData.djs.map(normalizeDj) : [])
    setFestivais(Array.isArray(importedData.festivais) ? importedData.festivais.map(normalizeFestival) : [])
    setSets(Array.isArray(importedData.sets) ? importedData.sets.map(normalizeSet) : [])
  }

  function handleEditSet(updatedSet) {
    api.put(`/sets/${updatedSet.id}`, updatedSet)
      .then((data) => {
        setSets((currentSets) => currentSets.map((set) => (set.id === data.id ? normalizeSet(data) : set)))
      })
      .catch((err) => alert('Erro ao editar set: ' + err.message))
  }

  function handleEditDj(updatedDj) {
    api.put(`/djs/${updatedDj.id}`, updatedDj)
      .then((data) => {
        setDjs((currentDjs) => currentDjs.map((dj) => (dj.id === data.id ? normalizeDj(data) : dj)))
      })
      .catch((err) => alert('Erro ao editar DJ: ' + err.message))
  }

  function handleEditFestival(updatedFestival) {
    api.put(`/festivais/${updatedFestival.id}`, updatedFestival)
      .then((data) => {
        setFestivais((currentFestivais) =>
          currentFestivais.map((festival) =>
            festival.id === data.id ? normalizeFestival(data) : festival,
          ),
        )
      })
      .catch((err) => alert('Erro ao editar festival: ' + err.message))
  }

  function handleEditGenero(updatedGenero) {
    api.put(`/generos/${updatedGenero.id}`, updatedGenero)
      .then((data) => {
        setGeneros((currentGeneros) =>
          currentGeneros.map((genero) =>
            genero.id === data.id ? data : genero,
          ),
        )
      })
      .catch((err) => alert('Erro ao editar género: ' + err.message))
  }

  function handleDeleteSet(id) {
    api.delete(`/sets/${id}`)
      .then(() => {
        setSets((currentSets) => currentSets.filter((set) => set.id !== id))
      })
      .catch((err) => alert('Erro ao eliminar set: ' + err.message))
  }

  function handleDeleteGenero(id) {
    api.delete(`/generos/${id}`)
      .then(() => {
        setGeneros((currentGeneros) => currentGeneros.filter((genero) => genero.id !== id))
        setDjs((currentDjs) =>
          currentDjs.map((dj) => ({
            ...dj,
            generoIds: Array.isArray(dj.generoIds) ? dj.generoIds.filter((generoId) => generoId !== id) : [],
          })),
        )
      })
      .catch((err) => alert('Erro ao eliminar género: ' + err.message))
  }

  function handleDeleteDj(id) {
    api.delete(`/djs/${id}`)
      .then(() => {
        setDjs((currentDjs) => currentDjs.filter((dj) => dj.id !== id))
        setSets((currentSets) => currentSets.filter((set) => set.djId !== id))
      })
      .catch((err) => alert('Erro ao eliminar DJ: ' + err.message))
  }

  function handleDeleteFestival(id) {
    api.delete(`/festivais/${id}`)
      .then(() => {
        setFestivais((currentFestivais) => currentFestivais.filter((festival) => festival.id !== id))
        setSets((currentSets) => currentSets.filter((set) => set.festivalId !== id))
      })
      .catch((err) => alert('Erro ao eliminar festival: ' + err.message))
  }

  function toggleDarkMode(e) {
    if (typeof document.startViewTransition !== 'function') {
      setDarkMode((currentDarkMode) => !currentDarkMode)
      return
    }

    const { clientX, clientY } = e
    const endRadius = Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY),
    )

    const transition = document.startViewTransition(() => {
      setDarkMode((currentDarkMode) => !currentDarkMode)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${clientX}px ${clientY}px)`, `circle(${endRadius}px at ${clientX}px ${clientY}px)`],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <BrowserRouter>
      <div className="app-shell w-screen font-sans antialiased">
        <Navbar
          generos={generos}
          djs={djs}
          festivais={festivais}
          sets={sets}
          handleImportAllData={handleImportAllData}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <div className="app-main overflow-y-auto relative bg-transparent">
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/20 dark:bg-purple-500/15 rounded-full blur-[110px] animate-aurora-1" />
            <div className="absolute bottom-[10%] right-[-10%] w-[650px] h-[650px] bg-cyan-600/20 dark:bg-indigo-500/15 rounded-full blur-[130px] animate-aurora-2" />
          </div>

          <div className="relative z-10 w-full min-h-full">
            {isLoading ? (
              <div className="w-full p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px] bg-transparent relative z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 animate-pulse">
                  A carregar dados da base de dados...
                </p>
              </div>
            ) : error ? (
              <div className="w-full p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px] bg-transparent relative z-10">
                <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 p-6 rounded-2xl max-w-md text-center shadow-lg">
                  <h3 className="font-bold text-lg mb-2">Erro de Ligação</h3>
                  <p className="text-sm mb-4">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={
                    <Home
                      generos={generos}
                      sets={sets}
                      djs={djs}
                      festivais={festivais}
                      handleDeleteSet={handleDeleteSet}
                      handleDeleteDj={handleDeleteDj}
                      handleDeleteFestival={handleDeleteFestival}
                      handleDeleteGenero={handleDeleteGenero}
                    />
                  }
                />
                <Route
                  path="/lista"
                  element={
                    <SetList
                      sets={sets}
                      generos={generos}
                      djs={djs}
                      festivais={festivais}
                      onDeleteSet={handleDeleteSet}
                    />
                  }
                />
                <Route
                  path="/djs"
                  element={
                    <DjsList
                      djs={djs}
                      generos={generos}
                      handleDeleteDj={handleDeleteDj}
                    />
                  }
                />
                <Route
                  path="/generos"
                  element={
                    <GenerosList generos={generos} handleDeleteGenero={handleDeleteGenero} />
                  }
                />
                <Route
                  path="/festivais"
                  element={
                    <FestivaisList
                      festivais={festivais}
                      handleDeleteFestival={handleDeleteFestival}
                      generos={generos}
                    />
                  }
                />
                <Route
                  path="/estatisticas"
                  element={
                    <EstatisticasPage
                      generos={generos}
                      sets={sets}
                      djs={djs}
                      festivais={festivais}
                      darkMode={darkMode}
                    />
                  }
                />
                <Route
                  path="/adicionar"
                  element={
                    <AddSetPage
                      sets={sets}
                      generos={generos}
                      djs={djs}
                      festivais={festivais}
                      handleAddSet={handleAddSet}
                      handleEditSet={handleEditSet}
                    />
                  }
                />
                <Route
                  path="/sets/editar/:id"
                  element={
                    <AddSetPage
                      sets={sets}
                      generos={generos}
                      djs={djs}
                      festivais={festivais}
                      handleAddSet={handleAddSet}
                      handleEditSet={handleEditSet}
                    />
                  }
                />
                <Route
                  path="/editar/:id"
                  element={
                    <AddSetPage
                      sets={sets}
                      generos={generos}
                      djs={djs}
                      festivais={festivais}
                      handleAddSet={handleAddSet}
                      handleEditSet={handleEditSet}
                    />
                  }
                />
                <Route
                  path="/djs/adicionar"
                  element={
                    <AddDjPage
                      djs={djs}
                      generos={generos}
                      handleAddDj={handleAddDj}
                      handleEditDj={handleEditDj}
                      handleDeleteDj={handleDeleteDj}
                    />
                  }
                />
                <Route
                  path="/generos/adicionar"
                  element={
                    <AddGeneroPage
                      generos={generos}
                      handleAddGenero={handleAddGenero}
                      handleEditGenero={handleEditGenero}
                      handleDeleteGenero={handleDeleteGenero}
                    />
                  }
                />
                <Route
                  path="/festivais/adicionar"
                  element={
                    <AddFestivalPage
                      festivais={festivais}
                      generos={generos}
                      handleAddFestival={handleAddFestival}
                      handleEditFestival={handleEditFestival}
                      handleDeleteFestival={handleDeleteFestival}
                    />
                  }
                />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
