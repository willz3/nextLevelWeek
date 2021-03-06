import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

// Quando se cria um estado para um array ou objeto: informar manualmente o tipo da variavel
//   \/\/\/
// "Mapeando" o retorno do webservice em uma interface
interface Item {
    id: number;
    name: string;
    image_url: string;
}

interface IBGUFResponse {
    sigla: string;
}

interface IBGCityResponse {
    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const history = useHistory();

    useEffect(() => {
        api.get('/items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response => {
            const ufInitals = response.data.map(uf => uf.sigla);
            setUfs(ufInitals);
        })
    }, []);

    useEffect(() => {
        if(selectedUF === '0'){
            return;
        }

        axios
        .get<IBGCityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(response => {
            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        })


    }, [selectedUF]);


    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    }, []);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUF(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({...formData, [name]: value})
    }

    function handleSelectItem(id: number){

        const alreadySelectedItem = selectedItems.findIndex(item => item === id);

        if(alreadySelectedItem >= 0) {
            const filteredItems = selectedItems.filter(item => item != id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }

    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const  {name, email, whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [ latitude, longitude ] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

            data.append('name', name);
            data.append('email', email);
            data.append('whatsapp', whatsapp);
            data.append('city', city);
            data.append('latitude', String(latitude));
            data.append('longitude', String(longitude));
            data.append('uf', uf);
            data.append('items', items.join(','));
            
            if(selectedFile) {
                data.append('image', selectedFile);
            }

        await api.post('/points', data);
        alert('Ponto de alerta criado!');
        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={ logo } alt="Ecoleta"/>
                
                <Link to="/">
                    <FiArrowLeft />
                    <span>Voltar para home</span>
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br />ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            onChange={handleInputChange}
                            id="name" />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                onChange={handleInputChange}
                                id="email" />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                onChange={handleInputChange}
                                id="whatsapp" />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={16.42} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUF} 
                                onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} 
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                                onClick={() => handleSelectItem(item.id)}>
                                <img src={item.image_url} alt={item.name} />
                                <span>{item.name}</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;