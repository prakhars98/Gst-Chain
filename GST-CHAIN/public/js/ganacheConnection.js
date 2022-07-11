var address='0xb2d6963194d5B17C1B642D212FB1300F3d09Fb8f';
var userAccount=[];
const abi =  [
 {
   "inputs": [],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "constructor"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": true,
       "internalType": "address",
       "name": "_from",
       "type": "address"
     },
     {
       "indexed": false,
       "internalType": "uint256",
       "name": "value",
       "type": "uint256"
     }
   ],
   "name": "monthlyGSTPayed",
   "type": "event"
 },
 {
   "anonymous": false,
   "inputs": [
     {
       "indexed": false,
       "internalType": "uint32",
       "name": "invoiceNo",
       "type": "uint32"
     }
   ],
   "name": "newInvoiceGenerated",
   "type": "event"
 },
 {
   "constant": false,
   "inputs": [
     {
       "internalType": "uint32",
       "name": "_invoiceNo",
       "type": "uint32"
     },
     {
       "internalType": "string",
       "name": "_prodName",
       "type": "string"
     },
     {
       "internalType": "string",
       "name": "_date",
       "type": "string"
     },
     {
       "internalType": "uint16",
       "name": "_prodQuantity",
       "type": "uint16"
     },
     {
       "internalType": "uint32",
       "name": "_unitPrice",
       "type": "uint32"
     },
     {
       "internalType": "uint8",
       "name": "_gstPercentage",
       "type": "uint8"
     }
   ],
   "name": "genInvoice",
   "outputs": [],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "internalType": "uint32",
       "name": "_invoiceNo",
       "type": "uint32"
     }
   ],
   "name": "getProductDetails",
   "outputs": [
     {
       "internalType": "uint32",
       "name": "invoiceNo",
       "type": "uint32"
     },
     {
       "internalType": "string",
       "name": "prodName",
       "type": "string"
     },
     {
       "internalType": "string",
       "name": "date",
       "type": "string"
     },
     {
       "internalType": "uint16",
       "name": "prodQuantity",
       "type": "uint16"
     },
     {
       "internalType": "uint32",
       "name": "unitPrice",
       "type": "uint32"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": true,
   "inputs": [
     {
       "internalType": "uint32",
       "name": "_invoiceNo",
       "type": "uint32"
     }
   ],
   "name": "getPriceDetails",
   "outputs": [
     {
       "internalType": "uint8",
       "name": "gstPercentage",
       "type": "uint8"
     },
     {
       "internalType": "uint32",
       "name": "gstAmount",
       "type": "uint32"
     },
     {
       "internalType": "uint32",
       "name": "totalPrice",
       "type": "uint32"
     }
   ],
   "payable": false,
   "stateMutability": "view",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [],
   "name": "getMonthlyGST",
   "outputs": [
     {
       "internalType": "uint64",
       "name": "_monthlyGST",
       "type": "uint64"
     },
     {
       "internalType": "bool",
       "name": "canPay",
       "type": "bool"
     }
   ],
   "payable": false,
   "stateMutability": "nonpayable",
   "type": "function"
 },
 {
   "constant": false,
   "inputs": [],
   "name": "payMonthlyGST",
   "outputs": [],
   "payable": true,
   "stateMutability": "payable",
   "type": "function"
 }
];
var contract={};
    async function init(){
    if (window.ethereum) {
       window.web3 = new Web3(window.ethereum);
       console.log(window.web3);
        try {
           await window.ethereum.enable();
       } catch (error) {
       }
   }
   else if (window.web3) {
       window.web3 = new Web3(web3.currentProvider);
}
    else {
       console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
   }
  
    contract = new window.web3.eth.Contract(abi,address); 
    if (window.location.pathname=='/dashboard/genInvoice'){
        return initGenInvoiceLogic();
    }
    if (window.location.pathname=='/dashboard/getInvoice'){
        return initGetInvoiceLogic();
    }
    if (window.location.pathname=='/dashboard/payGST'){
        return initPayGSTLogic();
    }
    if (window.location.pathname=='/dashboard/searchInvoice/searchInvoiceNo'){
        return initGetInvoiceLogic();
    }
}
  
//web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
   
   async function initGenInvoiceLogic(){
    userAccount = await window.web3.eth.getAccounts();
        console.log(contract);
        console.log(userAccount);
        $('#invoice-btn').on('click',function(e){
            e.preventDefault();
        contract.methods.genInvoice($('#invoice').val(),$('#productName').val(),$('#date').val(),$('#prodQuantity').val(),$('#unitPrice').val(),$('#gst').val()).send({from:userAccount[0], gas:3000000});
        contract.events.newInvoiceGenerated().on('data',(event)=>{
            $('#invoice-form').submit();
            console.log(event);
        }).on('error',(error)=>console.log(error));
    });
        
}
async function initPayGSTLogic(){
    userAccount = await window.web3.eth.getAccounts();
    contract.methods.getMonthlyGST().call().then(gst=>{
        console.log(gst);   
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr';
        console.log(url);
        fetch(url).then(obj=>obj.json()).then(obj=>{
            console.log(obj.ethereum.inr);
            var ethprice = gst._monthlyGST/obj.ethereum.inr;
            var ethToSend = ethprice.toString();
            $('#ether').val(ethprice);
            $('#GST').val(gst._monthlyGST);
            $('#payGST').click(function(){
            contract.methods.payMonthlyGST().send({from:userAccount[0], gas:3000000, value:web3.utils.toWei(ethToSend,'ether')}).then(obj=>console.log(obj));          
           });
             
        });

       });
       contract.events.newInvoiceGenerated().on('data',(event)=>{
           location.reload(true);
           console.log(event);
       }).on('error',(error)=>console.log(error));
       contract.events.monthlyGSTPayed().on('data',(event)=>{
           location.reload(true);
           console.log(event);
       }).on('error',(error)=>console.log(error));
}

async function initGetInvoiceLogic(){
    contract.methods.getPriceDetails(invoiceNo).call().then(price=>{
        $('#totalPrice').text(price.totalPrice);
      $('#GST').text(price.gstPercentage+"%");
      $('#Total').text(price.totalPrice);
     })
    contract.methods.getProductDetails(invoiceNo).call().then(prod=>{
     console.log(prod.prodName);
     $('#invoice').text("#Invoice "+prod.invoiceNo);
     $('#prodName').text(prod.prodName);
     $('#prodQuantity').text(prod.prodQuantity);
     $('#unitPrice').text(prod.unitPrice);
     $('#date').text(prod.date);
    });
}

