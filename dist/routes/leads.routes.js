import { Router } from 'express';
import axios from 'axios';
import { axiosConfig, baseUrl } from '../Constants.js';
const getLeads = async (filter) => {
    const response = await axios.get(`${baseUrl}/api/v4/leads${filter ? `?filter[name]=${filter}` : ''}`, axiosConfig);
    if (!response.data)
        return undefined;
    const leads = response.data._embedded.leads.map((elem) => ({
        key: elem.id,
        name: elem.name,
        price: elem.price,
        created_at: elem.created_at,
        responsible: elem.responsible_user_id,
        status: elem.status_id,
        pipeline_id: elem.pipeline_id,
        companyId: elem._embedded.companies[0].id
    }));
    return leads;
};
const router = Router();
router.get('/leads', async (req, res) => {
    const qs = req.query.filter;
    try {
        const leads = await getLeads(qs);
        if (!leads)
            res.status(204).end();
        else {
            const arr = leads.map(async (elem) => {
                const res = await axios.get(`${baseUrl}/api/v4/users/${elem.responsible}`, axiosConfig);
                const res2 = await axios.get(`${baseUrl}/api/v4/leads/pipelines/${elem.pipeline_id}/statuses/${elem.status}`, axiosConfig);
                const res3 = await axios.get(`${baseUrl}/api/v4/contacts`, axiosConfig);
                const contacnsArr = res3.data._embedded.contacts
                    .filter((i) => i._embedded.companies[0].id === elem.companyId)
                    .map((el) => {
                    return {
                        name: el.name,
                        values: {
                            phone: el.custom_fields_values.find((e) => e.field_name === 'Телефон').values[0].value,
                            email: el.custom_fields_values.find((e) => e.field_name === 'Email').values[0].value
                        }
                    };
                });
                return {
                    ...elem,
                    responsible: res.data.name,
                    status: res2.data.name,
                    contacts: contacnsArr,
                    created_at: new Date(elem.created_at).toLocaleDateString()
                };
            });
            Promise.all(arr).then((comp) => {
                const resArr = comp;
                res.json(resArr);
            });
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "it's a 500" });
    }
});
export default router;
