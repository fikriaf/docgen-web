# DocGen Web

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055ff)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Web interface for DocGen - PDF Document Generator using DOCX templates

## Overview

DocGen Web is a modern frontend for generating professional PDF business documents from DOCX templates. Simply upload a DOCX file with variables, fill in the detected fields, and generate your PDF.

## Features

- DOCX template upload and automatic field detection
- Smart Replace (AI-powered field detection)
- Watermark support
- Custom filename
- Real-time PDF preview
- Document history

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

## How It Works

1. **Prepare DOCX Template** - Create a DOCX file with variables using curly braces: `{{field_name}}`
2. **Upload & Scan** - Upload your DOCX template. DocGen will automatically detect all fields
3. **Fill Data & Generate** - Fill in the detected fields, configure options (watermark, smart replace), and generate PDF

## Pages

| Route | Description |
|-------|-------------|
| `/` | Generate document |
| `/templates` | View template guide |
| `/history` | View generated documents |
| `/settings` | Configure API settings |

## API Integration

The frontend connects to the DocGen API. Default endpoint: `https://docgen-production-503d.up.railway.app`

### Endpoints

- `POST /api/v1/docx/scan` - Scan DOCX template for fields
- `POST /api/v1/docx/generate` - Generate PDF from DOCX template

## License

MIT
