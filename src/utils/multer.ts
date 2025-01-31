import { PutObjectCommand, DeleteObjectCommand,GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { NextFunction } from 'express';
import multer from 'multer'
import { s3Client } from './aws_config';
import { CustomError } from './errors';
import { StatusCodes } from 'http-status-codes';
import { messages } from '@Custom_message';
import vehicle_mediaModel from '@models/delivery_vehicleMedia';
import mongoose from 'mongoose';
import equipment_mediaModel from '@models/equipment_media';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
const ffmpegPath = require('ffmpeg-static')
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');


// Set up multer with memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });
// Error handling middleware for Multer

const compressImage = async (fileBuffer: Buffer, fileName: string): Promise<Buffer> => {
  const compressedBuffer = await sharp(fileBuffer)
    // .resize(900, 600)
    .jpeg({ quality: 40 })
    .toBuffer();
  // const metadata = await sharp(fileBuffer).metadata();
  // let image = sharp(fileBuffer);
  // if (metadata.format === 'jpeg') {
  //   image = image.jpeg({ quality: 80 });
  // } else if (metadata.format === 'png') {
  //   image = image.png({ compressionLevel: 8 });
  // } else {
  //     image = image.jpeg({ quality: 80 });
  // }
  // const compressedBuffer = await image.toBuffer();
  return compressedBuffer;
};
const compressVideo = (fileBuffer: Buffer, fileName: string): Promise<Buffer> => {
  const tempInputPath = `/tmp/${fileName}`;
  const tempOutputPath = `/tmp/compressed-${fileName}`;
  return new Promise((resolve, reject) => {
    fs.writeFileSync(tempInputPath, fileBuffer);
    ffmpeg(tempInputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      // .size('640x360')
      .outputOptions('-crf 28')
      .outputOptions('-preset fast') // Use a faster preset
      .on('end', () => {
        const compressedBuffer = fs.readFileSync(tempOutputPath);
        fs.unlinkSync(tempInputPath);
        fs.unlinkSync(tempOutputPath);
        resolve(compressedBuffer);
      })
      .on('error', reject)
      .save(tempOutputPath);
  });
};

//Middleware to check file sizes
export const checkFileSize = (req: any, res: any, next: any) => {
  if (!req.files) return next();
  const maxSizeImage = 10 * 1024 * 1024; // 10 MB
  const maxSizeVideo = 10 * 1024 * 1024; // 10 MB
  const maxSizeDoc = 10 * 1024 * 1024; // 10 MB
  const maxSizeAudio = 10 * 1024 * 1024; // 10 MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const video_allowedTypes = ['video/mp4'];
  const doc_allowedTypes = ['application/pdf','application/'];
  const audo_allowedTypes = ['audio/mpeg']
  // Check if req.files is an array (for multiple files) or an object
  const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
  for (const file of files) {
    // console.log(file,"file")
    if (file.mimetype.startsWith('image/')) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.', code: 400 });
      }
      if (file.mimetype.startsWith('image/') && file.size > maxSizeImage) {
        return res.status(400).json({ error: `${file.originalname} image file size exceeds 5 MB.`, code: 400 });
      }
    } else if (file.mimetype.startsWith('video/')) {
      if (!video_allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only MP4 is allowed.', code: 400 });
      }
      if (file.mimetype.startsWith('video/') && file.size > maxSizeVideo) {
        return res.status(400).json({ error: 'Video file size exceeds 10 MB.', code: 400 });
      }
    } else if (file.mimetype.startsWith('application/')) {
      // if (!doc_allowedTypes.includes(file.mimetype)) {
      //   return res.status(400).json({ error: 'Invalid file type. Only pdf is allowed.', code: 400 });
      // }
      if (file.mimetype.startsWith('application/') && file.size > maxSizeDoc) {
        return res.status(400).json({ error: 'Document file size exceeds 10 MB.', code: 400 });
      }
    } else if (file.mimetype.startsWith('audio/')) {
      // if (!audo_allowedTypes.includes(file.mimetype)) {
      //   return res.status(400).json({ error: 'Invalid file type. Only mpeg is allowed.', code: 400 });
      // }
      if (file.mimetype.startsWith('audio/') && file.size > maxSizeAudio) {
        return res.status(400).json({ error: 'Audio file size exceeds 10 MB.', code: 400 });
      } 
    } else {
     return res.status(400).json({ error: 'Invalid file.', code: 400 });
     }
  }
  next();
};

