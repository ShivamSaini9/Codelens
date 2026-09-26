import multer from 'multer';

export const uploadZip = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});
