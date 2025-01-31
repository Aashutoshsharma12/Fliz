import cat_specification from "@controllers/admin/cat_specification";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { cat_editSpecificationSchema, cat_addSpecificationSchema } from "@validators/adminValidator";
import { Router } from "express"
import { StatusCodes } from "http-status-codes"

const spcification_route = Router();

const p = {
    add_specification:"/add",
    list:"/list",
    edit:"/edit",
    delete:"/delete/:id",
    details:"/details/:id"
}

const { CREATED, OK } = StatusCodes;

spcification_route.post(p.add_specification, verifyAuthToken, checkRole(["admin"]), schemaValidator(cat_addSpecificationSchema), async(req:any, res:any)=>{
    const data = await cat_specification.add_Specification(
        req?.body,
        req?.headers
    )
    res.status(CREATED).json({data, code: CREATED})
})

spcification_route.patch(p.edit, verifyAuthToken, checkRole(["admin"]), schemaValidator(cat_editSpecificationSchema), async(req:any, res:any)=>{
    const data = await cat_specification.edit_Specification(
        req?.body,
        req?.headers
    )
    res.status(OK).json({data, code: OK})
})

spcification_route.get(p.list, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await cat_specification.list_Specification(
        req.query,
        req.headers    
    )
    res.status(OK).json({data, code:OK})
} )

spcification_route.delete(p.delete, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await cat_specification.delete_Specification(
        req?.params,
        req?.headers,
    )
    res.status(OK).json({data, code:OK})
} )

spcification_route.get(p.details, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await cat_specification.details_specification(
        req?.params,
        req?.headers,
    )
    res.status(OK).json({data, code:OK})
} )

export default spcification_route