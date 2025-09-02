# Mental Health Quiz

This is a web application that provides a series of quizzes to help users understand their mental health better. The quizzes are based on different psychological models: Emotional Intelligence (EI), Representational Systems (Rep System), and Visual-Auditory-Kinesthetic (VAK).

## Features

*   **Three Different Quizzes:** Take quizzes on Emotional Intelligence, Representational Systems, and VAK.
*   **Personalized Results:** Receive detailed results and interpretations based on your answers.
*   **Admin Panel:** An admin panel to manage the application (further development needed).
*   **User Authentication:** Secure user authentication using Supabase.
*   **Export Results:** Export your quiz results for your personal records.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Auth:** [Supabase](https://supabase.io/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   pnpm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/mental-health-quiz.git
    ```
2.  Install PNPM packages
    ```sh
    pnpm install
    ```
3.  Set up your environment variables. Create a `.env.local` file in the root of the project and add the following variables:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    You can get these from your Supabase project settings.

4.  Run the development server
    ```sh
    pnpm dev
    ```

## Project Structure

```
/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin dashboard
│   ├── quiz/             # Quiz pages for different models
│   └── ...
├── components/           # Shared UI components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Core logic and utilities
│   ├── auth.ts           # Authentication logic
│   ├── supabase.ts       # Supabase client setup
│   └── ...
├── public/               # Static assets
├── scripts/              # Database scripts
└── ...
```

## Database

The project uses a PostgreSQL database managed by Supabase. The database schema can be found in `scripts/01-final-database-schema.sql`. You can run this script in your Supabase SQL editor to set up the necessary tables.

