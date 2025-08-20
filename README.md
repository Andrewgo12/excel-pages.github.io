# Excel Pages - Advanced Excel Data Processing

[![Deploy to GitHub Pages](https://github.com/Andrewgo12/excel-pages.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/Andrewgo12/excel-pages.github.io/actions/workflows/deploy.yml)

A powerful, web-based Excel data processing and visualization tool built with React, TypeScript, and modern web technologies. Process, analyze, and visualize Excel files directly in your browser with advanced filtering, statistical analysis, and export capabilities.

🌐 **Live Demo**: [https://andrewgo12.github.io/excel-pages.github.io/](https://andrewgo12.github.io/excel-pages.github.io/)

## ✨ Features

### 📊 Data Processing
- **Multi-format Support**: Excel (.xlsx, .xls), CSV, JSON, TSV, and text files
- **Multi-sheet Analysis**: Process and analyze multiple Excel sheets simultaneously
- **Smart Data Detection**: Automatic data type detection and validation
- **Large File Handling**: Optimized for processing large datasets

### 🔍 Advanced Filtering & Search
- **Dynamic Filtering**: Real-time data filtering with multiple conditions
- **Column-based Filters**: Individual column filtering with various operators
- **Search Functionality**: Global and column-specific search capabilities
- **Filter Groups**: Complex filter combinations with AND/OR logic

### 📈 Statistical Analysis
- **Dataset Statistics**: Comprehensive statistical overview of your data
- **Column Analysis**: Individual column statistics and summaries
- **Data Visualization**: Interactive charts and graphs
- **Trend Analysis**: Identify patterns and trends in your data

### 🛠️ Data Manipulation
- **Bulk Operations**: Mass update, delete, or duplicate records
- **Column Management**: Show/hide, reorder, and customize columns
- **Data Validation**: Built-in data quality checks and warnings
- **Undo/Redo**: Full operation history with undo capabilities

### 📤 Export Options
- **Multiple Formats**: Export to Excel, CSV, JSON, XML, and PDF
- **Custom Exports**: Export filtered data or specific selections
- **Formatted Exports**: Maintain styling and formatting in exports
- **Batch Processing**: Export multiple sheets or datasets at once

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Andrewgo12/excel-pages.github.io.git
   cd excel-pages.github.io
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Building for Production

```bash
# Build for GitHub Pages
pnpm build:gh-pages

# Preview the build locally
pnpm preview
```

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Radix UI
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router 6
- **File Processing**: SheetJS (xlsx)
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **Testing**: Vitest

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── utils/             # Utility functions and helpers
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Third-party library configurations
├── public/                # Static assets
├── shared/                # Shared types and utilities
├── .github/workflows/     # GitHub Actions CI/CD
└── dist/                  # Build output (generated)
```

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the `main` branch triggers a new deployment.

### Manual Deployment Steps

1. **Enable GitHub Pages** in your repository settings
2. **Set source** to "GitHub Actions"
3. **Push to main branch** - deployment happens automatically
4. **Access your site** at `https://yourusername.github.io/repository-name/`

### Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [TailwindCSS](https://tailwindcss.com/) for utility-first CSS
- [SheetJS](https://sheetjs.com/) for Excel file processing
- [Recharts](https://recharts.org/) for data visualization

---

**Made with ❤️ for better data processing**
