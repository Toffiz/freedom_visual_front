import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { db } from '../database/init.js';
import { Image, ImageUpload } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload images
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadData: ImageUpload = req.body;
    const uploadedImages: Image[] = [];

    for (const file of files) {
      const imageId = uuidv4();
      const filename = `${imageId}.webp`;
      const uploadPath = path.join(__dirname, '../../uploads', filename);

      // Process image with Sharp
      const processedBuffer = await sharp(file.buffer)
        .webp({ quality: 85 })
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();

      // Get image metadata
      const metadata = await sharp(file.buffer).metadata();

      // Save processed image
      await fs.writeFile(uploadPath, processedBuffer);

      // Save to database
      const image: Image = {
        id: imageId,
        filename,
        originalName: file.originalname,
        mimeType: 'image/webp',
        size: processedBuffer.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
        uploadedAt: new Date().toISOString(),
        description: uploadData.description,
        tags: uploadData.tags || [],
      };

      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO images (id, filename, originalName, mimeType, size, width, height, uploadedAt, description, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            image.id,
            image.filename,
            image.originalName,
            image.mimeType,
            image.size,
            image.width,
            image.height,
            image.uploadedAt,
            image.description,
            JSON.stringify(image.tags),
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      uploadedImages.push(image);
    }

    res.json({
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const images = await new Promise<Image[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM images ORDER BY uploadedAt DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows: any[]) => {
          if (err) reject(err);
          else {
            const parsedImages = rows.map(row => ({
              ...row,
              tags: row.tags ? JSON.parse(row.tags) : [],
            }));
            resolve(parsedImages);
          }
        }
      );
    });

    const totalCount = await new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM images', (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      images,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get single image
router.get('/:id', async (req, res) => {
  try {
    const image = await new Promise<Image | null>((resolve, reject) => {
      db.get(
        'SELECT * FROM images WHERE id = ?',
        [req.params.id],
        (err, row: any) => {
          if (err) reject(err);
          else if (row) {
            resolve({
              ...row,
              tags: row.tags ? JSON.parse(row.tags) : [],
            });
          } else {
            resolve(null);
          }
        }
      );
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Delete image
router.delete('/:id', async (req, res) => {
  try {
    const image = await new Promise<Image | null>((resolve, reject) => {
      db.get(
        'SELECT * FROM images WHERE id = ?',
        [req.params.id],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row as Image | null);
        }
      );
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete file
    const filePath = path.join(__dirname, '../../uploads', image.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete file:', filePath);
    }

    // Delete from database
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM images WHERE id = ?', [req.params.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export { router as imageRouter };