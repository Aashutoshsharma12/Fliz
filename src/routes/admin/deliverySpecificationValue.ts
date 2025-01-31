
import deliverySpecificationValue from "@controllers/admin/deliverySpecificationValue";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { addDeliverySpecificationValue_Schema, editDeliverySpecificationValue_Schema } from "@validators/adminValidator";
import { Router } from "express"
import { StatusCodes } from "http-status-codes"

const delivery_spcificationValue_route = Router();

const p = {
    add:"/add",
    list:"/list",
    edit:"/edit",
    delete:"/delete/:id",
    details:"/details/:id"
}

const { CREATED, OK } = StatusCodes;

delivery_spcificationValue_route.post(p.add, verifyAuthToken, checkRole(["admin"]), schemaValidator(addDeliverySpecificationValue_Schema), async(req:any, res:any)=>{
    const data = await deliverySpecificationValue.add_deliverySpecificationValue(
        req?.body,
        req?.headers
    )
    res.status(CREATED).json({data, code: CREATED})
})

delivery_spcificationValue_route.patch(p.edit, verifyAuthToken, checkRole(["admin"]), schemaValidator(editDeliverySpecificationValue_Schema), async(req:any, res:any)=>{
    const data = await deliverySpecificationValue.edit_deliverySpecificationValue(
        req?.body,
        req?.headers
    )
    res.status(OK).json({data, code: OK})
})

delivery_spcificationValue_route.get(p.list, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await deliverySpecificationValue.list_deliverySpecificationValue(
        req?.query,
        req?.headers    
    )
    res.status(OK).json({data, code:OK})
} )

delivery_spcificationValue_route.delete(p.delete, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await deliverySpecificationValue.delete_deliverySpecificationValue(
        req.params,
        req.headers,
    )
    res.status(OK).json({data, code:OK})
} )

delivery_spcificationValue_route.get(p.details, verifyAuthToken, checkRole(["admin"]), async(req:any, res:any)=>{
    const data = await deliverySpecificationValue.details_deliverySpecificationValue(
        req.params,
        req.headers,
    )
    res.status(OK).json({data, code:OK})
} )

export default delivery_spcificationValue_route