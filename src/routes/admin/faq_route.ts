import { Router } from "express";
const faqAdmin_Router = Router();
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import  FAQ_admin from "@controllers/admin/FAQ_admin"
import { StatusCodes } from "http-status-codes";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { FAQ_Schema, faqStatus_Schema } from "@validators/adminValidator";

const { OK } = StatusCodes;

const p = {
    add_faq:"/add",
    edit_faq:"/edit/:id",
    delete_faq:"/delete/:id",
    list_faq:"/list",
    statusChange:"/statusChange"
}

faqAdmin_Router.post(p.add_faq, verifyAuthToken, checkRole(["admin"]), schemaValidator(FAQ_Schema), async (req: any, res: any) => {
    console.log("inside api")
      const data = await FAQ_admin.addFaq(
        req?.body,
        req?.headers
      )  
      res.status(OK).json({code:OK, data})
    }
  )

faqAdmin_Router.get(p.list_faq, verifyAuthToken, checkRole(["admin"]), async (req: any, res: any) => {
    const data = await FAQ_admin.faqList(
        req?.query,
        req?.headers
    )  
    res.status(OK).json({code:OK, data})
  }
)

faqAdmin_Router.delete(p.delete_faq, verifyAuthToken, checkRole(["admin"]), async (req: any, res: any) => {
    const data = await FAQ_admin.faqDelete(
        req?.params,
        req?.headers
    )  
    res.status(OK).json({code:OK, data})
  }
)

faqAdmin_Router.patch(p.edit_faq, verifyAuthToken, checkRole(["admin"]), schemaValidator(FAQ_Schema), async (req: any, res: any) => {
    const data = await FAQ_admin.editFAQ(
        req?.body,
        req?.params,
        req?.headers  
    )
    res.status(OK).json({code:OK, data})
  }
)


faqAdmin_Router.patch(p.statusChange, verifyAuthToken, checkRole(["admin"]), schemaValidator_forQueryReq(faqStatus_Schema), async (req: any, res: any) => {
  const data = await FAQ_admin.faqStatusChange(
      req?.query,
      req?.headers  
  )
  res.status(OK).json({code:OK, data})
}
)

  export default faqAdmin_Router;