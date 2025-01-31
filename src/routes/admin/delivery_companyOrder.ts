import { Router } from "express";
const deliveryAdmin_Router = Router();
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import  delivery_admin from "@controllers/admin/delivery_companyorder";
import { StatusCodes } from "http-status-codes";


const { OK } = StatusCodes;

const p = {
     List: "/orderList",
     details:"/details/:id",
     excelData_deliveryOrder:"/excelData_deliveryOrder"

}

deliveryAdmin_Router.get(p.List, verifyAuthToken, checkRole(["admin"]), async (req: any, res: any) => {
      const data = await delivery_admin.OrderList_delivery( 
        req?.query,
        req?.headers
    )    
      res.status(OK).json({code:OK, data})
    }
  )


  deliveryAdmin_Router.get(p.details, verifyAuthToken, checkRole(["admin"]), async (req: any, res: any) => {
    const data = await delivery_admin.deliveryOrder_Details( 
      req?.params,
      req?.headers
  )    
    res.status(OK).json({code:OK, data})
  }
)

deliveryAdmin_Router.get(p.excelData_deliveryOrder, verifyAuthToken, checkRole(["admin"]), async (req:any, res:any) =>{
  const data = await delivery_admin.excelData_deliveryOrder(req?.query, req?.headers)
  res.status(OK).json({code:OK, data})
})


  export default deliveryAdmin_Router;
