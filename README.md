# DocGen Web

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055ff)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Web interface for DocGen - PDF Document Generator

## Overview

DocGen Web is a modern frontend for generating professional PDF business documents (invoices and receipts) from structured JSON data.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **API**: DocGen Backend (Railway)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/fikriaf/docgen-web

# Navigate to project
cd docgen-web

# Install dependencies
npm install

# Run development server
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Generate document |
| `/templates` | View available templates |
| `/history` | View generated documents |
| `/settings` | Configure API settings |

## API Integration

The frontend connects to the DocGen API. Default endpoint: `https://docgen-production-503d.up.railway.app`

## License

MIT
