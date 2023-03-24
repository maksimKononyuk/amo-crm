import { response, Router, Request, Response } from 'express'
import axios from 'axios'
import { RequestWithQuery, ResponseWithBody } from 'src/types'
import { axiosConfig, baseUrl } from '../Constants.js'

type Lead = {
  key: number
  name: string
  price: number
  created_at: number
  responsible: number
  status: number
  pipeline_id: number
  companyId: number
}

type ModifireLead = {
  key: number
  name: string
  price: number
  created_at: string
  responsible: string
  status: string
  pipeline_id: number
  contacts: {
    name: string
    values: {
      phone: string
      email: string
    }
  }[]
}

const getLeads = async (filter: string) => {
  const response = await axios.get(
    `${baseUrl}/api/v4/leads${filter ? `?filter[name]=${filter}` : ''}`,
    axiosConfig
  )
  if (!response.data) return undefined
  const leads: Lead[] = response.data._embedded.leads.map((elem) => ({
    key: elem.id,
    name: elem.name,
    price: elem.price,
    created_at: elem.created_at,
    responsible: elem.responsible_user_id,
    status: elem.status_id,
    pipeline_id: elem.pipeline_id,
    companyId: elem._embedded.companies[0].id
  }))
  return leads
}

const router: Router = Router()

router.get(
  '/leads',
  async (
    req: RequestWithQuery<{ filter: string }>,
    res: ResponseWithBody<ModifireLead[]>
  ) => {
    const qs = req.query.filter
    try {
      const leads = await getLeads(qs)
      if (!leads) res.status(204).end()
      else {
        const arr = leads.map(async (elem: Lead) => {
          const res = await axios.get(
            `${baseUrl}/api/v4/users/${elem.responsible}`,
            axiosConfig
          )
          const res2 = await axios.get(
            `${baseUrl}/api/v4/leads/pipelines/${elem.pipeline_id}/statuses/${elem.status}`,
            axiosConfig
          )
          const res3 = await axios.get(
            `${baseUrl}/api/v4/contacts`,
            axiosConfig
          )
          const contacnsArr = res3.data._embedded.contacts
            .filter((i) => i._embedded.companies[0].id === elem.companyId)
            .map((el) => {
              return {
                name: el.name,
                values: {
                  phone: el.custom_fields_values.find(
                    (e) => e.field_name === 'Телефон'
                  ).values[0].value,
                  email: el.custom_fields_values.find(
                    (e) => e.field_name === 'Email'
                  ).values[0].value
                }
              }
            })
          return {
            ...elem,
            responsible: res.data.name,
            status: res2.data.name,
            contacts: contacnsArr,
            created_at: new Date(elem.created_at).toLocaleDateString()
          }
        })
        Promise.all(arr).then((comp) => {
          const resArr: ModifireLead[] = comp
          res.json(resArr)
        })
      }
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: "it's a 500" })
    }
  }
)

export default router
