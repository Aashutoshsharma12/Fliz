const jwt = require("jsonwebtoken");
import otpGenerator from 'otp-generator'
import { CustomError } from './errors';
import { StatusCodes } from 'http-status-codes';
import bookingModel from '@models/booking';
import { messages } from '@Custom_message';
import moment from 'moment-timezone';
import axios from 'axios';
const otp_generate_secretKey = "fliz_unifonic_otp_"

function generate_refreshToken(userId: any, role: any) {
  const refreshToken = jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: process.env.refreshToken_expire_time,
    }
  );
  return refreshToken;
}

function generate_accessToken(userId: any, role: any) {
  const accessToken = jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: process.env.accessToken_expire_time,
    }
  );
  return accessToken;
}

function identityGenerator(role: string, count: number) {
  let padding;
  switch (role) {
    case "renter_user":
      padding = "FHVR";
      break;
    case "delivery_user":
      padding = "FHVD";
      break;
    case "renter_equipment":
      padding = "FHVRE";
      break;
    case "equipment_media":
      padding = "FHVREM";
      break;
    case "vehicle_address":
      padding = "FHVRVA";
      break;
    case "equipment_address":
      padding = "FHVREA";
      break;
    case "delivery_vehicle":
      padding = "FHVDT";
      break;
    case "order":
      padding = "FHVOID";
      break;
    case "admin_category":
      padding = "FHVAC";
      break;
    case "admin_sub_category":
      padding = "FHVASC";
      break;
    case "admin_sub_sub_category":
      padding = "FHVASSC";
      break;
    case "admin_engine_company":
      padding = "FHVAEC";
      break;
    case "admin-engine-model":
      padding = "FHVAEM";
      break;
    case "engine_power":
      padding = "FHVEP";
      break;
    case "fuel_capicity":
      padding = "FHVFC";
      break;
    case "machine_weight":
      padding = "FHVMW";
      break;
    case "capacity":
      padding = "FHVC";
      break;
    case "sizeType":
      padding = "FHVS";
      break;
    case "inspection":
      padding = "FHVIN";
      break;
    case "cylinder":
      padding = "FHVCLNDR";
      break;
    case "wheel_base":
      padding = "FHVWB";
      break;
    case "truck_width":
      padding = "FHVTW";
      break;
    case "installment":
      padding = "FHVIND";
      break;
    case "raise_query":
      padding = "FHVOQ";
      break;
    default:
      padding = "FHVU";
  }

  var m = new Date();
  const timestamp = Date.now().toString(36);
  var theID = padding + "" + timestamp.toUpperCase() + "" + count;
  return theID;
}

function generateOtp() {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });
  return otp;
}

/**
 * Verify Otp
 */

function verifyOtp(role: any, orderId: any, otp: any, language: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const message = messages(language);
      // role : equipment_user, vehicle_user , vehicle_equipment
      let cond: any = {
        isDelete: false,
        _id: orderId
      }
      if (role == 'equipment_user') {
        cond = {
          ...cond,
          user_receive_orderOtp: otp
        }
      } else if (role == 'vehicle_user') {
        cond = {
          ...cond,
          user_receive_orderOtp: otp
        }
      } else if (role == 'vehicle_equipment') {
        const equipmentOrderId = await bookingModel.findOne(cond, { "vehicleDetails.equipmentOrderId": 1 });
        if (equipmentOrderId) {
          cond = {
            ...cond,
            'equipmentDetails.equipmentReceiveOrder_otp': otp,
            _id: equipmentOrderId.vehicleDetails.equipmentOrderId
          }
        }
      } else {
        reject(new CustomError(message.un_valid_user, StatusCodes.BAD_REQUEST));
      }
      const checkOpt = await bookingModel.findOne(cond, { user_receive_orderOtp: 1, 'equipmentDetails.equipmentReceiveOrder_otp': 1 });
      if (checkOpt) {
        resolve({ success: true });
      } else {
        reject(new CustomError(message.invalidOtp, StatusCodes.BAD_REQUEST));
      }
    } catch (err) {
      reject(err)
    }
  });
}

function getDatesBetween(startDate: any, endDate: any) {
  const start = moment(startDate);
  const end = moment(endDate);
  const dates = [];
  // Loop through each date from start to end
  while (start <= end) {
    dates.push(start.format('YYYY-MM-DD')); // Add the date in your desired format
    start.add(1, 'days'); // Move to the next day
  }
  return dates;
}

// Function to get first dates for a given year
function getFirstDates(year: any) {
  console.log('eneter')
  const firstDatesOfMonths = [];
  for (let month = 0; month < 12; month++) {
    const firstDate = moment().year(year).month(month).date(1).format('YYYY-MM-DD');
    firstDatesOfMonths.push(firstDate);
  }
  return firstDatesOfMonths;
}
// Get first dates for the last year and current year
// getFirstDates(moment().year() - 1); // Last year
// getFirstDates(moment().year()); // Current year

const sendOtp_using_unifonic = async (phoneNumber: any) => {
  try {
    const otp = generateOtp()
    const numb_otp = Number(otp)
    const apiUrl = 'https://api.unifonic.com/v1/messages';
    const apiKey = 'your-unifonic-api-key'; // Replace with your Unifonic API key
    const senderId = 'your-sender-id'; // Replace with your sender ID
    const message = `Your OTP is: ${numb_otp}`;
    const response = await axios.post(apiUrl, {
      to: phoneNumber,
      body: message,
      sender_id: senderId,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    const payload = {
      otp: numb_otp,
      timestamp: Date.now()
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_TOKEN, { expiresIn: '5m' }); // Token expires in 5 minutes
    return token;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code outside the range of 2xx
      console.error('Unifonic API response error:', error.response.data);
      throw new Error(`Unifonic API error: ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Unifonic API:', error.request);
      throw new Error('No response received from Unifonic API. Please try again later.');
    } else if (error.message && error.message.includes('jwt')) {
      // JWT specific errors
      console.error('JWT error:', error.message);
      throw new Error('Error generating JWT. Please try again.');
    } else {
      // Other errors
      console.error('Unexpected error:', error.message);
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
};

function verify_unifonicOtp(enteredOtp: any, token: any, language: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      var message: any = messages(language);
      const verifyToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
      const originalOtp = verifyToken.otp
      if (enteredOtp === originalOtp) {
        resolve({ sucess: true });
      } else {
        reject(new CustomError(message.invalidOtp, StatusCodes.NON_AUTHORITATIVE_INFORMATION));
      }
    } catch (err) {
      if (err.message == 'jwt expired') {
        reject(new CustomError(message.expiredOtp, StatusCodes.NON_AUTHORITATIVE_INFORMATION));
      }
      reject(new CustomError(message.invalidOtp, StatusCodes.NON_AUTHORITATIVE_INFORMATION));
    }
  });
}


export {
  generate_refreshToken,
  generate_accessToken,
  identityGenerator,
  generateOtp,
  verifyOtp,
  getDatesBetween,
  getFirstDates,
  sendOtp_using_unifonic,
  verify_unifonicOtp
};
