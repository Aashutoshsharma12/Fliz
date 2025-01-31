import cookieParser from "cookie-parser";
// import upload from '@utils/multer'
import express, { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import "express-async-errors";
import apiRouter from "./routes/app";
import { CustomError } from "@utils/errors";
import adminRoutesBE from "./routes/admin/index";
import { connect, disconnect } from "@utils/database";
import "@models/index";
import cors from "cors";
import "@utils/cron_job";
import "@utils/notification"
import logger from "./logger";
import { checkFileSize, upload, uploadMultiple_images, uploadSingleImage } from "@utils/multer";
import multer from "multer";
import { messages } from "@Custom_message";
import { schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { uploadImageSchema } from "@validators/common";
const app = express();
const path = require('path');
//Connect DB
connect();

/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/
// Middleware to set language from request headers
app.use((req: any, res, next) => {
  const lang = req.headers['language'] || 'en'; // Default to English if no language set
  req.language = lang; // Get the first language in the list
  next();
});
// Common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "append,delete,entries,foreach,get,has,keys,set,values,Authorization"
  );
  const oldSend = res.send;
  const startTime = Date.now(); // Record start time
  res.send = function (data) {
    const duration = Date.now() - startTime; // Calculate duration
    // Log the response
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      response: data.toString(),
      duration: `${duration}ms`, // Log duration
    });
    res.send = oldSend; // reset function to avoid infinite loop
    return res.send(data);
  };
  next();
});
// import crypto from "crypto";
// // const secretKey = 'your-shared-secret-key';
// // Secret key and IV (should be 32 and 16 bytes respectively for AES-256-CBC)
// const algorithm = "aes-256-cbc";
// const secretKey = Buffer.from('d969274cc3bb9a312d8e2816c74f7cd135054a8b1d3ca5550fa46763612ac360', 'hex'); // 32 bytes key (as Buffer)
// const iv = Buffer.from('dc6b9851eb56bb28b9683f016644e0f0', 'hex'); // 16 bytes IV (as Buffer)
// function encryptObject(obj: any): string {
//   const jsonString = obj; // Convert object to JSON string
//   const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
//   let encrypted = cipher.update(jsonString, "utf-8", "hex");
//   encrypted += cipher.final("hex");
//   return `${iv.toString("hex")}:${encrypted}`; // Store IV with encrypted text
// }
// // Middleware to validate signature
// app.use(async (req, res, next) => {
//   const encryptedData_key: any = req.headers['x-secret-key']
//   // const originalObject1 = JSON.stringify({ payload: req.body, timestamp: 1738069968000 });
//   // const expectedSignature1 = encryptObject(originalObject1);
//   // console.log("Encrypted Data:", expectedSignature1);

//   // Function to decrypt an encrypted string back to an object
//   function decryptObject(encryptedText: string): object {
//     const [ivHex, encrypted] = encryptedText.split(":");
//     const ivBuffer = Buffer.from(ivHex, "hex");
//     const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer);
//     let decrypted = decipher.update(encrypted, "hex", "utf-8");
//     decrypted += decipher.final("utf-8");
//     return JSON.parse(decrypted); // Parse JSON string back to object
//   }
//   // Decrypt the data
//   const decryptedObject: any = decryptObject(encryptedData_key);
//   const timestamp: any = decryptedObject.timestamp;
//   if (!timestamp || !encryptedData_key) {
//     return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
//       error: 'Unauthorized: Missing signature',
//       message: 'Unauthorized: Missing signature',
//       code: StatusCodes.NON_AUTHORITATIVE_INFORMATION,
//     });
//   }

//   // Ensure timestamp is recent (e.g., within 5 minutes)
//   const currentTime = Date.now();
//   if (Math.abs(currentTime - timestamp) > 5 * 60 * 1000) {
//     return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
//       error: 'Unauthorized: Request expired',
//       message: 'Unauthorized: Request expired',
//       code: StatusCodes.NON_AUTHORITATIVE_INFORMATION,
//     });
//   }

//   // Recompute the signature
//   // // Encrypt the object
//   const originalObject = JSON.stringify({ payload: req.body, timestamp: timestamp });
//   const expectedSignature = await encryptObject(originalObject);
//   console.log("Encrypted Data:", expectedSignature);

//   if (encryptedData_key !== expectedSignature) {
//     return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
//       error: 'Unauthorized: Invalid signature',
//       message: 'Unauthorized: Invalid signature',
//       code: StatusCodes.NON_AUTHORITATIVE_INFORMATION,
//     });
//   }
//   next();
// });

/**
 * Cors
 */
