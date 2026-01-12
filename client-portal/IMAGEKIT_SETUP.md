# ImageKit Integration Setup

This guide will help you set up ImageKit.io for the admin media gallery.

## Installation

1. Install the ImageKit Node.js SDK:
```bash
npm install imagekit
```

Note: If you encounter permission errors, try:
```bash
sudo npm install imagekit
```

Or install with the `--legacy-peer-deps` flag if needed.

## Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
```

## Getting Your ImageKit Credentials

1. Sign up or log in to [ImageKit.io](https://imagekit.io)
2. Go to your Dashboard
3. Navigate to **Developer Options** → **API Keys**
4. Copy your **Public Key** and **Private Key**
5. Your URL endpoint is already configured: `https://ik.imagekit.io/jensenwoodworkingma/`

## Security Notes

- The `IMAGEKIT_PRIVATE_KEY` should NEVER be exposed to the client
- All uploads and deletes are handled through secure API routes
- File validation is performed on both client and server side
- File names are sanitized to prevent path traversal attacks
- File size is limited to 10MB per image
- Only image files are accepted (JPEG, PNG, GIF, WebP, SVG)

## Features

- ✅ Secure server-side uploads
- ✅ File type validation
- ✅ File size validation (10MB max)
- ✅ Filename sanitization
- ✅ Automatic image optimization via ImageKit
- ✅ Delete functionality
- ✅ Copy URL to clipboard
- ✅ Error handling and user feedback

## Usage

1. Navigate to Admin Dashboard → Media tab
2. Click "Select Images" to choose files
3. Images are automatically uploaded to ImageKit
4. Use "Copy URL" to get the image URL
5. Use "Delete" to remove images from ImageKit

## Storage

Currently, media metadata is stored in browser localStorage. For production, consider:
- Storing metadata in Firestore
- Adding project associations
- Adding tags/categories
- Implementing search functionality
