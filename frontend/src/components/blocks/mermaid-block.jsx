import { createReactBlockSpec } from "@blocknote/react";
import { useState, useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";
import {
  Code2, ZoomIn, ZoomOut, Maximize, Trash2, X, RefreshCw,
  Copy, Check, Download, Palette, Layers, ChevronDown, Move, Eye, Settings2
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";

// ── 11 Production Diagram Templates (Vibrant & Color-Coded) ──────
export const DIAGRAM_TEMPLATES = {
  er: {
    name: "Entity Relationship (ER)",
    icon: "🗄️",
    description: "Database schemas, keys, tables & relations",
    code: `erDiagram
  USER ||--o{ POST : "authors"
  USER ||--o{ COMMENT : "writes"
  USER ||--o{ LIKE : "gives"
  USER ||--|| PROFILE : "has"
  POST ||--o{ COMMENT : "contains"
  POST ||--o{ LIKE : "receives"
  POST }o--o{ TAG : "categorized_by"
  CATEGORY ||--o{ POST : "includes"

  USER {
    string id PK "User UUID"
    string username "Display Name"
    string email "User Email"
    string role "admin | author | reader"
    datetime created_at "Registration Date"
  }
  PROFILE {
    string id PK "Profile UUID"
    string user_id FK "References USER"
    string bio "Short Bio"
    string avatar "Profile Photo URL"
  }
  POST {
    string id PK "Post Slug UUID"
    string author_id FK "References USER"
    string category_id FK "References CATEGORY"
    string title "Article Title"
    string content "BlockNote Document"
    string status "draft | published"
    datetime published_at "Publish Date"
  }
  COMMENT {
    string id PK "Comment UUID"
    string post_id FK "References POST"
    string author_id FK "References USER"
    string text "Comment Body"
    datetime created_at "Created Timestamp"
  }
  LIKE {
    string id PK "Like UUID"
    string post_id FK "References POST"
    string user_id FK "References USER"
  }
  TAG {
    string id PK "Tag ID"
    string name "Tag Name"
  }
  CATEGORY {
    string id PK "Category ID"
    string name "Category Name"
  }`
  },
  flowchart: {
    name: "Flowchart",
    icon: "📊",
    description: "Workflows, processes & decision trees",
    code: `flowchart TD
  Start([🚀 Project Kickoff]):::startNode --> Design[🎨 UI/UX Architecture]
  Design --> Frontend[💻 Frontend: React & BlockNote]
  Design --> Backend[⚙️ Backend: Node & Express]
  Frontend --> Review{🔍 Code Review?}:::decisionNode
  Backend --> Review
  Review -->|Approved| Deploy([🚢 Production Deploy]):::successNode
  Review -->|Changes Needed| Design

  classDef startNode fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#ffffff;
  classDef decisionNode fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff;
  classDef successNode fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff;`
  },
  sequence: {
    name: "Sequence Diagram",
    icon: "🔄",
    description: "System interactions & message flows",
    code: `sequenceDiagram
  autonumber
  actor User as 👤 Reader / Author
  participant App as 📱 Web Frontend
  participant API as ⚡ Backend Server
  participant Storage as ☁️ Google Drive
  participant DB as 🗄️ Database

  User->>App: Click 'Publish Story'
  App->>API: POST /api/blogs/create (Bearer JWT)
  API->>Storage: Upload WebP Assets & Banner
  Storage-->>API: 200 OK (Asset URLs)
  API->>DB: Save Story Document (Blocks JSON)
  DB-->>API: Created blog_id
  API-->>App: 201 Created
  App-->>User: 🎉 Toast: Story Published!`
  },
  class: {
    name: "Class Diagram",
    icon: "🧱",
    description: "OOP models, methods & relations",
    code: `classDiagram
  class BlogPost {
    +String blog_id
    +String title
    +String banner
    +Array blocks
    +Date publishedAt
    +publish()
    +saveDraft()
  }
  class User {
    +String username
    +String email
    +String avatar
    +createPost()
    +addComment()
  }
  class Comment {
    +String comment_id
    +String text
    +Array children
  }
  User "1" --> "*" BlogPost : writes
  BlogPost "1" --> "*" Comment : contains`
  },
  state: {
    name: "State Machine",
    icon: "⚡",
    description: "State lifecycles & transitions",
    code: `stateDiagram-v2
  [*] --> Draft : Create New Story
  Draft --> Review : Submit for Review
  Review --> Published : Editorial Approval
  Review --> ChangesRequested : Feedback Given
  ChangesRequested --> Review : Resubmit
  Published --> Archived : Deprecate
  Published --> [*]
  Archived --> [*]`
  },
  gantt: {
    name: "Gantt Roadmap",
    icon: "📅",
    description: "Project timelines, sprints & milestones",
    code: `gantt
  title 🚀 Platform Roadmap 2026
  dateFormat YYYY-MM-DD
  section Core Engine
    Architecture Design   :done,    a1, 2026-09-01, 2026-09-10
    Mermaid Diagram Block   :active,  b1, 2026-09-11, 2026-09-18
    Excalidraw Integration :active,  b2, 2026-09-15, 2026-09-22
  section Experience
    Mobile Toolbar Redesign :        c1, 2026-09-20, 2026-09-27
    Theme Perfection & Polish :      c2, 2026-09-25, 2026-10-02`
  },
  pie: {
    name: "Pie Chart",
    icon: "🥧",
    description: "Distribution & statistics breakdowns",
    code: `pie title 📊 Blog Topic Distribution
  "Web Development" : 42
  "System Architecture" : 26
  "UI / UX Design" : 18
  "DevOps & Cloud" : 14`
  },
  mindmap: {
    name: "Mindmap",
    icon: "🧠",
    description: "Brainstorming & hierarchical topics",
    code: `mindmap
  root((🚀 Modern Blog Engine))
    Content Creation
      BlockNote WYSIWYG
      Mermaid Diagrams
      Excalidraw Whiteboard
      Code Highlighting
    Media & Storage
      WebP Optimization
      Drive CDN Fallbacks
      Resilient Uploads
    Performance
      Multi-touch Pinch Zoom
      Dynamic Theming
      Responsive Mobile UX`
  },
  timeline: {
    name: "Timeline",
    icon: "⏳",
    description: "Historical milestones & roadmaps",
    code: `timeline
  title 🌟 Blog Platform Evolution
  2024 : Initial Release : Simple Markdown Editor : Basic Auth
  2025 : Cloud Integration : Drive Storage : Interactive Comments
  2026 : Block Architecture : Mermaid & Excalidraw : Responsive Mobile`
  },
  journey: {
    name: "User Journey",
    icon: "🗺️",
    description: "Customer experience & touchpoints",
    code: `journey
  title ✍️ Author Publishing Experience
  section Inspiration
    Browse Topics: 5: Author
    Outline Article: 4: Author
  section Creation
    Write Content: 5: Author
    Insert Mermaid ER Diagram: 5: Author
    Draw Excalidraw Wireframe: 5: Author
  section Publishing
    Preview Story: 5: Author, Reader
    One-click Publish: 5: Author`
  },
  gitGraph: {
    name: "Git Graph",
    icon: "🌿",
    description: "Branching workflows, commits & merges",
    code: `gitGraph
  commit id: "init-repo"
  branch feature/diagrams
  checkout feature/diagrams
  commit id: "add-er-schema"
  commit id: "compact-view-pill"
  checkout main
  merge feature/diagrams tag: "v2.5.0"
  commit id: "theme-perfect"`
  }
};

// ── 6 Rich Theme Palettes (Vibrant, Theme-Perfect, ER & All Types) ──
export const THEME_PALETTES = {
  vibrant: {
    name: "Vibrant Indigo",
    icon: "✨",
    getConfig: (isDark) => ({
      theme: "base",
      themeVariables: {
        darkMode: isDark,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        // Primary Accents
        primaryColor: isDark ? "#6366f1" : "#4f46e5",
        primaryTextColor: "#ffffff",
        primaryBorderColor: isDark ? "#818cf8" : "#4338ca",
        lineColor: isDark ? "#818cf8" : "#4f46e5",
        secondaryColor: isDark ? "#8b5cf6" : "#7c3aed",
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: isDark ? "#a78bfa" : "#6d28d9",
        tertiaryColor: isDark ? "#1e1b4b" : "#f5f3ff",
        tertiaryTextColor: isDark ? "#e0e7ff" : "#312e81",
        tertiaryBorderColor: isDark ? "#4338ca" : "#c7d2fe",
        // Main & Flowchart Nodes (High-contrast text in light and dark mode)
        mainBkg: isDark ? "#1e1b4b" : "#f5f3ff",
        nodeBkg: isDark ? "#1e1b4b" : "#f5f3ff",
        nodeBorder: isDark ? "#818cf8" : "#6366f1",
        nodeTextColor: isDark ? "#f8fafc" : "#1e1b4b",
        textColor: isDark ? "#f8fafc" : "#0f172a",
        titleColor: isDark ? "#e0e7ff" : "#312e81",
        // Subgraphs / Clusters
        clusterBkg: isDark ? "#0f172a" : "#faf5ff",
        clusterBorder: isDark ? "#4338ca" : "#c084fc",
        clusterTextColor: isDark ? "#e0e7ff" : "#4c1d95",
        // Connectors & Edge Labels
        edgeLabelBackground: isDark ? "#1e1b4b" : "#ffffff",
        defaultLinkColor: isDark ? "#818cf8" : "#4f46e5",
        arrowheadColor: isDark ? "#818cf8" : "#4f46e5",
        // ER Diagram
        entityBkg: isDark ? "#312e81" : "#4f46e5",
        entityBorder: isDark ? "#818cf8" : "#4338ca",
        entityTextColor: "#ffffff",
        attributeBackgroundColorOdd: isDark ? "#1e1b4b" : "#f5f3ff",
        attributeBackgroundColorEven: isDark ? "#161536" : "#ffffff",
        attributeTextColor: isDark ? "#e0e7ff" : "#1e1b4b",
        relationColor: isDark ? "#a78bfa" : "#4f46e5",
        relationLabelColor: isDark ? "#c4b5fd" : "#4338ca",
        relationLabelBackground: isDark ? "#1e1b4b" : "#ffffff",
        // Sequence Diagram
        actorBkg: isDark ? "#312e81" : "#e0e7ff",
        actorBorder: isDark ? "#818cf8" : "#4f46e5",
        actorTextColor: isDark ? "#ffffff" : "#1e1b4b",
        actorLineColor: isDark ? "#818cf8" : "#4f46e5",
        signalColor: isDark ? "#a78bfa" : "#4f46e5",
        signalTextColor: isDark ? "#f3f4f6" : "#1e1b4b",
        labelBoxBkgColor: isDark ? "#1e1b4b" : "#f5f3ff",
        labelBoxBorderColor: isDark ? "#818cf8" : "#4f46e5",
        labelTextColor: isDark ? "#e0e7ff" : "#1e1b4b",
        noteBkgColor: isDark ? "#312e81" : "#ede9fe",
        noteBorderColor: isDark ? "#6366f1" : "#4f46e5",
        noteTextColor: isDark ? "#f3f4f6" : "#1e1b4b",
        activationBkgColor: isDark ? "#4338ca" : "#c7d2fe",
        activationBorderColor: isDark ? "#818cf8" : "#4f46e5",
        sequenceNumberColor: "#ffffff",
        // Class Diagram
        classText: isDark ? "#f8fafc" : "#1e1b4b",
        // State Diagram
        stateBkg: isDark ? "#1e1b4b" : "#f5f3ff",
        stateLabelColor: isDark ? "#f8fafc" : "#1e1b4b",
        labelBackgroundColor: isDark ? "#1e1b4b" : "#ffffff",
        transitionColor: isDark ? "#818cf8" : "#4f46e5",
        transitionLabelColor: isDark ? "#e0e7ff" : "#1e1b4b",
        specialStateColor: isDark ? "#818cf8" : "#4f46e5",
        // Gantt Roadmap
        sectionBkgColor: isDark ? "#1e293b" : "#f5f3ff",
        altSectionBkgColor: isDark ? "#0f172a" : "#ffffff",
        taskBkgColor: isDark ? "#6366f1" : "#4f46e5",
        taskBorderColor: isDark ? "#818cf8" : "#4338ca",
        taskTextColor: "#ffffff",
        taskTextOutsideColor: isDark ? "#f8fafc" : "#0f172a",
        taskTextLightColor: "#ffffff",
        activeTaskBkgColor: isDark ? "#8b5cf6" : "#7c3aed",
        doneTaskBkgColor: isDark ? "#10b981" : "#059669",
        critBkgColor: isDark ? "#f43f5e" : "#e11d48",
        gridColor: isDark ? "#334155" : "#e2e8f0",
        todayLineColor: isDark ? "#f59e0b" : "#d97706",
        // Pie Chart
        pie1: isDark ? "#6366f1" : "#4f46e5",
        pie2: isDark ? "#8b5cf6" : "#7c3aed",
        pie3: isDark ? "#06b6d4" : "#0284c7",
        pie4: isDark ? "#10b981" : "#059669",
        pie5: isDark ? "#f59e0b" : "#d97706",
        pie6: isDark ? "#ec4899" : "#db2777",
        pieTitleTextColor: isDark ? "#f8fafc" : "#0f172a",
        pieSectionTextColor: "#ffffff",
        pieLegendTextColor: isDark ? "#f8fafc" : "#0f172a",
        pieStrokeColor: isDark ? "#0f172a" : "#ffffff",
        // Git Graph
        git0: "#6366f1",
        git1: "#10b981",
        git2: "#f59e0b",
        git3: "#ec4899",
        git4: "#06b6d4",
        gitBranchLabel0: "#ffffff",
        gitBranchLabel1: "#ffffff",
        gitBranchLabel2: "#ffffff",
        gitBranchLabel3: "#ffffff",
        gitBranchLabel4: "#ffffff",
        commitLabelColor: isDark ? "#f8fafc" : "#0f172a",
        commitLabelBackground: isDark ? "#1e1b4b" : "#f1f5f9",
        tagLabelColor: "#ffffff",
        tagLabelBackground: isDark ? "#6366f1" : "#4f46e5",
      }
    })
  },
  ocean: {
    name: "Ocean Blue",
    icon: "🌊",
    getConfig: (isDark) => ({
      theme: "base",
      themeVariables: {
        darkMode: isDark,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        primaryColor: isDark ? "#38bdf8" : "#0284c7",
        primaryTextColor: "#ffffff",
        primaryBorderColor: isDark ? "#7dd3fc" : "#0369a1",
        lineColor: isDark ? "#38bdf8" : "#0284c7",
        secondaryColor: isDark ? "#06b6d4" : "#0891b2",
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: isDark ? "#67e8f9" : "#0e7490",
        tertiaryColor: isDark ? "#082f49" : "#f0f9ff",
        tertiaryTextColor: isDark ? "#e0f2fe" : "#075985",
        tertiaryBorderColor: isDark ? "#0369a1" : "#bae6fd",
        mainBkg: isDark ? "#082f49" : "#f0f9ff",
        nodeBkg: isDark ? "#082f49" : "#f0f9ff",
        nodeBorder: isDark ? "#38bdf8" : "#0284c7",
        nodeTextColor: isDark ? "#f0f9ff" : "#0c4a6e",
        textColor: isDark ? "#f0f9ff" : "#0f172a",
        titleColor: isDark ? "#7dd3fc" : "#0369a1",
        clusterBkg: isDark ? "#032b43" : "#f0f9ff",
        clusterBorder: isDark ? "#075985" : "#7dd3fc",
        clusterTextColor: isDark ? "#7dd3fc" : "#0369a1",
        edgeLabelBackground: isDark ? "#082f49" : "#ffffff",
        defaultLinkColor: isDark ? "#38bdf8" : "#0284c7",
        arrowheadColor: isDark ? "#38bdf8" : "#0284c7",
        entityBkg: isDark ? "#0369a1" : "#0284c7",
        entityBorder: isDark ? "#38bdf8" : "#0369a1",
        entityTextColor: "#ffffff",
        attributeBackgroundColorOdd: isDark ? "#082f49" : "#f0f9ff",
        attributeBackgroundColorEven: isDark ? "#052033" : "#ffffff",
        attributeTextColor: isDark ? "#e0f2fe" : "#0c4a6e",
        relationColor: isDark ? "#38bdf8" : "#0284c7",
        relationLabelColor: isDark ? "#7dd3fc" : "#0369a1",
        relationLabelBackground: isDark ? "#082f49" : "#ffffff",
        actorBkg: isDark ? "#0369a1" : "#e0f2fe",
        actorBorder: isDark ? "#38bdf8" : "#0284c7",
        actorTextColor: isDark ? "#ffffff" : "#0c4a6e",
        actorLineColor: isDark ? "#38bdf8" : "#0284c7",
        signalColor: isDark ? "#38bdf8" : "#0284c7",
        signalTextColor: isDark ? "#f0f9ff" : "#0c4a6e",
        labelBoxBkgColor: isDark ? "#082f49" : "#f0f9ff",
        labelBoxBorderColor: isDark ? "#38bdf8" : "#0284c7",
        labelTextColor: isDark ? "#e0f2fe" : "#0c4a6e",
        noteBkgColor: isDark ? "#075985" : "#e0f2fe",
        noteBorderColor: isDark ? "#38bdf8" : "#0284c7",
        noteTextColor: isDark ? "#f0f9ff" : "#0c4a6e",
        classText: isDark ? "#f0f9ff" : "#0c4a6e",
        stateBkg: isDark ? "#082f49" : "#f0f9ff",
        stateLabelColor: isDark ? "#f0f9ff" : "#0c4a6e",
        labelBackgroundColor: isDark ? "#082f49" : "#ffffff",
        transitionColor: isDark ? "#38bdf8" : "#0284c7",
        transitionLabelColor: isDark ? "#7dd3fc" : "#0c4a6e",
        specialStateColor: isDark ? "#38bdf8" : "#0284c7",
        git0: "#0284c7",
        git1: "#06b6d4",
        git2: "#38bdf8",
      }
    })
  },
  forest: {
    name: "Forest Emerald",
    icon: "🌲",
    getConfig: (isDark) => ({
      theme: "base",
      themeVariables: {
        darkMode: isDark,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        primaryColor: isDark ? "#34d399" : "#059669",
        primaryTextColor: "#ffffff",
        primaryBorderColor: isDark ? "#6ee7b7" : "#047857",
        lineColor: isDark ? "#34d399" : "#059669",
        secondaryColor: isDark ? "#10b981" : "#047857",
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: isDark ? "#6ee7b7" : "#065f46",
        tertiaryColor: isDark ? "#064e3b" : "#ecfdf5",
        tertiaryTextColor: isDark ? "#d1fae5" : "#065f46",
        tertiaryBorderColor: isDark ? "#059669" : "#a7f3d0",
        mainBkg: isDark ? "#064e3b" : "#ecfdf5",
        nodeBkg: isDark ? "#064e3b" : "#ecfdf5",
        nodeBorder: isDark ? "#34d399" : "#059669",
        nodeTextColor: isDark ? "#ecfdf5" : "#064e3b",
        textColor: isDark ? "#ecfdf5" : "#064e3b",
        titleColor: isDark ? "#6ee7b7" : "#065f46",
        clusterBkg: isDark ? "#022c22" : "#f0fdf4",
        clusterBorder: isDark ? "#047857" : "#86efac",
        clusterTextColor: isDark ? "#6ee7b7" : "#065f46",
        edgeLabelBackground: isDark ? "#064e3b" : "#ffffff",
        defaultLinkColor: isDark ? "#34d399" : "#059669",
        arrowheadColor: isDark ? "#34d399" : "#059669",
        entityBkg: isDark ? "#047857" : "#059669",
        entityBorder: isDark ? "#34d399" : "#047857",
        entityTextColor: "#ffffff",
        attributeBackgroundColorOdd: isDark ? "#064e3b" : "#ecfdf5",
        attributeBackgroundColorEven: isDark ? "#022c22" : "#ffffff",
        attributeTextColor: isDark ? "#d1fae5" : "#065f46",
        relationColor: isDark ? "#34d399" : "#059669",
        relationLabelColor: isDark ? "#6ee7b7" : "#047857",
        relationLabelBackground: isDark ? "#022c22" : "#ffffff",
        actorBkg: isDark ? "#047857" : "#d1fae5",
        actorBorder: isDark ? "#34d399" : "#059669",
        actorTextColor: isDark ? "#ffffff" : "#064e3b",
        actorLineColor: isDark ? "#34d399" : "#059669",
        signalColor: isDark ? "#34d399" : "#059669",
        signalTextColor: isDark ? "#ecfdf5" : "#064e3b",
        labelBoxBkgColor: isDark ? "#064e3b" : "#ecfdf5",
        labelBoxBorderColor: isDark ? "#34d399" : "#059669",
        labelTextColor: isDark ? "#d1fae5" : "#064e3b",
        noteBkgColor: isDark ? "#065f46" : "#d1fae5",
        noteBorderColor: isDark ? "#34d399" : "#059669",
        noteTextColor: isDark ? "#ecfdf5" : "#064e3b",
        classText: isDark ? "#ecfdf5" : "#064e3b",
        stateBkg: isDark ? "#064e3b" : "#ecfdf5",
        stateLabelColor: isDark ? "#ecfdf5" : "#064e3b",
        labelBackgroundColor: isDark ? "#064e3b" : "#ffffff",
        transitionColor: isDark ? "#34d399" : "#059669",
        transitionLabelColor: isDark ? "#6ee7b7" : "#064e3b",
        specialStateColor: isDark ? "#34d399" : "#059669",
        git0: "#059669",
        git1: "#10b981",
        git2: "#34d399",
      }
    })
  },
  sunset: {
    name: "Warm Sunset",
    icon: "🌅",
    getConfig: (isDark) => ({
      theme: "base",
      themeVariables: {
        darkMode: isDark,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        primaryColor: isDark ? "#fb7185" : "#e11d48",
        primaryTextColor: "#ffffff",
        primaryBorderColor: isDark ? "#fda4af" : "#be123c",
        lineColor: isDark ? "#fb7185" : "#e11d48",
        secondaryColor: isDark ? "#f59e0b" : "#d97706",
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: isDark ? "#fbbf24" : "#b45309",
        tertiaryColor: isDark ? "#4c0519" : "#fff1f2",
        tertiaryTextColor: isDark ? "#ffe4e6" : "#9f1239",
        tertiaryBorderColor: isDark ? "#be123c" : "#fecdd3",
        mainBkg: isDark ? "#4c0519" : "#fff1f2",
        nodeBkg: isDark ? "#4c0519" : "#fff1f2",
        nodeBorder: isDark ? "#fb7185" : "#e11d48",
        nodeTextColor: isDark ? "#ffe4e6" : "#881337",
        textColor: isDark ? "#fff1f2" : "#18181b",
        titleColor: isDark ? "#fda4af" : "#9f1239",
        clusterBkg: isDark ? "#2b020d" : "#fff5f5",
        clusterBorder: isDark ? "#be123c" : "#fecdd3",
        clusterTextColor: isDark ? "#fda4af" : "#9f1239",
        edgeLabelBackground: isDark ? "#4c0519" : "#ffffff",
        defaultLinkColor: isDark ? "#fb7185" : "#e11d48",
        arrowheadColor: isDark ? "#fb7185" : "#e11d48",
        entityBkg: isDark ? "#be123c" : "#e11d48",
        entityBorder: isDark ? "#fb7185" : "#be123c",
        entityTextColor: "#ffffff",
        attributeBackgroundColorOdd: isDark ? "#4c0519" : "#fff1f2",
        attributeBackgroundColorEven: isDark ? "#2b020d" : "#ffffff",
        attributeTextColor: isDark ? "#ffe4e6" : "#9f1239",
        relationColor: isDark ? "#fb7185" : "#e11d48",
        relationLabelColor: isDark ? "#fda4af" : "#9f1239",
        relationLabelBackground: isDark ? "#2b020d" : "#ffffff",
        actorBkg: isDark ? "#be123c" : "#ffe4e6",
        actorBorder: isDark ? "#fb7185" : "#e11d48",
        actorTextColor: isDark ? "#ffffff" : "#881337",
        actorLineColor: isDark ? "#fb7185" : "#e11d48",
        signalColor: isDark ? "#fb7185" : "#e11d48",
        signalTextColor: isDark ? "#fff1f2" : "#881337",
        labelBoxBkgColor: isDark ? "#4c0519" : "#fff1f2",
        labelBoxBorderColor: isDark ? "#fb7185" : "#e11d48",
        labelTextColor: isDark ? "#ffe4e6" : "#9f1239",
        noteBkgColor: isDark ? "#9f1239" : "#fee2e2",
        noteBorderColor: isDark ? "#fb7185" : "#e11d48",
        noteTextColor: isDark ? "#fff1f2" : "#881337",
        classText: isDark ? "#fff1f2" : "#881337",
        stateBkg: isDark ? "#4c0519" : "#fff1f2",
        stateLabelColor: isDark ? "#ffe4e6" : "#881337",
        labelBackgroundColor: isDark ? "#4c0519" : "#ffffff",
        transitionColor: isDark ? "#fb7185" : "#e11d48",
        transitionLabelColor: isDark ? "#fda4af" : "#881337",
        specialStateColor: isDark ? "#fb7185" : "#e11d48",
        git0: "#e11d48",
        git1: "#f59e0b",
        git2: "#fb7185",
      }
    })
  },
  dark: {
    name: "Cyber Dark",
    icon: "🌙",
    getConfig: () => ({
      theme: "dark",
      themeVariables: {
        darkMode: true,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        background: "#090d16",
        primaryColor: "#8b5cf6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#7c3aed",
        lineColor: "#a78bfa",
        secondaryColor: "#06b6d4",
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: "#0891b2",
        tertiaryColor: "#1e1b4b",
        tertiaryTextColor: "#c4b5fd",
        tertiaryBorderColor: "#6d28d9",
        mainBkg: "#0f172a",
        nodeBkg: "#0f172a",
        nodeBorder: "#7c3aed",
        nodeTextColor: "#f3f4f6",
        textColor: "#f3f4f6",
        titleColor: "#c4b5fd",
        clusterBkg: "#090d16",
        clusterBorder: "#4338ca",
        clusterTextColor: "#c4b5fd",
        edgeLabelBackground: "#1e1b4b",
        defaultLinkColor: "#a78bfa",
        arrowheadColor: "#a78bfa",
        entityBkg: "#7c3aed",
        entityBorder: "#a78bfa",
        entityTextColor: "#ffffff",
        attributeBackgroundColorOdd: "#18182e",
        attributeBackgroundColorEven: "#0f111d",
        attributeTextColor: "#e0e7ff",
        relationColor: "#06b6d4",
        relationLabelColor: "#67e8f9",
        relationLabelBackground: "#090d16",
        actorBkg: "#6d28d9",
        actorBorder: "#8b5cf6",
        actorTextColor: "#ffffff",
        actorLineColor: "#a78bfa",
        signalColor: "#a78bfa",
        signalTextColor: "#f3f4f6",
        labelBoxBkgColor: "#1e1b4b",
        labelBoxBorderColor: "#7c3aed",
        labelTextColor: "#e0e7ff",
        noteBkgColor: "#581c87",
        noteBorderColor: "#8b5cf6",
        noteTextColor: "#f3f4f6",
        classText: "#f3f4f6",
        stateBkg: "#1e1b4b",
        stateLabelColor: "#f3f4f6",
        labelBackgroundColor: "#090d16",
        transitionColor: "#a78bfa",
        transitionLabelColor: "#c4b5fd",
        specialStateColor: "#8b5cf6",
        git0: "#8b5cf6",
        git1: "#06b6d4",
        git2: "#a78bfa",
      }
    })
  },
  neutral: {
    name: "Clean Slate",
    icon: "⚪",
    getConfig: (isDark) => ({
      theme: "base",
      themeVariables: {
        darkMode: isDark,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        primaryColor: isDark ? "#94a3b8" : "#475569",
        primaryTextColor: "#ffffff",
        primaryBorderColor: isDark ? "#cbd5e1" : "#334155",
        lineColor: isDark ? "#94a3b8" : "#475569",
        secondaryColor: isDark ? "#64748b" : "#64748b",
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: isDark ? "#94a3b8" : "#475569",
        tertiaryColor: isDark ? "#0f172a" : "#f1f5f9",
        tertiaryTextColor: isDark ? "#e2e8f0" : "#1e293b",
        tertiaryBorderColor: isDark ? "#334155" : "#cbd5e1",
        mainBkg: isDark ? "#1e293b" : "#f8fafc",
        nodeBkg: isDark ? "#1e293b" : "#f8fafc",
        nodeBorder: isDark ? "#64748b" : "#94a3b8",
        nodeTextColor: isDark ? "#f8fafc" : "#0f172a",
        textColor: isDark ? "#f8fafc" : "#0f172a",
        titleColor: isDark ? "#e2e8f0" : "#1e293b",
        clusterBkg: isDark ? "#0f172a" : "#f1f5f9",
        clusterBorder: isDark ? "#334155" : "#cbd5e1",
        clusterTextColor: isDark ? "#e2e8f0" : "#1e293b",
        edgeLabelBackground: isDark ? "#1e293b" : "#ffffff",
        defaultLinkColor: isDark ? "#94a3b8" : "#475569",
        arrowheadColor: isDark ? "#94a3b8" : "#475569",
        entityBkg: isDark ? "#334155" : "#475569",
        entityBorder: isDark ? "#64748b" : "#334155",
        entityTextColor: "#ffffff",
        attributeBackgroundColorOdd: isDark ? "#1e293b" : "#f1f5f9",
        attributeBackgroundColorEven: isDark ? "#0f172a" : "#ffffff",
        attributeTextColor: isDark ? "#f1f5f9" : "#1e293b",
        relationColor: isDark ? "#94a3b8" : "#475569",
        relationLabelColor: isDark ? "#cbd5e1" : "#334155",
        relationLabelBackground: isDark ? "#0f172a" : "#ffffff",
        actorBkg: isDark ? "#334155" : "#e2e8f0",
        actorBorder: isDark ? "#64748b" : "#475569",
        actorTextColor: isDark ? "#ffffff" : "#0f172a",
        actorLineColor: isDark ? "#94a3b8" : "#475569",
        signalColor: isDark ? "#94a3b8" : "#475569",
        signalTextColor: isDark ? "#f8fafc" : "#0f172a",
        labelBoxBkgColor: isDark ? "#1e293b" : "#f1f5f9",
        labelBoxBorderColor: isDark ? "#64748b" : "#475569",
        labelTextColor: isDark ? "#f8fafc" : "#0f172a",
        noteBkgColor: isDark ? "#475569" : "#e2e8f0",
        noteBorderColor: isDark ? "#94a3b8" : "#475569",
        noteTextColor: isDark ? "#f8fafc" : "#0f172a",
        classText: isDark ? "#f8fafc" : "#0f172a",
        stateBkg: isDark ? "#1e293b" : "#f8fafc",
        stateLabelColor: isDark ? "#f8fafc" : "#0f172a",
        labelBackgroundColor: isDark ? "#1e293b" : "#ffffff",
        transitionColor: isDark ? "#94a3b8" : "#475569",
        transitionLabelColor: isDark ? "#e2e8f0" : "#0f172a",
        specialStateColor: isDark ? "#94a3b8" : "#475569",
      }
    })
  }
};

// ── Mermaid Global Init Guard & Cache ─────────────────────────────
let mermaidInitializedKey = null;
const svgCache = new Map();

function ensureMermaidInit(themeKey, isDark) {
  const initKey = `${themeKey}_${isDark ? "dark" : "light"}`;
  if (mermaidInitializedKey !== initKey) {
    const palette = THEME_PALETTES[themeKey] || THEME_PALETTES.vibrant;
    const config = palette.getConfig(isDark);

    mermaid.initialize({
      startOnLoad: false,
      theme: config.theme,
      themeVariables: config.themeVariables || {},
      suppressErrorRendering: true,
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
      },
      er: {
        useMaxWidth: false,
      },
    });
    mermaidInitializedKey = initKey;
  }
}

export const MermaidBlock = createReactBlockSpec(
  {
    type: "mermaid",
    propSchema: {
      code: {
        default: DIAGRAM_TEMPLATES.er.code,
      },
      view: {
        default: "diagram", // "diagram" | "code" | "split"
      },
      theme: {
        default: "vibrant",
      },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const code = block.props.code ?? DIAGRAM_TEMPLATES.er.code;
      const view = block.props.view || "diagram";
      const currentTheme = block.props.theme || "vibrant";

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [svgCode, setSvgCode] = useState("");
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [error, setError] = useState(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const containerRef = useRef(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isFullscreen, setIsFullscreen] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isInteractive, setIsInteractive] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isInViewport, setIsInViewport] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const blockRootRef = useRef(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const hasRenderedRef = useRef(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isCopied, setIsCopied] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showTemplates, setShowTemplates] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showThemes, setShowThemes] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showOptions, setShowOptions] = useState(false);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const optionsMenuRef = useRef(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const templatesMenuRef = useRef(null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const themesMenuRef = useRef(null);

      // Close open menus on outside click
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        const handleClickOutside = (e) => {
          if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
            setShowOptions(false);
          }
          if (templatesMenuRef.current && !templatesMenuRef.current.contains(e.target)) {
            setShowTemplates(false);
          }
          if (themesMenuRef.current && !themesMenuRef.current.contains(e.target)) {
            setShowThemes(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      // Detect dark mode from document attribute
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isDark, setIsDark] = useState(() =>
        typeof document !== "undefined" && (
          document.documentElement.classList.contains("dark") ||
          document.documentElement.getAttribute("data-theme") === "dark"
        )
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (typeof document === "undefined") return;
        const observer = new MutationObserver(() => {
          const nowDark =
            document.documentElement.classList.contains("dark") ||
            document.documentElement.getAttribute("data-theme") === "dark";
          setIsDark(nowDark);
          // Clear the entire SVG cache when app theme changes so all diagrams
          // re-render with the correct dark/light palette variables.
          svgCache.clear();
          mermaidInitializedKey = null;
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
        return () => observer.disconnect();
      }, []);

      // Force re-render of diagram when isDark or currentTheme changes
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        hasRenderedRef.current = false;
        setSvgCode("");
        setError(null);
        setIsInViewport(true);
      }, [isDark, currentTheme]); // eslint-disable-line react-hooks/exhaustive-deps

      // Check if rendered inside reader view (published story reader mode)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isReaderMode, setIsReaderMode] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (editor?.isEditable === false) {
          setIsReaderMode(true);
          return;
        }
        const el = blockRootRef.current;
        if (el) {
          const inReader = el.closest(".blocknote-reader-view, [contenteditable='false'].bn-editor");
          if (inReader) {
            setIsReaderMode(true);
          }
        }
      }, [editor?.isEditable]);

      const isBlockEditable = Boolean(editor?.isEditable !== false && !isReaderMode);

      // ── Intersection Observer ──
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        const el = blockRootRef.current;
        if (!el || typeof IntersectionObserver === "undefined") {
          setIsInViewport(true);
          return;
        }
        const io = new IntersectionObserver(
          ([entry]) => setIsInViewport(entry.isIntersecting),
          { rootMargin: "300px" }
        );
        io.observe(el);
        return () => io.disconnect();
      }, []);

      // Force render for print
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        const onBeforePrint = () => setIsInViewport(true);
        window.addEventListener("beforeprint", onBeforePrint);
        return () => window.removeEventListener("beforeprint", onBeforePrint);
      }, []);

      // ── Diagram rendering ──
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (!isInViewport && !hasRenderedRef.current) return;

        const cacheKey = `${currentTheme}_${isDark ? "dark" : "light"}_${code}`;

        if (svgCache.has(cacheKey)) {
          const cachedSvg = svgCache.get(cacheKey);
          if (svgCode !== cachedSvg) {
            setSvgCode(cachedSvg);
            setError(null);
            hasRenderedRef.current = true;
          }
          return;
        }

        // Cache miss — clear stale SVG and re-render
        setSvgCode("");
        setError(null);
        hasRenderedRef.current = false;

        let isMounted = true;
        const renderDiagram = async () => {
          if (!code || !code.trim()) {
            if (isMounted) { setSvgCode(""); setError(null); }
            return;
          }

          const rawId = block.id ? String(block.id).replace(/[^a-zA-Z0-9_-]/g, "") : "";
          const safeId = `mermaid_${rawId || Math.random().toString(36).slice(2, 9)}_${Date.now()}`;

          try {
            ensureMermaidInit(currentTheme, isDark);

            let isValid = false;
            try {
              const parseResult = await mermaid.parse(code, { suppressErrors: true });
              isValid = Boolean(parseResult);
            } catch {
              isValid = false;
            }

            if (!isValid) {
              if (isMounted) {
                setError("Syntax error — check diagram code or choose a template.");
                setSvgCode("");
              }
              return;
            }

            const { svg } = await mermaid.render(safeId, code);
            if (isMounted) {
              svgCache.set(cacheKey, svg);
              setSvgCode(svg);
              setError(null);
              hasRenderedRef.current = true;
            }
          } catch (e) {
            if (isMounted) {
              setError(e?.message?.includes("Syntax") ? "Syntax error in Mermaid code." : (e?.message || "Failed to render"));
              setSvgCode("");
            }
          }
        };

        const timeout = setTimeout(renderDiagram, 300);
        return () => { isMounted = false; clearTimeout(timeout); };
      }, [code, isDark, currentTheme, block.id, isInViewport]); // eslint-disable-line react-hooks/exhaustive-deps

      // Escape fullscreen
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useEffect(() => {
        if (!isFullscreen) return;
        const handleKeyDown = (e) => { if (e.key === "Escape") setIsFullscreen(false); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [isFullscreen]);

      const setView = (v) => editor.updateBlock(block, { props: { ...block.props, view: v } });

      const handleRefresh = () => {
        const cacheKey = `${currentTheme}_${isDark ? "dark" : "light"}_${code}`;
        svgCache.delete(cacheKey);
        setSvgCode("");
        setError(null);
        hasRenderedRef.current = false;
        setIsInViewport(true);
      };

      const selectTemplate = (key) => {
        const template = DIAGRAM_TEMPLATES[key];
        if (template) {
          editor.updateBlock(block, {
            props: {
              ...block.props,
              code: template.code,
            }
          });
          setShowTemplates(false);
          setShowOptions(false);
          toast.success(`Loaded ${template.name} template`);
        }
      };

      const selectTheme = (themeKey) => {
        editor.updateBlock(block, {
          props: {
            ...block.props,
            theme: themeKey
          }
        });
        setShowThemes(false);
        setShowOptions(false);
        mermaidInitializedKey = null; // force re-init
        toast.success(`Theme set to ${THEME_PALETTES[themeKey].name}`);
      };

      const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        toast.success("Mermaid code copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      };

      const handleDownloadSvg = () => {
        if (!svgCode) return;
        const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `diagram-${currentTheme}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("SVG diagram downloaded!");
      };

      const handleDownloadPng = useCallback(() => {
        if (!svgCode) return;
        const img = new Image();
        const svgBlob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth * 2 || 1600;
          canvas.height = img.naturalHeight * 2 || 1000;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = isDark ? "#090d16" : "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `diagram-${currentTheme}.png`;
                a.click();
                toast.success("High-res PNG downloaded!");
              }
            }, "image/png");
          }
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }, [svgCode, currentTheme, isDark]);

      return (
        <div
          ref={blockRootRef}
          className="mermaid-block-container w-full my-4 border border-border/80 rounded-2xl overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm relative group"
          contentEditable={false}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .mermaid-preview {
              width: 100% !important;
              max-width: 100% !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              overflow: hidden !important;
            }
            .mermaid-preview svg {
              max-width: 100% !important;
              max-height: 440px !important;
              width: auto !important;
              height: auto !important;
              object-fit: contain !important;
              margin: 0 auto !important;
            }
            /* Flowchart & General Node Enhancements */
            .mermaid-preview .node rect,
            .mermaid-preview .node circle,
            .mermaid-preview .node ellipse,
            .mermaid-preview .node polygon,
            .mermaid-preview .node path {
              rx: 8px !important;
              ry: 8px !important;
              stroke-width: 1.5px !important;
            }
            .mermaid-preview .node .label,
            .mermaid-preview .nodeLabel,
            .mermaid-preview .node .label text {
              font-family: inherit !important;
              font-weight: 500 !important;
              font-size: 13px !important;
              line-height: 1.4 !important;
            }
            /* Subgraph Clusters */
            .mermaid-preview .cluster rect {
              rx: 12px !important;
              ry: 12px !important;
              stroke-width: 1.5px !important;
            }
            .mermaid-preview .cluster text,
            .mermaid-preview .cluster-label span,
            .mermaid-preview .cluster-title {
              font-family: inherit !important;
              font-weight: 700 !important;
              font-size: 13px !important;
              letter-spacing: 0.01em !important;
            }
            /* Edge Labels */
            .mermaid-preview .edgeLabel {
              font-family: inherit !important;
              font-size: 11px !important;
              font-weight: 600 !important;
            }
            .mermaid-preview .edgeLabel rect,
            .mermaid-preview .labelBox {
              rx: 6px !important;
              ry: 6px !important;
            }
            /* ER Diagram Theme-Perfect Enhancements */
            .mermaid-preview .er.entityBox {
              rx: 6px !important;
              ry: 6px !important;
              stroke-width: 1.5px !important;
            }
            .mermaid-preview .er.entityLabel {
              font-family: inherit !important;
              font-weight: 700 !important;
              font-size: 13px !important;
              letter-spacing: 0.02em !important;
            }
            .mermaid-preview .er.attributeBoxOdd,
            .mermaid-preview .er.attributeBoxEven {
              stroke-width: 0.75px !important;
            }
            .mermaid-preview .er.attributeLabelOdd,
            .mermaid-preview .er.attributeLabelEven {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
              font-size: 11px !important;
            }
            .mermaid-preview .er.relationshipLine {
              stroke-width: 2px !important;
            }
            .mermaid-preview .er.relationshipLabel {
              font-family: inherit !important;
              font-size: 11px !important;
              font-weight: 600 !important;
            }
            .mermaid-preview .er.relationshipLabelBox {
              rx: 4px !important;
              ry: 4px !important;
            }
            /* Sequence Diagram */
            .mermaid-preview .actor {
              rx: 8px !important;
              ry: 8px !important;
              stroke-width: 1.5px !important;
            }
            .mermaid-preview text.actor > tspan {
              font-family: inherit !important;
              font-weight: 600 !important;
              font-size: 12px !important;
            }
            .mermaid-preview .messageText {
              font-family: inherit !important;
              font-size: 12px !important;
              font-weight: 500 !important;
            }
            .mermaid-preview .note {
              rx: 6px !important;
              ry: 6px !important;
            }
            .mermaid-preview .noteText {
              font-family: inherit !important;
              font-size: 11px !important;
            }
            /* Class Diagram */
            .mermaid-preview .classGroup rect {
              rx: 6px !important;
              ry: 6px !important;
              stroke-width: 1.25px !important;
            }
            .mermaid-preview .classTitle {
              font-family: inherit !important;
              font-weight: 700 !important;
              font-size: 13px !important;
            }
            .mermaid-preview .classText {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
              font-size: 11px !important;
            }
            /* State Diagram */
            .mermaid-preview .statediagram-state rect {
              rx: 8px !important;
              ry: 8px !important;
              stroke-width: 1.5px !important;
            }
            @media print {
              .mermaid-block-container { break-inside: avoid !important; page-break-inside: avoid !important; border: 1px solid #e2e8f0 !important; background: transparent !important; overflow: visible !important; width: 100% !important; margin: 1.5rem 0 !important; }
              .mermaid-preview { overflow: visible !important; width: 100% !important; max-height: none !important; padding: 0 !important; }
              .mermaid-preview svg { max-width: 100% !important; width: auto !important; height: auto !important; max-height: none !important; }
            }
          `}} />

          {/* Code/Split Mode Toolbar (Ultra-compact, only when editing code) */}
          {isBlockEditable && (view === "code" || view === "split") && (
            <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground gap-2 print:hidden select-none">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
                  <Code2 className="w-3.5 h-3.5 text-purple" />
                  <span>Diagram Code</span>
                </span>

                {/* Templates Dropdown */}
                <div className="relative" ref={templatesMenuRef}>
                  <button
                    type="button"
                    onClick={() => { setShowTemplates(!showTemplates); setShowThemes(false); }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border text-[11px] font-medium text-foreground hover:bg-muted duration-150 cursor-pointer shadow-xs"
                    title="Load diagram template"
                  >
                    <Layers className="w-3 h-3 text-purple" />
                    <span>Templates</span>
                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                  </button>

                  {showTemplates && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 max-h-80 overflow-y-auto backdrop-blur-md">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                        Select Diagram Type
                      </div>
                      {Object.entries(DIAGRAM_TEMPLATES).map(([key, t]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => selectTemplate(key)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted/70 text-foreground transition-colors flex items-start gap-2.5 cursor-pointer group"
                        >
                          <span className="text-base">{t.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold group-hover:text-purple transition-colors truncate">
                              {t.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {t.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Theme Dropdown */}
                <div className="relative" ref={themesMenuRef}>
                  <button
                    type="button"
                    onClick={() => { setShowThemes(!showThemes); setShowTemplates(false); }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border text-[11px] font-medium text-foreground hover:bg-muted duration-150 cursor-pointer shadow-xs"
                    title="Change color theme"
                  >
                    <Palette className="w-3 h-3 text-emerald-500" />
                    <span>Theme</span>
                  </button>

                  {showThemes && (
                    <div className="absolute left-0 top-full mt-1.5 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 backdrop-blur-md">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                        Color Theme
                      </div>
                      {Object.entries(THEME_PALETTES).map(([k, p]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => selectTheme(k)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                            currentTheme === k ? "bg-purple/15 text-purple font-semibold" : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <span>{p.icon}</span>
                          <span>{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* View Switcher: Diagram, Code, Split */}
                <div className="flex items-center gap-0.5 bg-background rounded-md p-0.5 border border-border">
                  {["diagram", "code", "split"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={`px-2 py-0.5 rounded transition-all text-[11px] font-medium capitalize cursor-pointer ${
                        view === v
                          ? "bg-purple text-white shadow-xs"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {v === "diagram" ? "View" : v}
                    </button>
                  ))}
                </div>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Re-render diagram"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>

                {/* Delete Block */}
                <button
                  type="button"
                  onClick={() => editor.removeBlocks([block])}
                  className="p-1 rounded-md hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors cursor-pointer"
                  title="Delete diagram block"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className={`grid ${view === "split" ? "grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border" : "grid-cols-1"}`}>
            {/* Code Editor */}
            {(view === "code" || view === "split") && isBlockEditable && (
              <div className="p-3 sm:p-4 bg-muted/10 flex flex-col justify-between">
                <textarea
                  value={code}
                  onChange={(e) =>
                    editor.updateBlock(block, { props: { ...block.props, code: e.target.value } })
                  }
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full min-h-[240px] max-h-[480px] bg-background/80 border border-border/80 rounded-xl outline-none font-mono text-xs sm:text-sm resize-y p-3.5 focus:border-purple focus:ring-1 focus:ring-purple/30 transition-all text-foreground leading-relaxed"
                  placeholder="Enter Mermaid diagram code..."
                  spellCheck={false}
                />
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Supports ER Diagram, Flowchart, Sequence, Class, State, Gantt, GitGraph, Mindmap</span>
                </div>
              </div>
            )}

            {/* Diagram Display Area */}
            {(view === "diagram" || view === "split") && (
              <div
                className="p-4 sm:p-6 flex items-center justify-center min-h-[180px] overflow-hidden bg-background/40 relative"
                onDoubleClick={() => { if (svgCode && !error) setIsFullscreen(true); }}
                title={isInteractive ? undefined : "Double click or click Pan & Zoom"}
              >
                {/* Sleek Floating View & Options Pill in View Mode (Editor Only) */}
                {isBlockEditable && view === "diagram" && (
                  <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-background/85 dark:bg-card/85 backdrop-blur-md border border-border/80 p-1 rounded-xl shadow-xs transition-all select-none">
                    {/* View Switcher: Diagram, Code, Split */}
                    <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border/40 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setView("diagram")}
                        className="px-2 py-0.5 rounded-md bg-purple text-white font-semibold shadow-xs cursor-pointer"
                        title="View Diagram"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("code")}
                        className="px-2 py-0.5 rounded-md text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
                        title="Edit Code"
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("split")}
                        className="px-2 py-0.5 rounded-md text-muted-foreground hover:text-foreground font-medium transition-colors hidden sm:inline-block cursor-pointer"
                        title="Split View"
                      >
                        Split
                      </button>
                    </div>

                    {/* Options Dropdown */}
                    <div className="relative" ref={optionsMenuRef}>
                      <button
                        type="button"
                        onClick={() => { setShowOptions(!showOptions); setShowTemplates(false); setShowThemes(false); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background hover:bg-muted text-foreground text-[11px] font-medium border border-border/70 transition-colors shadow-xs cursor-pointer"
                        title="Diagram Options"
                      >
                        <Settings2 className="w-3.5 h-3.5 text-purple" />
                        <span>Options</span>
                        <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                      </button>

                      {showOptions && (
                        <div className="absolute right-0 top-full mt-1.5 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 p-1.5 max-h-96 overflow-y-auto backdrop-blur-md">
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1 flex items-center justify-between">
                            <span>Diagram Options</span>
                            <span className="text-[9px] text-purple capitalize">{currentTheme}</span>
                          </div>

                          {/* Quick Template Switcher */}
                          <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                            Change Diagram Type
                          </div>
                          <div className="grid grid-cols-1 gap-0.5 mb-1.5">
                            {Object.entries(DIAGRAM_TEMPLATES).map(([key, t]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => selectTemplate(key)}
                                className="w-full text-left px-2 py-1 rounded-lg hover:bg-muted/70 text-foreground transition-colors flex items-center gap-2 cursor-pointer group text-xs"
                              >
                                <span className="text-sm">{t.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold group-hover:text-purple truncate">{t.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-border/60 my-1"></div>

                          {/* Color Theme Selector */}
                          <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                            Color Theme
                          </div>
                          <div className="grid grid-cols-2 gap-1 mb-1.5">
                            {Object.entries(THEME_PALETTES).map(([k, p]) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => selectTheme(k)}
                                className={`text-left px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 cursor-pointer ${
                                  currentTheme === k ? "bg-purple/15 text-purple font-bold border border-purple/30" : "hover:bg-muted text-foreground border border-transparent"
                                }`}
                              >
                                <span>{p.icon}</span>
                                <span className="truncate">{p.name}</span>
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-border/60 my-1"></div>

                          {/* Tools & Actions */}
                          <button
                            type="button"
                            onClick={() => { handleRefresh(); setShowOptions(false); }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground text-xs flex items-center gap-2 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-purple" />
                            <span>Re-render Diagram</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsFullscreen(true); setShowOptions(false); }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground text-xs flex items-center gap-2 cursor-pointer"
                          >
                            <Maximize className="w-3.5 h-3.5 text-blue-500" />
                            <span>Fullscreen Explorer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleDownloadSvg(); setShowOptions(false); }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground text-xs flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Download SVG</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleDownloadPng(); setShowOptions(false); }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground text-xs flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-teal-500" />
                            <span>Download PNG</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleCopyCode(); setShowOptions(false); }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-muted text-foreground text-xs flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-amber-500" />
                            <span>Copy Mermaid Code</span>
                          </button>
                          <div className="border-t border-border/60 my-1"></div>
                          <button
                            type="button"
                            onClick={() => editor.removeBlocks([block])}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-destructive/15 text-destructive text-xs flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Diagram Block</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* In-Card Pan-Zoom Quick Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsInteractive(!isInteractive)}
                      className={`p-1.5 rounded-lg border border-border/60 transition-colors cursor-pointer ${
                        isInteractive ? "bg-purple text-white shadow-xs" : "bg-background hover:bg-muted text-foreground"
                      }`}
                      title={isInteractive ? "Exit Pan & Zoom" : "Interactive Pan & Zoom"}
                    >
                      <Move className="w-3 h-3" />
                    </button>

                    {/* Fullscreen Quick Button */}
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(true)}
                      className="p-1.5 rounded-lg bg-background hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer"
                      title="Fullscreen Explorer"
                    >
                      <Maximize className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Reader Mode Subtle Hover Bar (Only in Published Reader View) */}
                {!isBlockEditable && (
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsInteractive(true); }}
                      className="px-2 py-1 bg-background/90 border border-border rounded-lg hover:bg-muted text-foreground text-[11px] font-medium shadow-xs backdrop-blur flex items-center gap-1 cursor-pointer"
                      title="Interactive in-card pan and zoom"
                    >
                      <Move className="w-3 h-3 text-purple" />
                      <span className="hidden sm:inline">Pan & Zoom</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFullscreen(true); }}
                      className="p-1.5 bg-background/90 border border-border rounded-lg hover:bg-muted text-foreground shadow-xs backdrop-blur cursor-pointer"
                      title="Fullscreen Explorer"
                    >
                      <Maximize className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadSvg(); }}
                      className="p-1.5 bg-background/90 border border-border rounded-lg hover:bg-muted text-foreground shadow-xs backdrop-blur cursor-pointer"
                      title="Download SVG"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {error ? (
                  <div className="text-destructive text-xs font-mono whitespace-pre-wrap max-w-full overflow-x-auto p-4 bg-destructive/10 rounded-xl border border-destructive/20 text-center">
                    <p className="font-bold mb-1">Diagram Syntax Error</p>
                    <p className="text-[11px] opacity-85">{error}</p>
                    {isBlockEditable && (
                      <p className="text-[10px] text-muted-foreground mt-2">Pick a template from the Templates menu above to reset.</p>
                    )}
                  </div>
                ) : svgCode ? (
                  isInteractive ? (
                    /* In-Card Interactive Pan-Zoom Mode */
                    <div className="w-full h-[360px] relative overflow-hidden rounded-xl bg-background/60 border border-border/60">
                      <TransformWrapper initialScale={1} minScale={0.3} maxScale={6} centerOnInit={true} wheel={{ step: 0.15 }}>
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10 bg-card/90 backdrop-blur border border-border p-1 rounded-xl shadow-md">
                              <button type="button" onClick={() => zoomIn()} className="p-1.5 hover:bg-muted rounded-lg text-foreground cursor-pointer" title="Zoom In">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => zoomOut()} className="p-1.5 hover:bg-muted rounded-lg text-foreground cursor-pointer" title="Zoom Out">
                                <ZoomOut className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => resetTransform()} className="px-2 py-1 hover:bg-muted rounded-lg text-foreground font-bold text-[10px] cursor-pointer" title="Fit">
                                Fit
                              </button>
                              <button type="button" onClick={() => setIsInteractive(false)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer" title="Close interactive mode">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                              <div
                                className="mermaid-preview flex items-center justify-center select-none p-4"
                                style={{ minWidth: "100%", minHeight: "100%" }}
                                dangerouslySetInnerHTML={{ __html: svgCode }}
                              />
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    </div>
                  ) : (
                    /* Clean Diagram View with Subtle Hover Action Bar */
                    <>
                      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsInteractive(true); }}
                          className="px-2 py-1 bg-background/90 border border-border rounded-lg hover:bg-muted text-foreground text-[11px] font-medium shadow-xs backdrop-blur flex items-center gap-1 cursor-pointer"
                          title="Interactive in-card pan and zoom"
                        >
                          <Move className="w-3 h-3 text-purple" />
                          <span className="hidden sm:inline">Pan & Zoom</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFullscreen(true); }}
                          className="p-1.5 bg-background/90 border border-border rounded-lg hover:bg-muted text-foreground shadow-xs backdrop-blur cursor-pointer"
                          title="Fullscreen Explorer"
                        >
                          <Maximize className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadSvg(); }}
                          className="p-1.5 bg-background/90 border border-border rounded-lg hover:bg-muted text-foreground shadow-xs backdrop-blur cursor-pointer"
                          title="Download SVG"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                      <div
                        ref={containerRef}
                        className="mermaid-preview w-full flex items-center justify-center select-none"
                        dangerouslySetInnerHTML={{ __html: svgCode }}
                      />
                    </>
                  )
                ) : (
                  <div className="text-muted-foreground text-sm flex items-center gap-2 opacity-60 py-8">
                    <Code2 className="w-4 h-4" />
                    {isInViewport ? "Empty diagram — choose a template to begin" : "Scroll into view to render"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen Multi-Touch Pan & Zoom Modal (All Devices) */}
          {isFullscreen && svgCode && typeof document !== "undefined" && createPortal(
            <div className="fixed inset-0 z-[99999] bg-background/98 backdrop-blur-md flex flex-col select-none">
              {/* Header Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-purple/10 text-purple flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    Diagram Explorer
                  </span>
                  <span className="hidden sm:inline text-xs text-muted-foreground">
                    • Multi-touch pinch to zoom · Mouse wheel · Drag to pan
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 duration-150 cursor-pointer shadow-xs"
                    title="Copy source code"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Copy Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 duration-150 cursor-pointer shadow-xs"
                    title="Export vector SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 duration-150 cursor-pointer shadow-xs"
                    title="Export high-res PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl text-xs font-semibold flex items-center gap-1.5 duration-150 cursor-pointer"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs font-bold">Close</span>
                  </button>
                </div>
              </div>

              {/* Canvas Stage */}
              <div className="flex-1 w-full h-full relative overflow-hidden">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.2}
                  maxScale={8}
                  centerOnInit={true}
                  wheel={{ step: 0.15 }}
                  pinch={{ step: 5 }}
                  doubleClick={{ mode: "zoomIn", step: 0.8 }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      {/* Floating Touch Controls */}
                      <div className="absolute bottom-6 right-6 flex items-center gap-1.5 z-20 bg-card/90 backdrop-blur-md border border-border p-1.5 rounded-2xl shadow-xl">
                        <button
                          type="button"
                          onClick={() => zoomIn()}
                          className="p-2.5 hover:bg-muted rounded-xl text-foreground transition-colors cursor-pointer"
                          title="Zoom In (+)"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => zoomOut()}
                          className="p-2.5 hover:bg-muted rounded-xl text-foreground transition-colors cursor-pointer"
                          title="Zoom Out (-)"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => resetTransform()}
                          className="px-3.5 py-2 hover:bg-muted rounded-xl text-foreground transition-colors font-bold text-xs cursor-pointer"
                          title="Fit / Reset"
                        >
                          Fit
                        </button>
                      </div>

                      <TransformComponent
                        wrapperClass="!w-full !h-full"
                        contentClass="!w-full !h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                      >
                        <div
                          className="mermaid-preview flex items-center justify-center select-none p-6"
                          style={{ minWidth: "100%", minHeight: "100%" }}
                          dangerouslySetInnerHTML={{ __html: svgCode }}
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>

              {/* Mobile Guidance Note */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[11px] text-muted-foreground bg-card/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-border/60 shadow-sm pointer-events-none">
                📱 Touch pinch to zoom · Drag to pan · Double tap to focus
              </div>
            </div>,
            document.body
          )}
        </div>
      );
    },
    parse: (el) => {
      // Auto-detect when importing markdown or pasting markdown
      // BlockNote converts ` ```mermaid ` into <pre data-language="mermaid"><code>...</code></pre>
      if (
        el.tagName.toLowerCase() === "pre" &&
        (el.getAttribute("data-language") === "mermaid" || el.getAttribute("class")?.includes("language-mermaid"))
      ) {
        return {
          code: el.textContent || "",
          view: "diagram",
          theme: "vibrant"
        };
      }
      // Or sometimes just <code> elements
      if (
        el.tagName.toLowerCase() === "code" &&
        el.getAttribute("class")?.includes("language-mermaid")
      ) {
        return {
          code: el.textContent || "",
          view: "diagram",
          theme: "vibrant"
        };
      }
      return undefined;
    },
  }
);
