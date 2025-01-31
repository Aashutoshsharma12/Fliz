import { Router } from "express";
const renterAdmin_Router = Router();
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import  renter_admin from "@controllers/admin/renter_companyOrder";
import { StatusCodes } from "http-status-codes";

import { schemaValidator_forQueryReq } from "@utils/schemaValidator";

const { OK } = StatusCodes;

const p = {
    List: "/orderList",
    details:"/details/:id",
    excelData_renterOrder:"/excelData_renterOrder"
}

renterAdmin_Router.get(p.List, verifyAuthToken, checkRole(["admin"]), async (req: any, res: any) => {
      const data = await renter_admin.OrderList_equipment(
        req?.query,
        req?.headers,
      );
      res.status(OK).json({code:OK, data})
    }
  )

  renterAdmin_Router.get(p.details, verifyAuthToken,  checkRole(["admin"]), async (req: any, res: any) => {
    const data = await renter_admin.renterOrder_Details(
      req?.params,
      req?.headers,
    );
    res.status(OK).json({code:OK, data})
  }
)

renterAdmin_Router.get(p.excelData_renterOrder, verifyAuthToken, checkRole(["admin"]), async (req:any, res:any)=>{
  const data = await renter_admin.excelData_renterOrder(
    req.query,
    req.headers
  )
  res.status(OK).json({code:OK, data})
})


  export default renterAdmin_Router;
