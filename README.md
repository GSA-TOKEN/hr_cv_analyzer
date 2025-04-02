# HR CV Analyzer

A comprehensive web application for HR departments to manage, analyze, and search through CVs and resumes. This tool helps streamline candidate evaluation with AI-powered analysis.

## Features

### CV Management
- **Upload**: Support for PDF and document formats
- **View**: Integrated PDF viewer with analysis results
- **Delete**: Remove individual or batch delete multiple CVs
- **Search**: Find CVs by filename, candidate name, or other attributes

### Analysis
- **Automatic CV Parsing**: Extract structured data from uploaded CVs
- **Demographic Information**: Extract candidate details (name, email, phone, etc.)
- **Skills Extraction**: Identify technical and soft skills
- **Education History**: Extract educational background
- **Work Experience**: Capture previous employment details
- **Languages**: Detect language proficiency

### Search & Filter
- **Text Search**: Search across all CV content
- **Tag-based Filtering**: Filter candidates by skills, experience, education
- **Advanced Search**: Combine multiple criteria for targeted results
- **Hierarchical Tag System**: Organize skills and attributes in a structured way

## Technical Details

### Tech Stack
- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB with GridFS for file storage
- **UI Components**: Shadcn UI components
- **AI Analysis**: Integration with text analysis services

### Data Structure
- CV documents stored in GridFS
- Extracted text and metadata in MongoDB
- Hierarchical tagging system for skills and attributes

## Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB instance
- Environment variables configured

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd hr-cv-analyzer
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env.local` file with:
   ```
   MONGODB_URI=your-mongodb-connection-string
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Uploading CVs
1. Navigate to the "Upload CV" tab
2. Drag & drop or select files
3. The system will automatically queue them for analysis

### Managing CVs
1. View all uploaded CVs on the main dashboard
2. Select CVs for batch operations (analyze, delete)
3. View individual CV details by clicking on a card
4. Delete CVs using the delete button on each card or in batch mode

### Analyzing CVs
1. Select one or more CVs for analysis
2. Click "Analyze Selected" to process them
3. View analysis results on the CV cards or detailed view

### Searching CVs
1. Use the search box for quick text search
2. Apply filters using the tag system
3. Use advanced search for complex queries

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
