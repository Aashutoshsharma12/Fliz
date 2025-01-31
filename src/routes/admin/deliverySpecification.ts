import deliverySpecification from "@controllers/admin/deliverySpecification";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { add_deliverySpecification_Schema, edit_deliverySpecification_Schema } from "@validators/adminValidator";
import { Router } from "express"
import { StatusCodes } from "http-status-codes"

const deliverySpe_route = Router();

const p = {
    add:"/add",
    list:"/list",
    edit:"/edit",
    delete:"/delete/:id",
    details:"/details/:id"
}

const { CREATED, OK } = StatusCodes;

deliverySpe_route.post(p.add, verifyAuthToken, checkRole(["admin"]), schemaValidator(add_deliverySpecification_Schema), async(req:any, res:any)=>{
    const data = await deliverySpecification.add(
        req?.body,
        req?.headers
    )
    res.status(CREATED).json({data, code: CREATED})
})

deliverySpe_route.patch(p.edit, verifyAuthToken, checkRole(["admin"]), schemaValidator(edit_deliverySpecification_Schema), async(req:any, res:any)=>{
    const data = await deliverySpecification.edit(
        req?.body,
        req?.headers
    )
    res.status(OK).json({data, code: OK})
})

deliverySpe_route.get(p.list, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await deliverySpecification.list(
        req.query,
        req.headers    
    )
    res.status(OK).json({data, code:OK})
} )

deliverySpe_route.delete(p.delete, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await deliverySpecification.Delete(
        req?.params,
        req?.headers,
    )
    res.status(OK).json({data, code:OK})
} )

deliverySpe_route.get(p.details, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await deliverySpecification.details(
        req?.params,
        req?.headers,
    )
    res.status(OK).json({data, code:OK})
} )

export default deliverySpe_route