const corsOptions = {
  origin: "*", // Allow only this origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Enable to allow cookies to be sent
  optionsSuccessStatus: 204, // For legacy browser support
};
app.use(cors());
// const allowedOrigins = [
//   'http://3.111.245.148:3008', // Web client
//   'http://6.7.8.9', // Mobile client
// ];

// // CORS options
// const corsOptions = {
//   origin: function (origin: any, callback: any) {
//     // Allow if origin is in the allowedOrigins array or if no origin (mobile app)
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Adjust the methods as needed
//   allowedHeaders: ['Content-Type', 'Authorization'], // Adjust headers as needed
// };

// // Use CORS middleware with specified options
// app.use(cors(corsOptions));

// // Example of additional middleware to authenticate mobile requests
// app.use((req: any, res, next) => {
//   const apiKey = req.headers['x-api-key']; // Example header for mobile authentication
//   if (!req.origin) {
//     if (apiKey === 'YOUR_SECURE_API_KEY') {
//       return next();
//     }
//   }
//   return res.status(400).json({
//     error: 'Not allowed by CORS1',
//     message: 'Not allowed by CORS1',
//     code: 400,
//   });
// });


/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/
app.use((req, res: any, next) => {
  const { io } = require("./index");
  res.io = io;
  next();
});

// Add api router
app.use("/api/v1", apiRouter);

// Admin api router
app.use("/api/v1/admin", adminRoutesBE);

// Error handling
app.use((err: Error | CustomError, req: Request, res: Response, __: NextFunction) => {
  logger.error({
    message: err.message,
    stack: err instanceof Error ? err.stack : undefined, // Access stack only if it's an instance of Error
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
  });
  const status =
    err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST;
  return res.status(status).json({
    error: err.message,
    message: err.message,
    code: status,
  });
}
);

/***********************************************************************************
 *                         API route file upload
 **********************************************************************************/
const multerErrorHandler = (err: any, req: Request, res: any, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (!req.files) {
      return res.status(StatusCodes.EXPECTATION_FAILED).json({
        error: messages('en').imageRequired,
        message: messages('en').imageRequired,
        code: StatusCodes.EXPECTATION_FAILED
      });
    }

    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Unexpected field',
        message: 'Too many files were uploaded.',
        code: StatusCodes.BAD_REQUEST
      });
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'File too large',
        message: 'One of the uploaded files is too large.',
        code: StatusCodes.BAD_REQUEST
      });
    }
    // Handle other Multer errors
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: err.message,
      code: StatusCodes.BAD_REQUEST
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Unknown error',
      message: 'An unknown error occurred.',
      code: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
  next(); // Pass to the next middleware if no error
};
// const XLSX = require('xlsx');

// apiRouter.post('/upload12', upload.single('image'), async (req: any, res: Response) => {
//   console.log(req.file, "fkkfkfkfkfkfk")
//   const data = await readExcelFile(req.file.buffer);
//   return res.status(200).send({ data: data })

// })
apiRouter.post('/upload', schemaValidator_forQueryReq(uploadImageSchema), upload.fields([{ name: 'image', maxCount: 1 }]), multerErrorHandler, checkFileSize, uploadSingleImage, async (req: any, res: Response) => {
  if (req.imageDetails) {
    return res.status(StatusCodes.OK).send({ data: { url: req.imageDetails }, code: StatusCodes.OK, message: 'File uploaded.' })
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Error in file upload',
      message: 'Error in file upload',
      code: StatusCodes.BAD_REQUEST
    });
  }
});
apiRouter.post('/upload_multiple', upload.array('image', 10), multerErrorHandler, checkFileSize, uploadMultiple_images, async (req: any, res: Response) => {
  if (req.imagesUrl) {
    return res.status(StatusCodes.OK).send({ data: { url: req.imagesUrl }, code: StatusCodes.OK, message: 'File uploaded.' })
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Error in file upload',
      message: 'Error in file upload',
      code: StatusCodes.BAD_REQUEST
    });
  }
});

/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/
// Middleware to serve static files (optional)
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/v1/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'abouts.html'));
});

app.get('/api/v1/terms_conditions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'terms_conditions.html'));
});

app.get('/api/v1/contactUs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'contactUs.html'));
});
// const v8 = require('v8');
// console.log(`Heap size limit: ${v8.getHeapStatistics().heap_size_limit / 1024 / 1024} MB`);

// const memoryUsage = process.memoryUsage()
// console.log("memory_usage :", {
//   rss: memoryUsage.rss / 1024 / 1024 + ' MB',
//   heapTotal: memoryUsage.heapTotal / 1024 / 1024 + ' MB',
//   heapUsed: memoryUsage.heapUsed / 1024 / 1024 + ' MB',
//   external: memoryUsage.external / 1024 / 1024 + ' MB',
// });

export default app;
