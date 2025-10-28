# AI Development Rules

This document provides guidelines for the AI assistant working on this project. Following these rules ensures consistency, maintainability, and adherence to the project's architecture.

## Tech Stack

The application is built with a modern, component-based architecture. Key technologies include:

-   **Framework**: React (v18) with Vite for a fast development experience.
-   **Language**: TypeScript for type safety and improved developer experience.
-   **UI Components**: shadcn/ui, a collection of beautifully designed, accessible components built on Radix UI.
-   **Styling**: Tailwind CSS for a utility-first styling approach. All styling should be done with Tailwind classes.
-   **Routing**: React Router (`react-router-dom`) for all client-side navigation.
-   **Data Fetching & State**: TanStack Query (`@tanstack/react-query`) for managing server state, caching, and data fetching.
-   **Forms**: React Hook Form (`react-hook-form`) for building performant and flexible forms, paired with Zod for schema validation.
-   **Notifications**: Sonner for simple and elegant toast notifications.
-   **Icons**: Lucide React for a comprehensive and consistent set of icons.

## Library Usage and Coding Conventions

### 1. Component Strategy

-   **Primary UI Library**: **Always** use components from the `shadcn/ui` library (located in `src/components/ui`) as the foundation for the UI. Examples include `<Button>`, `<Card>`, `<Input>`, etc.
-   **Custom Components**: If a `shadcn/ui` component needs significant modification or composition, create a new custom component in `src/components`. Do **not** directly edit the files within `src/components/ui`.
-   **File Structure**:
    -   All pages (route components) must be placed in `src/pages`.
    -   All reusable custom components must be placed in `src/components`.
    -   All custom hooks must be placed in `src/hooks`.
    -   All general utility functions must be placed in `src/lib`.

### 2. Styling

-   **Utility-First**: Use Tailwind CSS classes for all styling. Avoid writing custom CSS in `.css` files unless absolutely necessary for global styles (like in `src/index.css`).
-   **Conditional Classes**: Use the `cn` utility function from `src/lib/utils.ts` to merge and apply conditional classes. This function combines `clsx` and `tailwind-merge`.

### 3. Routing

-   **Router**: Use `react-router-dom` for all routing needs.
-   **Route Definitions**: All application routes should be defined in `src/App.tsx`.
-   **Navigation**: Use the `<Link>` component for declarative navigation and the `useNavigate` hook for programmatic navigation.

### 4. Forms

-   **Form Management**: Use `react-hook-form` for handling form state, validation, and submission.
-   **Validation**: Use `zod` to define validation schemas. Connect Zod schemas to `react-hook-form` using `@hookform/resolvers`.

### 5. Notifications

-   **User Feedback**: Use `sonner` to provide feedback to the user (e.g., success messages, errors, warnings). Import the `toast` function from `"sonner"`.

### 6. Icons

-   **Icon Set**: Use icons exclusively from the `lucide-react` library to maintain visual consistency.

### 7. State Management

-   **Server State**: Use `@tanstack/react-query` for fetching, caching, and synchronizing data from APIs or other asynchronous sources.
-   **Local State**: For component-level state that is not shared, use React's built-in `useState` and `useReducer` hooks. Avoid introducing complex global state management libraries (like Redux or Zustand) unless the application's complexity absolutely requires it.