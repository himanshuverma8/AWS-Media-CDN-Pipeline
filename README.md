# CDN Control Panel

to implement
realtime image transformations and image generations using llm rest api endpoint 

to implement
elastic search to find files 

A modern, responsive control panel for managing your custom CDN files deployed on AWS S3 with CloudFront distribution.

## Features

- 🖼️ **Image Management**: Upload and organize images in the `/images` folder
- 📁 **File Management**: Upload and organize files in the `/files` folder
- 📂 **Folder Creation**: Create nested folders for better organization
- 🔗 **CDN URL Generation**: Automatically generates CDN URLs for uploaded files
- 📋 **Copy to Clipboard**: Easy URL copying functionality
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⚡ **Real-time Updates**: Instant file listing and management

## URL Format

- **Images**: `https://cdn.hv6.dev/images/path/to/image.png`
- **Files**: `https://cdn.hv6.dev/files/path/to/file.pdf`

## Prerequisites

- Node.js 18+ 
- AWS Account with S3 bucket and CloudFront distribution
- AWS IAM user with S3 permissions

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hv-custom-cdn-control_panel
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET_NAME=your_bucket_name_here
CLOUDFRONT_DOMAIN=cdn.hv6.dev
```

### 3. AWS IAM Permissions

Your AWS IAM user needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

### 4. S3 Bucket Structure

Ensure your S3 bucket has the following structure:
```
your-bucket/
├── images/
│   ├── logos/
│   ├── banners/
│   └── ...
└── files/
    ├── resumes/
    ├── documents/
    └── ...
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the control panel.

## Usage

### Uploading Files

1. Select the **Images** or **Files** tab
2. Drag and drop files or click "Choose Files"
3. Files will be uploaded to the appropriate S3 folder
4. CDN URLs will be automatically generated

### Creating Folders

1. Enter a folder name in the input field
2. Click "Create Folder"
3. Navigate into the folder to upload files

### Managing Files

- **View**: Browse uploaded files and folders
- **Copy URL**: Click the copy icon to copy CDN URLs
- **Open**: Click the external link icon to open files in a new tab
- **Navigate**: Click on folders to navigate into them

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- DigitalOcean App Platform

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AWS SDK**: @aws-sdk/client-s3
- **TypeScript**: Full type safety

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # File upload endpoint
│   │   ├── folders/route.ts     # Folder creation endpoint
│   │   └── list/route.ts        # File listing endpoint
│   ├── layout.tsx
│   └── page.tsx                 # Main dashboard
├── components/
│   ├── FileUpload.tsx           # Upload component
│   └── FileList.tsx             # File listing component
└── lib/
    └── aws-config.ts            # AWS configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details