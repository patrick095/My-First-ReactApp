import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

import "./styles.css";

function Product (props){
    const defaultState = {
        product: {},
    };
    const [state, setState] = useState(defaultState);
    const { product} = state;
    
    useEffect(()=>{
        async function fetchData(){
            const { id } = props.match.params;
            const response = await api.get(`/products/${id}`);
    
            setState({ product: response.data});
            return response
        };
        fetchData();
    },[props.match.params])

    return (
        <div className="product-info">
            <h1>{product.title}</h1>
            <p>{product.description}</p>

            <p>
                URL: <a href={product.url}>{product.url}</a>
            </p>
            <Link to='/' className='back'>Voltar</Link>

        </div>
    )
    }
export default Product;