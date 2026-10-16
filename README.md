[![BuildPulse CI/CD Pipeline](https://github.com/jamespa001/project-buildpulse/actions/workflows/ci.yml/badge.svg)](https://github.com/jamespa001/project-buildpulse/actions/workflows/ci.yml)

# 🚀 BuildPulse

**BuildPulse** is a real-time health and CI monitoring dashboard engineered for developers and engineering teams to oversee workflow statuses, build durations, and pipeline reliability across multiple monitored GitHub repositories.

---

## 🛠️ Engineering Highlights & Architecture

- **Problem & Context:** Tracking workflow execution health, build durations, and test failures across distributed repositories can easily become fragmented without a single pane of glass.
- **Key Technical Decisions:**
  - Architected a high-performance **Next.js App Router** dashboard featuring optimistic pinning and responsive status filtering.
  - Engineered deep-dive telemetry views (`/repo/[name]`) to inspect execution history and success/failure trends.
  - Implemented strict WCAG compliant semantic landmarks, ARIA attributes, and robust keyboard navigation.
- **Results & Metrics:**
  - ⚡ **100 Lighthouse Accessibility** score.
  - 🧪 **100% test coverage & passing suite** using **Vitest** and **React Testing Library**.
  - 🚀 Production-ready CI/CD automation and containerized deployment pipelines.

---

## ✨ Key Features

- **Fleet Summary Dashboard**: High-level KPI banner tracking total monitored repositories, global pass rates, passing/failing workflow counts, and fleet-average build speeds.
- **Advanced Filtering & Search**: Instant client-side filtering by status (_Passing_, _Failing_, _Needs Attention_, _Pinned_) and lightning-fast search by repository name or workflow.
- **Persistent & Optimistic Pinning**: Pin critical repositories to the top of your fleet overview for immediate monitoring access.
- **Deep-Dive Telemetry View**: Inspect detailed execution history, success/failure trends, and analytics per repository (`/repo/[name]`).
- **WCAG Compliant Accessibility**: Fully optimized semantic landmarks (`<main>`, `<header>`, `<section>`, `<h1-h3>`), ARIA attributes (`aria-selected`, `aria-label`), and robust keyboard navigation achieving a **100 Lighthouse Accessibility Score**.
- **Robust Automated Testing**: 100% passing test suite built with **Vitest** and **React Testing Library**.

---

## 📊 Quality, Performance & Test Results

|                     Lighthouse Accessibility Score (100%)                      |                     Lighthouse Performance Score (94%)                     |     Vitest & Testing Library Suite (100% Passing)      |
| :----------------------------------------------------------------------------: | :------------------------------------------------------------------------: | :----------------------------------------------------: |
| ![Lighthouse Accessibility](./public/screenshots/Lighthouse.accessibility.png) | ![Lighthouse Performance](./public/screenshots/Lighthouse.performance.png) | ![Test Results](./public/screenshots/Test.Results.png) |

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, React Server & Client Components)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library, jsdom
- **Deployment**: Vercel / Google Cloud Run (Dockerized)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine.

### Installation & Run

1. Clone the repository:
   ```bash
   git clone [https://github.com/jamespa001/project-buildpulse.git](https://github.com/jamespa001/project-buildpulse.git)
   cd project-buildpulse
   ```
