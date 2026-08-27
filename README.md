# 📝 TaskFlow – Smart To-Do & Productivity Application

> An intuitive, offline-first task management web application engineered for speed, visual clarity, and seamless organization.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Documentation](https://img.shields.io/badge/docs-PRD%20%26%20Design-blue.svg)]()
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-purple.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

---

## 🌟 Overview

**TaskFlow** bridges the gap between over-complicated enterprise project tools and bare-bones list apps. It provides:
- **Instant Capture:** Frictionless task creation with keyboard shortcuts (`Enter`, `Esc`, `Ctrl+K`).
- **Eisenhower Prioritization:** Visual P1 (Urgent), P2 (High), P3 (Medium), and P4 (Low) indicators.
- **Offline-First Resilience:** 100% functional without an active internet connection via client-side storage.
- **Progress Tracking:** Dynamic daily completion progress bar and task status breakdown.
- **Dark & Light Mode:** Modern, accessible theme switching tailored for day and night productivity.

---

## 📚 Project Documentation

Detailed specification and architecture documents for this project:

- 📄 **[Product Requirements Document (PRD.md)](./PRD.md)**
  - Product Vision & Executive Summary
  - User Personas & User Stories with Acceptance Criteria
  - Functional Requirements (`FR-1` to `FR-7`)
  - Non-Functional Requirements (`NFR-1` to `NFR-6`)
  - Release Roadmap & KPI Targets

- 📐 **[Technical & System Design Document (design.md)](./design.md)**
  - System Architecture & Reactive State Store Design
  - Component Hierarchy & Flow Diagrams
  - TypeScript Entity Schemas (`Task`, `SubTask`, `Category`, `PriorityLevel`)
  - Mermaid Sequence Diagrams for Core Workflows
  - UI/UX Design System Tokens & Wireframes
  - Storage Adapters (`IStorageAdapter`) & Cloud REST API Contract
  - Requirements Traceability Matrix

---

## ⌨️ Quick Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Focus Search Bar |
| `Enter` | Save / Submit Task |
| `Esc` | Clear Input / Close Modal |
| `Alt + D` | Toggle Dark / Light Theme |

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, Modern Vanilla CSS (Tokens & Variables), JavaScript / TypeScript
- **State Management:** Reactive Reducer / Unidirectional Data Flow
- **Persistence:** `localStorage` / `IndexedDB` Adapter with JSON Export & Import
- **Quality & A11y:** WCAG 2.1 Level AA, Lighthouse Score Target ≥ 95

---

## 👥 Contributors

- **Author:** [JJyayy](https://github.com/JJyayy)
- **Course / Program:** SMU AI Lodge – Week 2 Project