// export const checkFileSize = (req: any, res: any, next: any) => {
//   if (!req.file) return next();
//   console.log(req.file, "kfkkfkfk");
//   const maxSizeImage = 1 * 1024 * 1024; // 1 MB
//   const maxSizeVideo = 2 * 1024 * 1024; // 2 MB
//   const maxSizeDoc = 10 * 1024 * 1024; // 10 MB
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//   const video_allowedTypes = ['video/mp4'];
//   const doc_allowedTypes = ['application/pdf'];
//   const file = req.file
//   if (file.mimetype.startsWith('image/')) {
//     if (!allowedTypes.includes(file.mimetype)) {
//       return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.', code: 400 });
//     }
//     if (file.mimetype.startsWith('image/') && file.size > maxSizeImage) {
//       return res.status(400).json({ error: 'Image file size exceeds 1 MB.', code: 400 });
//     }
//   } else if (file.mimetype.startsWith('video/')) {
//     if (!video_allowedTypes.includes(file.mimetype)) {
//       return res.status(400).json({ error: 'Invalid file type. Only MP4 is allowed.', code: 400 });
//     }
//     if (file.mimetype.startsWith('video/') && file.size > maxSizeVideo) {
//       return res.status(400).json({ error: 'Video file size exceeds 2 MB.', code: 400 });
//     }
//   } else if (file.mimetype.startsWith('application/')) {
//     if (!doc_allowedTypes.includes(file.mimetype)) {
//       return res.status(400).json({ error: 'Invalid file type. Only pdf is allowed.', code: 400 });
//     }
//     if (file.mimetype.startsWith('application/') && file.size > maxSizeDoc) {
//       return res.status(400).json({ error: 'Document file size exceeds 10 MB.', code: 400 });
//     }
//   } else {
//     return res.status(400).json({ error: 'Invalid file.', code: 400 });
//   }
//   next();
// };

export const uploadSingleImage = async (req: any, res: any, next: NextFunction) => {
  var message: any = messages(req.headers.language ? req.headers.language : "en");
  const { type } = req.query
  if (!req.files) {
    return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: message.imageRequired, code: StatusCodes.EXPECTATION_FAILED });
  }
  if (!type) {
    return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: message.typeRequired, code: StatusCodes.EXPECTATION_FAILED });
  }
  let compressedBuffer;
  const file = req.files.image[0]
  let key;
  let contentType;
  const fileBuffer = file.buffer;
  const fileName = file.originalname;
  const fileType = file.mimetype;
  if (file.mimetype.startsWith('image/')) {
    // compressedBuffer = await compressImage(fileBuffer, fileName);
        compressedBuffer = fileBuffer
    key = `images/${type}/${Date.now()}-${fileName}`
    contentType = fileType
  } else if (file.mimetype.startsWith('video/')) {
    // compressedBuffer = await compressVideo(fileBuffer, fileName);
    compressedBuffer = fileBuffer
    key = `videos/${type}/${Date.now()}-${fileName}`
    contentType = fileType
  } else if (file.mimetype.startsWith('application/')) {
    compressedBuffer = fileBuffer;
    key = `documents/${type}/${Date.now()}-${fileName}`
    contentType = fileType
  } else if (file.mimetype.startsWith('audio/')) {
    compressedBuffer = fileBuffer;
    key = `audio/${type}/${Date.now()}-${fileName}`
    contentType = fileType
  }
  else {
    return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: message.invalidFile, code: StatusCodes.EXPECTATION_FAILED });
  }

  const params = {
    Bucket: process.env.BucketName,
    Key: key,
    Body: compressedBuffer,
    ContentType: contentType
  };
  const command = new PutObjectCommand(params);
  const data: any = await s3Client.send(command);
  if (data['$metadata'].httpStatusCode == 200) {
    const imageUrl = `https://${process.env.BucketName}.s3.${process.env.Region}.amazonaws.com/${key}`;
    req.imageDetails = imageUrl
    next();
  } else {
    return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: message.invalidFile, code: StatusCodes.EXPECTATION_FAILED });
  }
};

export const uploadMultiple_images = async (req: any, res: any, next: NextFunction) => {
  const uploadedFiles = req.files;
  var message: any = messages(req.headers.language ? req.headers.language : "en");
  const { type } = req.query
  if (!type) {
    return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: message.typeRequired, code: StatusCodes.EXPECTATION_FAILED });
  }
  // Check if files were uploaded
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return res.status(400).json({ error: message.nofile_upload, code: StatusCodes.EXPECTATION_FAILED });
  }

  // Log the uploaded files
  const data = uploadedFiles.map(async (file: any) => {
    let key;
    let contentType;
    const fileBuffer = file.buffer;
    const fileName = file.originalname;
    const fileType = file.mimetype;
    if (file.mimetype.startsWith('image/')) {
      key = `images/${type}/${Date.now()}-${fileName}`
      contentType = fileType
    } else if (file.mimetype.startsWith('video/')) {
      key = `videos/${type}/${Date.now()}-${fileName}`
      contentType = fileType
    } else if (file.mimetype.startsWith('application/')) {
      key = `documents/${type}/${Date.now()}-${fileName}`
      contentType = fileType
    } else {
      return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: message.invalidFile, code: StatusCodes.EXPECTATION_FAILED });
    }
    const params = {
      Bucket: process.env.BucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType
    };

    const command = new PutObjectCommand(params);
    const data: any = await s3Client.send(command);
    if (data['$metadata'].httpStatusCode == 200) {
      const imageUrl = `https://${process.env.BucketName}.s3.${process.env.Region}.amazonaws.com/${key}`;
      return imageUrl;
    } else {
      return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: message.invalidFile, code: StatusCodes.EXPECTATION_FAILED });
    }
  });
  const image_Urls = await Promise.all(data)
  req.imagesUrl = image_Urls
  next();
};

