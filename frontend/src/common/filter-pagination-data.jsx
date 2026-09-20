import React from 'react'
import axios from 'axios';
export default async function filterPaginationData(
    { create_new_arr = false, state, data, page, countRoute, data_to_send = [] ,user=undefined }) {
    let obj;
    let headers ={} ;
   console.log("inside the pagination ")
    if(user){
        headers.headers={
            'Authorization': `Bearer ${user}`
        }
    }
    try {
        if (state !== null && !create_new_arr) {
            obj = { ...state, results: [...state.results, ...data], page: page }
        }
        else {
            const { data: { totalDocs } } =
                await axios.post(import.meta.env.VITE_SERVER_DOMAIN + countRoute, data_to_send,headers);
            obj = { results: data, page: 1, totalDocs }

        }
        return obj;

    } catch (error) {
        console.log(error.message);
    }

}
