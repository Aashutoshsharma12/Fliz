
import specification_Value from "@controllers/admin/specification_Values";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { editSpecificationValue_Schema, addSpecificationValue_Schema  } from "@validators/adminValidator";

import { Router } from "express"
import { StatusCodes } from "http-status-codes"

const spcificationValue_route = Router();

const p = {
    add_specificationValue:"/add",
    list_specificationValue:"/list",
    edit_specificationValue:"/edit",
    delete:"/delete/:id",
    details:"/details/:id"
}

const { CREATED, OK } = StatusCodes;

spcificationValue_route.post(p.add_specificationValue, verifyAuthToken, checkRole(["admin"]), schemaValidator(addSpecificationValue_Schema), async(req:any, res:any)=>{
    const data = await specification_Value.add_SpecificationValue(
        req?.body,
        req?.headers
    )
    res.status(CREATED).json({data, code: CREATED})
})

spcificationValue_route.patch(p.edit_specificationValue, verifyAuthToken, checkRole(["admin"]), schemaValidator(editSpecificationValue_Schema), async(req:any, res:any)=>{
    const data = await specification_Value.edit_SpecificationValue(
        req?.body,
        req?.headers
    )
    res.status(OK).json({data, code: OK})
})

spcificationValue_route.get(p.list_specificationValue, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await specification_Value.list_SpecificationValue(
        req?.query,
        req?.headers    
    )
    res.status(OK).json({data, code:OK})
} )

spcificationValue_route.delete(p.delete, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await specification_Value.delete_SpecificationValue(
        req.params,
        req.headers,
    )
    res.status(OK).json({data, code:OK})
} )

spcificationValue_route.get(p.details, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await specification_Value.details_specificationValue(
        req.params,
        req.headers,
    )
    res.status(OK).json({data, code:OK})
} )

export default spcificationValue_route