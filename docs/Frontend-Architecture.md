\# Frontend Architecture: Custom E-commerce Printing Platform (MVP)

\*\*Last Updated:\*\* July 04, 2025  
\*\*Design Architect:\*\* Jane

\#\# 1\. Overall Frontend Philosophy & Patterns

\* \*\*Core Framework & Language:\*\* \*\*React\*\* with \*\*Vite\*\* as the build tool; all code will be written in \*\*TypeScript\*\*.  
\* \*\*Styling Approach:\*\* \*\*Tailwind CSS\*\* is the primary utility-first framework, used with \*\*PostCSS\*\* and \*\*Autoprefixer\*\*. Theming (for light/dark modes) will be handled with \*\*CSS Variables\*\*.  
\* \*\*UI Component Strategy:\*\* We will use \*\*Shadcn/UI\*\* built upon \*\*Radix UI\*\* primitives for our component library. Icons will be from \*\*Lucide React\*\*.  
\* \*\*Routing:\*\* Client-side routing will be handled by \*\*React Router DOM\*\*.  
\* \*\*State Management (Layered Strategy):\*\*  
    \* \*\*Server State:\*\* \*\*React Query (TanStack Query)\*\* will be used for all fetching, caching, and server state synchronization.  
    \* \*\*Form State:\*\* \*\*React Hook Form\*\* will be used for managing all forms.  
    \* \*\*Global Client State:\*\* We will start with React's built-in \*\*Context API\*\*. If complexity requires it, we will use \*\*Zustand or Jotai\*\*.  
\* \*\*Key Utility Libraries:\*\* \*\*Zod\*\* (Schema Validation), \*\*Class Variance Authority/clsx/Tailwind Merge\*\* (CSS utilities), and \*\*date-fns\*\* (Date manipulation).

\#\# 2\. Detailed Frontend Directory Structure

\`\`\`plaintext  
src/  
├── api/             \# MANDATORY: For encapsulating all API call logic (e.g., using React Query).  
├── assets/          \# MANDATORY: For static assets like images, custom fonts, etc.  
├── components/      \# MANDATORY: For all reusable React components.  
│   ├── ui/          \# MANDATORY: For core, primitive UI components from Shadcn/UI (e.g., Button, Input).  
│   └── common/      \# MANDATORY: For more complex, composed components used across features.  
├── features/        \# RECOMMENDED: For feature-specific modules.  
├── hooks/           \# RECOMMENDED: For global, reusable custom React hooks.  
├── lib/             \# MANDATORY: For utility functions, helpers, and constants.  
├── pages/           \# MANDATORY: For the main components that represent a "page" or a route.  
├── providers/       \# RECOMMENDED: For all React Context providers (e.g., Theme, Auth Session).  
├── store/           \# OPTIONAL: For global state management stores (e.g., Zustand).  
└── types/           \# RECOMMENDED: For global TypeScript type definitions.

## **3\. Component Specification Standard**

* A formal **"Template for Component Specification"** has been approved and will be used to document all new components before development. This template requires defining the component's `Purpose`, `Props`, `Internal State`, `UI Structure`, `Events`, `Actions`, `Styling`, and `Accessibility Notes` to ensure clarity and high quality.

## **4\. Key Architectural Policies**

* **API Interaction Layer:** We will use a centralized **Axios** client instance with interceptors for authentication and global error handling. All API calls will be organized into dedicated service files (e.g., `productService.ts`).  
* **Routing Strategy:** We have a defined list of application routes and a standard **Authentication Guard** component that will protect authenticated routes by redirecting unauthenticated users to the `/login` page.  
* **Build & Deployment:** We will use **Vite** for optimized builds (code splitting, tree shaking, minification) and **GitHub Actions** for CI/CD, deploying automatically to **Vercel or Netlify**.  
* **Testing Strategy:** A three-tiered approach will be used:  
  1. **Component Testing** (Jest/Vitest \+ React Testing Library).  
  2. **UI Integration Testing** (Jest/Vitest \+ React Testing Library).  
  3. **End-to-End (E2E) Testing** (Playwright or Cypress) for critical user flows.  
* **Accessibility (AX):** We will adhere to **WCAG 2.1 AA** standards, using semantic HTML, ARIA patterns, ensuring full keyboard navigation, and managing focus correctly. Automated `axe` testing will be part of our CI pipeline.  
* **Performance:** We will enforce key performance strategies, including image optimization, code optimization via Vite, application-level patterns like memoization to prevent re-renders, and virtualization for long lists. Performance will be regularly audited with tools like Lighthouse.  
* **PWA Implementation:** The application will be a full Progressive Web App, implemented with a **Service Worker** (using Workbox.js) and a **Web App Manifest** to support installability, push notifications, and offline capabilities as defined in the Project Brief.

