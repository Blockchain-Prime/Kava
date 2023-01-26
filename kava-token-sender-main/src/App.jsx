import React ,{ useState,useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Button from "./components/Button";
import { checkNetwork } from "./utils/checkNetwork";
import { toastObj } from "./utils/toastObj";
import FlipperContract from "./contracts/tokensender.json";
import "./App.css"
import Summary from "./components/Summary";
import Detail from "./components/Detail";
import Value from "./components/Value";

const FlipperContractAddress = FlipperContract.address;
const FlipperContractABI = FlipperContract.abi;

const NETWORK_ID = '2221';
const SINGLE_KAVA = BigNumber.from("1000000000000000000");

function App() {
    const [isWalletConnected,setIsWalletConnected] = useState(false);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [selectedAddress,setSelectedAddress] = useState(null);
    const [val,setVal] = useState(0);
    const [destination,setDestination] = useState("");

    const checkExtension = async()=>{
        if(window.ethereum == undefined){
          toast.info("No Wallet Detected!", toastObj);
            return false;
        }
        await initializeProviderAndSigner();
        return true;
    }

    const initializeProviderAndSigner = async()=>{
        let _provider = new ethers.providers.Web3Provider(window.ethereum);
        let _signer = _provider.getSigner(0);
        setProvider(_provider);
        setSigner(_signer);
    }

    const transfer = async()=>{
        const factoryContract = new ethers.Contract(
            FlipperContractAddress,
            FlipperContractABI,
            signer
          ); 
          let TRANSFER_AMOUNT = SINGLE_KAVA.mul(val);
          console.log(val);
          try {
            const result = await factoryContract.transfer(destination,TRANSFER_AMOUNT,{value:TRANSFER_AMOUNT});
            console.log(result);
            setVal(result);
            toast("Transaction Successful!", toastObj);
          } catch (error) {
            console.log(error)
            toast(error, toastObj);
          }
    }

    const connectWallet = async()=>{
      console.log(checkNetwork(NETWORK_ID))
        if(checkExtension() && await checkNetwork(NETWORK_ID)==true){
          console.log("fuck yea")
          const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setSelectedAddress(selectedAddress);
          console.log(selectedAddress)
          setIsWalletConnected(true);
         
          await window.ethereum.on("accountsChanged",([newAddress])=>{
            toast(`Account Changed to ${newAddress}`,toastObj)
            setSelectedAddress(newAddress)
            console.log("account changed")
          })
          return;
        }
        toast(`Connect to Network Name: Kava EVM Testnet
        New RPC URL: https://evm.testnet.kava.io
        Chain ID: 2221
        Currency Symbol: KAVA
        Explorer URL: https://explorer.testnet.kava.io`,toastObj)
        
}

useEffect(() => {
  if(isWalletConnected){
    toast("Wallet Connected Successfully!", toastObj);
  }
}, [isWalletConnected])

    
  return (
    <div className="main">
    <Header/>
    {!isWalletConnected?
    <>
    <Summary/>
    <Button title="Connect Wallet " func={connectWallet}/>
    <ToastContainer/>
    </>
    :
    <>
    <Detail data="Enter Destination"/>
    <input type="input" onChange={e=>setDestination(e.target.value)}/>
    <Detail data="Select Amount"/>
    <input type="number" onChange={e=>setVal(e.target.value)}/>
    <br />
    <div className="btns">

    <Button title="Send " func={transfer}/>
    </div>
    <ToastContainer/>
    </>
  }
    
    </div>
  )
}

export default App;