export const deleteImage_from_S3Bucket = async (ids: any, role: any) => {
  try {
    let image: any = ''

    if (role == 'vehicle') {
      const vehicle_details = await vehicle_mediaModel.findOne({ _id: new mongoose.Types.ObjectId(ids[0]) });
      if (vehicle_details) {
        if (role == 'vehicle') {
          if (vehicle_details.media_type == 'image') {
            image = vehicle_details.vehicle_imageUrl
          }
          if (vehicle_details.media_type == 'video') {
            image = vehicle_details.vehicle_videoUrl
          }
        }
      }
    }

    if (role == 'equipment') {
      const equipment_details = await equipment_mediaModel.findOne({ _id: new mongoose.Types.ObjectId(ids[0]) });
      if (equipment_details) {
        if (equipment_details.media_type == 'image') {
          image = equipment_details.equipment_imageUrl
        }
        if (equipment_details.media_type == 'video') {
          image = equipment_details.equipment_videoUrl
        }
      }
    }

    const splitData = image.split('.com/');
    const key = splitData[1]
    const params = {
      Bucket: process.env.BucketName,
      Key: key
    };
    const command = new DeleteObjectCommand(params);
    const data = await s3Client.send(command);
    console.log(`Image ${key} deleted successfully from ${params.Bucket}.`);
  } catch (err) {
    console.log(err);
  }
}

export const deleteImages_from_S3Bucket = async (keys: any) => {
  try {
    const objects = keys.map((key: any) => ({ Key: key }));

    const params = {
      Bucket: process.env.BucketName,
      Delete: {
        Objects: objects,
        Quiet: false
      }
    };

    const command = new DeleteObjectsCommand(params);

    const data = await s3Client.send(command);
    console.log(`Images deleted successfully from ${params.Bucket}`);
  } catch (err) {
    console.log(err);
  }
}

// const XLSX = require('xlsx');

// export const readExcelFile = async(bufferData: any) =>{
//   console.log(bufferData, "filePaths")
//   try {
//       // Convert Buffer to Uint8Array
//       const uint8Array = new Uint8Array(bufferData);
//       // Read the Excel file
//       const workbook = XLSX.read(uint8Array, { type: 'array' });
//       // const workbook = XLSX.readFile(response.data);   // for file store inside project

//       // Assuming data is in the first sheet
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       // Convert the worksheet to an array of objects
//       const data = XLSX.utils.sheet_to_json(worksheet);
//       console.log(data, "data_excel")
//       return data
//   } catch (error) {
//       console.error('Error reading Excel file:', error.message);
//   }
// }
// const AWS = require('aws-sdk');
// const sharp = require('sharp');
// const ffmpeg = require('fluent-ffmpeg');
// const s3 = new AWS.S3();

// exports.handler = async (event) => {
//     const record = event.Records[0];
//     const bucketName = record.s3.bucket.name;
//     const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
//     const fileType = key.split('.').pop().toLowerCase();
    
//     try {
//         const fileData = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
        
//         // Image compression logic
//         if (['jpg', 'jpeg', 'png'].includes(fileType)) {
//             const compressedImage = await sharp(fileData.Body)
//                 .resize(800)  // Resize to 800px (or set your own size)
//                 .jpeg({ quality: 80 })
//                 .toBuffer();
            
//             await s3.putObject({
//                 Bucket: bucketName,
//                 Key: `compressed/images/${key}`,
//                 Body: compressedImage,
//                 ContentType: 'image/jpeg',
//             }).promise();
            
//             console.log(`Compressed image saved as: compressed/images/${key}`);
//         } 
//         // Video compression logic
//         else if (['mp4', 'mov', 'avi'].includes(fileType)) {
//             const tempInputFile = '/tmp/input.mp4';
//             const tempOutputFile = '/tmp/output.mp4';
//             await fs.promises.writeFile(tempInputFile, fileData.Body);
            
//             await new Promise((resolve, reject) => {
//                 ffmpeg(tempInputFile)
//                     .output(tempOutputFile)
//                     .outputOptions('-vcodec libx264', '-crf 28')
//                     .on('end', resolve)
//                     .on('error', reject)
//                     .run();
//             });
            
//             const compressedVideo = await fs.promises.readFile(tempOutputFile);
            
//             await s3.putObject({
//                 Bucket: bucketName,
//                 Key: `compressed/videos/${key}`,
//                 Body: compressedVideo,
//                 ContentType: 'video/mp4',
//             }).promise();
            
//             console.log(`Compressed video saved as: compressed/videos/${key}`);
//         }

//         return {
//             statusCode: 200,
//             body: JSON.stringify('Compression successful!'),
//         };
//     } catch (error) {
//         console.log(error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify('Error processing the file'),
//         };
//     }
// };

