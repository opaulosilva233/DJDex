import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar'
import AddSetPage from './pages/AddSetPage'
import AddDjPage from './pages/AddDjPage'
import AddFestivalPage from './pages/AddFestivalPage'
import Home from './pages/Home'
import AddGeneroPage from './pages/AddGeneroPage'
import SetList from './pages/SetList'
import Stats from './pages/Stats'
import DjsList from './pages/DjsList'
import GenerosList from './pages/GenerosList'
import FestivaisList from './pages/FestivaisList'
import {
  djs as initialDjs,
  festivais as initialFestivais,
  generos as initialGeneros,
  sets as initialSets,
} from './data/mockData'

const initialRelationalGeneros = initialGeneros.map((genero) => ({ ...genero }))
const initialRelationalDjs = initialDjs.map((dj) => ({ ...dj }))
const initialRelationalFestivais = initialFestivais.map((festival) => ({ ...festival }))
const initialRelationalSets = initialSets.map((set) => ({ ...set }))

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

function readStoredCollection(storageKey, fallback, normalizer) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const storedCollection = window.localStorage.getItem(storageKey)

  if (!storedCollection) {
    return fallback
  }

  try {
    const parsedCollection = JSON.parse(storedCollection)
    return Array.isArray(parsedCollection)
      ? parsedCollection.map((entry) => (typeof normalizer === 'function' ? normalizer(entry) : entry))
      : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [generos, setGeneros] = useState(() => readStoredCollection('ravedex_generos', initialRelationalGeneros))
  const [djs, setDjs] = useState(() => readStoredCollection('ravedex_djs', initialRelationalDjs, normalizeDj))
  const [festivais, setFestivais] = useState(() =>
    readStoredCollection('ravedex_festivais', initialRelationalFestivais),
  )
  const [sets, setSets] = useState(() => {
    return readStoredCollection('ravedex_sets', initialRelationalSets, normalizeSet)
  })

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
  useEffect(() => {
    window.localStorage.setItem('ravedex_generos', JSON.stringify(generos))
  }, [generos])

  useEffect(() => {
    window.localStorage.setItem('ravedex_djs', JSON.stringify(djs))
  }, [djs])

  useEffect(() => {
    window.localStorage.setItem('ravedex_festivais', JSON.stringify(festivais))
  }, [festivais])

  useEffect(() => {
    window.localStorage.setItem('ravedex_sets', JSON.stringify(sets))
  }, [sets])

  useEffect(() => {
    window.localStorage.setItem('ravedex_theme', JSON.stringify(darkMode))
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function handleAddGenero(novoGenero) {
    setGeneros((currentGeneros) => [novoGenero, ...currentGeneros])
  }

  function handleAddDj(novoDj) {
    setDjs((currentDjs) => [novoDj, ...currentDjs])
  }

  function handleAddFestival(novoFestival) {
    setFestivais((currentFestivais) => [novoFestival, ...currentFestivais])
  }

  function handleAddSet(novoSet) {
    setSets((currentSets) => [novoSet, ...currentSets])
  }

  function handleImportAllData(importedData) {
    if (Array.isArray(importedData)) {
      setSets(importedData.map(normalizeSet))
      return
    }

    if (!importedData || typeof importedData !== 'object') {
      return
    }

    setGeneros(Array.isArray(importedData.generos) ? importedData.generos : [])
    setDjs(Array.isArray(importedData.djs) ? importedData.djs.map(normalizeDj) : [])
    setFestivais(Array.isArray(importedData.festivais) ? importedData.festivais : [])
    setSets(Array.isArray(importedData.sets) ? importedData.sets.map(normalizeSet) : [])
  }

  function handleEditSet(updatedSet) {
    setSets((currentSets) => currentSets.map((set) => (set.id === updatedSet.id ? { ...set, ...updatedSet } : set)))
  }

  function handleEditDj(updatedDj) {
    setDjs((currentDjs) => currentDjs.map((dj) => (dj.id === updatedDj.id ? { ...dj, ...normalizeDj(updatedDj) } : dj)))
  }

  function handleDeleteSet(id) {
    setSets((currentSets) => currentSets.filter((set) => set.id !== id))
  }

  function handleDeleteGenero(id) {
    setGeneros((currentGeneros) => currentGeneros.filter((genero) => genero.id !== id))
    setDjs((currentDjs) =>
      currentDjs.map((dj) => ({
        ...dj,
        generoIds: Array.isArray(dj.generoIds) ? dj.generoIds.filter((generoId) => generoId !== id) : [],
      })),
    )
  }

  function handleDeleteDj(id) {
    setDjs((currentDjs) => currentDjs.filter((dj) => dj.id !== id))
    setSets((currentSets) => currentSets.filter((set) => set.djId !== id))
  }

  function handleDeleteFestival(id) {
    setFestivais((currentFestivais) => currentFestivais.filter((festival) => festival.id !== id))
    setSets((currentSets) => currentSets.filter((set) => set.festivalId !== id))
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
                  />
                }
              />
              <Route
                path="/estatisticas"
                element={
                  <Stats
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
                    handleDeleteGenero={handleDeleteGenero}
                  />
                }
              />
              <Route
                path="/festivais/adicionar"
                element={
                  <AddFestivalPage
                    festivais={festivais}
                    handleAddFestival={handleAddFestival}
                    handleDeleteFestival={handleDeleteFestival}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
