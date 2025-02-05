import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom';
import ActionButton from '../components/ActionButton';
import { hours } from '../constants';
import { createDelivery, deleteDelivery, getDelivery, updateDelivery } from '../services/http-deliveries';
import { getMessengers } from '../services/http-messengers';
import { ButtonContainer } from '../styles/components/ActionButton.styles';
import {  FieldContainer, FormElement, FormField, Label ,FieldsInline,Container, TextArea, SubTitle, Title, Select, Option} from '../styles/layout/Form.styles';
import Header from './Header';
import {toast}from "react-toastify"

const FormDeliveries = (props) => {
    const history = useHistory()
    let id =  props.id 


    const messengerReference = useRef()
    const [messengers, setMessengers] = useState([])
    const [deliveryData, setDeliveryData] = useState({
        isComplete:false,
        description:"",
        pickUpTime:"07:00",
        deliveryTime:"07:00",
    })

    const [petitionerData, setPetitionerData] = useState({
        name:"",
        address:"",
        numberCell:"",  
    })
    const [receiverData, setReceiverData] = useState({
        name:"",
        address:"",
        numberCell:"",  
    })

    
    const retrieveDelivery = useCallback(
        async () =>{
            try {
                const responseDelivery = await  getDelivery(id)

                setDeliveryData(responseDelivery.data)
                setPetitionerData(responseDelivery.data.petitioner)
                setReceiverData(responseDelivery.data.receiver)
                const responseMessengers = await getMessengers();
                setMessengers(responseMessengers.data)

                messengerReference.current.defaultValue = responseDelivery.data.messenger
            } catch (error) {
               console.log(error)
            }
            
        },
        [id],
    ) 
    const retrieveMessengers = async () =>{
        try {
            const response = await  getMessengers()
            setMessengers(response.data)
            for (const messengerItem of response.data) {
                if(messengerItem.id === messengerReference.current.value){
                    messengerReference.current.defaultValue = messengerItem.name
                }
            }
       
        } catch (error) {
           console.log(error)
        }
    }
  
    useEffect(() => {
        retrieveMessengers()
        if(id) {
            retrieveDelivery()
        }

    }, [id,retrieveDelivery])
    const handleInputsPetitioner = (event)=>{
        setPetitionerData({
            ...petitionerData,
            [event.target.name]: event.target.value
        })
    }

    const handleInputsReceiver = (event)=>{
        setReceiverData({
            ...receiverData,
            [event.target.name]: event.target.value
        })
    }
    const handleInputsDelivery = (event)=>{
        setDeliveryData({
            ...deliveryData,
            [event.target.name]:  event.target.value
        })
    }
    const sendDelivery = async()=> {
        if(!id){

            let idMessenger=messengerReference.current.value;
            try{
               
              console.log( {...deliveryData, petitioner:petitionerData,receiver:receiverData});
                await createDelivery(idMessenger, {...deliveryData, petitioner:petitionerData,receiver:receiverData})
                toast.success("Domicilio creado.")
                goToBack()
            }
            catch(error){
                console.log(error);
            }
    
           
        }
        else {

            try{
                console.log(   messengerReference.current.value);

               const delivery = {
                ...deliveryData,
                petitioner:petitionerData,
                receiver:receiverData,
                messenger:messengerReference.current.value
               }
                const response = await updateDelivery(id,delivery)
                console.log(response.data);
                toast.success("Domicilio actualizado.")
                goToBack()
            }
            catch(error){
                console.log(error);
            }

        } 
    }
    const removeDelivery = async ()=> {
        try {
            await deleteDelivery(id)
            toast.success("Domicilio eliminado")
            goToBack()
            
        } catch (error) {
            
            console.log(error)
        }
        
    }
    
    const goToBack = ()=> {
        history.push('/deliveries')
    }
    return (
        <>
        <Header/>
        <Container>
            <Title align={"center"}>Agrega un domicilio</Title>
             <FormElement method="POST" autoComplete='off' onSubmit={(e)=>{e.preventDefault(); sendDelivery()}}>
                <SubTitle>Información del solicitante</SubTitle>

                <FieldContainer>
                <Label htmlFor={"name"}>Nombre</Label>
                <FormField defaultValue={petitionerData.name} placeholder="Ingrese el nombre del solicitante" required id={"name"} name="name" onChange={handleInputsPetitioner} type="text"></FormField>
                </FieldContainer>

                <FieldContainer>
                <Label htmlFor={"address"}>Dirección</Label>
                <FormField defaultValue={petitionerData.address}  placeholder="Ingrese la dirección" required id={"address"} name="address" onChange={handleInputsPetitioner} type="text"></FormField>
                </FieldContainer>

                <FieldContainer>
                <Label htmlFor={"numberCell"}>Número de contacto</Label>
                <FormField width={"250px"} defaultValue={petitionerData.numberCell}  placeholder="Ingrese el número de celular" required id={"numberCell"} name="numberCell" onChange={handleInputsPetitioner} title={"Debes intrducir un número válido"} pattern={"[0-9]+"}  type="tel"></FormField>
                </FieldContainer>
                <SubTitle>Información del destinatario</SubTitle>
                <FieldContainer>
                <Label htmlFor={"name"}>Nombre</Label>
                <FormField defaultValue={receiverData.name} placeholder="Ingrese el nombre del destinatario" required id={"name"} name="name" onChange={handleInputsReceiver} type="text"></FormField>
                </FieldContainer>

                <FieldContainer>
                <Label htmlFor={"address"}>Dirección</Label>
                <FormField defaultValue={receiverData.address}  placeholder="Ingrese la dirección" required id={"address"} name="address" onChange={handleInputsReceiver} type="text"></FormField>
                </FieldContainer>

                <FieldContainer>
                <Label htmlFor={"numberCell"}>Número de contacto</Label>
                <FormField width={"250px"}  defaultValue={receiverData.numberCell}  placeholder="Ingrese el número de celular" required id={"numberCell"} name="numberCell" onChange={handleInputsReceiver} title={"Debes intrducir un número válido"} pattern={"[0-9]+"}  type="tel"></FormField>
                </FieldContainer>
                <SubTitle>Información del domicilio</SubTitle>

                <FieldContainer>
                    <Label htmlFor={"description"}>Descripción del paquete</Label>
                    <TextArea defaultValue={deliveryData.description}   placeholder="Ingrese la descripción para el domicilio" required id={"description"} name="description" onChange={handleInputsDelivery} ></TextArea>
                </FieldContainer>
                <FieldContainer>
                    <Label htmlFor={"messengerId"}>Mensajero encargado del domicilio</Label>
              
                    <Select  ref={messengerReference} required id={"messengerId"}  >
                       {messengers.map((messenger,index) => (
                           <Option key={messenger.id} value={messenger.id}>{index+1}. {messenger.name}</Option>
                       ))}
                   </Select>
                    
                    

                </FieldContainer>
               <FieldsInline>
               <FieldContainer>
                    <Label htmlFor={"pickUpTime"}>Hora de recogida</Label>
                    <Select value={deliveryData.pickUpTime}   width={"300px"} required id={"pickUpTime"} name="pickUpTime" onChange={handleInputsDelivery}>
                        {hours.map((hour,index) => (
                            <Option key={index} value={hour}>{hour}</Option>
                        ))}
                    </Select>
                </FieldContainer>
                <FieldContainer>
                    <Label htmlFor={"deliveryTime"}>Hora de entrega</Label>
                    <Select value={deliveryData.deliveryTime}  width={"300px"} required id={"deliveryTime"} name="deliveryTime" onChange={handleInputsDelivery}>
                        {hours.map((hour,index) => (
                            <Option key={index} value={hour}>{hour}</Option>
                        ))}
                    </Select>
                </FieldContainer>
                </FieldsInline>
         

                <ButtonContainer>
                <ActionButton marginRight={"1rem"} type={"submit"} icon={"fas fa-save"} text={id?"Actualizar":"Guardar"}></ActionButton>
                {id && <ActionButton marginRight={"1rem"}  icon={"fas fa-trash-alt"} text={"Eliminar domicilio"} action={removeDelivery}></ActionButton>}
                <ActionButton icon={"fas fa-times-circle"} text={"Cancelar"} action={goToBack}></ActionButton>

                </ButtonContainer>
            </FormElement>
            
        </Container>
</>
    )
}

export default FormDeliveries