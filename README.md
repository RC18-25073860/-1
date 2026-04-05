# Profile Generator MVP

A multi-scene profile page builder for mentors, students, and PhD applicants.

## Features

- **Scene Selection**: Choose between Mentor, Student, and PhD applicant profiles.
- **Dynamic Forms**: Input fields automatically adapt to the selected scene's schema.
- **Real-time Preview**: See your changes instantly on a scaled canvas.
- **Template System**: Each scene comes with multiple layout templates (Editorial, Minimal, etc.).
- **Theme Customization**: Switch between different color palettes (Black & White, Academic Blue, Warm Beige, Dark Portfolio).
- **Responsive Canvas**: Preview in A4, Long Image (1080x1920), or Custom dimensions.
- **Image Support**: Upload avatars and project galleries (up to 6 images) using local object URLs.
- **Export**: Download your generated profile as a standalone HTML file with inline styles.

## Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion (framer-motion)

## Project Structure

- `src/types/`: TypeScript interfaces for scenes, themes, and profile data.
- `src/lib/`:
  - `scenes.ts`: Scene configurations and schemas.
  - `themes.ts`: Theme tokens and color palettes.
  - `export.ts`: HTML generation logic for exporting.
  - `utils.ts`: Helper functions (cn, download).
- `src/components/`:
  - `editor/`: Control panel components (Selectors, DynamicForm, ImageUploader).
  - `preview/`: Canvas and rendering components (PreviewFrame, ProfileCardRenderer, SectionBlock).

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

## Future Roadmap

- [ ] PDF Export using Puppeteer or a client-side library like jsPDF.
- [ ] More templates and layout options.
- [ ] Rich text editor for long-form content.
- [ ] Cloud storage for saving and sharing profiles.
- [ ] Multi-page profile support.
