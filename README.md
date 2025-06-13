# Open Heavens

<div align="center">
  <img src="https://ol1k8fnyetvuk6ie.public.blob.vercel-storage.com/logo-base-32x32.png" alt="Open Heavens Logo" width="80" height="80">

  <h1>Open Heavens Daily Devotional</h1>
  
  <p>A modern web application for accessing the Open Heavens Daily Devotional by Pastor E.A. Adeboye</p>

  <p>
    <a href="https://github.com/topics/typescript">
      <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    </a>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
    </a>
    <a href="https://www.gnu.org/licenses/agpl-3.0">
      <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg?style=for-the-badge" alt="License: AGPL v3">
    </a>
  </p>

  <img src="https://ol1k8fnyetvuk6ie.public.blob.vercel-storage.com/thumbnail.png" alt="Open Heavens Preview" width="600">
</div>

## Overview

Open Heavens is a web application that provides daily devotional content from Pastor E.A. Adeboye's Open Heavens devotional. The application features daily devotionals, Bible readings, and hymns, with content that updates automatically every day. Built with modern web technologies and structured as a monorepo using Turborepo, the project enables efficient build caching and dependency management across multiple packages.

### Features

- 📖 Daily devotional content
- 🎵 Hymn collection
- 📱 Mobile-responsive design
- 📊 SEO optimized with metadata
- 🔄 Automatic content updates
- 📚 Bible reading integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js >= 20
- npm >= 10.5.0

## Project Structure

```
open-heavens/
├── apps/
│   └── web/          # Next.js web application
│       └── src/
│           ├── app/  # App router components
│           ├── bible/# Bible integration
│           └── hymns/# Hymns feature
├── packages/
│   ├── ui/           # Shared React component library
│   ├── utils/        # Shared utilities and helper functions
│   ├── bible/        # Bible data and functionality
│   ├── sunday-school/# Sunday School content and features
│   ├── eslint-config/# Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
```

## Getting Started

1. Clone the repository:
   ```sh
   git clone [your-repository-url]
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start all applications in development mode
- `npm run build` - Build all applications and packages
- `npm run lint` - Run ESLint across all projects
- `npm run format` - Format all files with Prettier

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Monorepo Tool**: [Turborepo](https://turbo.build/)
- **Package Manager**: npm
- **Styling**: Tailwind CSS
- **Linting**: ESLint with custom configurations
- **Formatting**: Prettier
- **Data Updates**: Automatic revalidation every 6 hours

## Development

This project uses Turborepo for managing the monorepo. The main applications and packages are:

- `web`: The main Next.js web application featuring daily devotionals
- `@repo/ui`: A shared React component library for consistent UI/UX
- `@repo/utils`: Shared utilities including metadata construction and helper functions
- `@repo/bible`: Bible data management and functionality
- `@repo/sunday-school`: Sunday School content management and features
- `@repo/eslint-config`: Shared ESLint configurations
- `@repo/typescript-config`: Shared TypeScript configurations

### Features

- 📖 Daily devotional content
- 🎵 Hymn collection
- 📱 Mobile-responsive design
- 📊 SEO optimized with metadata
- 🔄 Automatic content updates
- 📚 Bible reading integration
- 🎓 Sunday School materials
- ⚡ Fast and efficient performance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE.md](LICENSE.md) file for details.

### What this means:

- ✅ You can use this software for commercial purposes
- ✅ You can modify this software
- ✅ You can distribute this software
- ✅ You can use this software privately
- ✅ You can use patent claims
- ❗ You **must** disclose the source code when you distribute this software
- ❗ You **must** state changes you make to this software
- ❗ You **must** include the original license and copyright notice
- ❗ You **must** disclose the source code of your version if you run it on a server and let users interact with it over a network
- ❗ You **must** license your modifications under AGPL-3.0
- ❌ This software comes with no warranty

For more information about the AGPL-3.0 license, visit [GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html).

## Acknowledgments

- Pastor E.A. Adeboye for the Open Heavens Devotional content
- The Redeemed Christian Church of God

## Contact & Author

This project is maintained by Ife Odubela:
- LinkedIn: [@ife-odubela](https://www.linkedin.com/in/ife-odubela/)
- Twitter: [@Ife_Ody](https://twitter.com/Ife_Ody)

If you have any questions, suggestions, or would like to contribute, feel free to reach out!
