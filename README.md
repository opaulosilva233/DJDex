# 🎧 DJDex — Electronic Music & DJ Set Tracker

> A Pokédex-inspired web platform designed to catalog, track, and generate analytics for live DJ performances, music festivals, and electronic music genres.

[![Laravel](https://img.shields.io/badge/Laravel_11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🎯 Overview & Concept

Developed in an academic context for **Web & Multimedia II** in the **Multimedia Engineering** degree at ISTEC Porto, **DJDex** was created to act as a personal and comprehensive tracker for festival-goers and electronic music fans.

The platform allows users to log live sets they have attended, explore curated artist profiles, link multi-genre classifications, track festival editions, and generate real-time metrics on music listening habits.

---

## ✨ Key Features

### 🗂️ "DJDex" Artist & Genre Directory
- Comprehensive cataloging of DJs, sub-genres, and regional music styles.
- Multi-to-multi relational mapping between artists and diverse electronic genres (`dj_genero`, `festival_genero`).

### 🎪 Festival & Edition Tracker
- Detailed event logging supporting recurring festival editions (`Festival` & `Edicao` entities).
- History of specific stages, dates, and venues attended.

### 🎛️ Live Sets Logging
- Granular tracking of witnessed performances, including support for Back-to-Back (**B2B**) sets, special edition appearances, and chronological ordering.

### 📊 Real-Time Analytics & Stats (`EstatisticaController` & `EstatisticasPage`)
- Dynamic dashboards aggregating most-watched artists, top genres, festival attendance frequency, and yearly listening distributions.

### 🔐 Secure Authentication & Backoffice
- Token-based API security powered by **Laravel Sanctum**.
- Dedicated management forms for authenticated users to register, edit, and organize artists, genres, sets, and festivals.

---

## 🛠️ Architecture & Tech Stack

* **Backend:** PHP 8.2+ / Laravel 11 (RESTful JSON API)
* **Frontend:** React 18, Vite, React Router, Context API
* **Security & Auth:** Laravel Sanctum (Bearer Token Authentication)
* **Styling & UI:** Tailwind CSS, Lucide Icons
* **Database:** Relational Model with SQLite / MySQL / PostgreSQL
* **DevOps & Containers:** Docker Compose & GitHub Actions (CI workflows)

---

## 👤 Author

**Paulo Silva**
- Website: [paulosilvadev.me](https://paulosilvadev.me/)
- GitHub: [@opaulosilva233](https://github.com/opaulosilva233)