pragma solidity ^0.5.16;

contract Invoices {
    uint32 serialNo;
    uint64 monthlyGST;
    uint256 start;
    address payable governmentAddress;
    event newInvoiceGenerated(uint32 invoiceNo);
    event monthlyGSTPayed(address indexed _from, uint value);
    struct Invoice {
        uint32 invoiceNo;
        string prodName;
        string date;
        uint16 prodQuantity;
        uint32 unitPrice;
        uint8 gstPercentage;
        uint32 gstAmount;
        uint32 totalPrice;
        bool gstPaid;
    }
    constructor() public
    {
        governmentAddress = 0x7cE1628f5f60287b28653435Ae1c0c3Ff5969AdA;

    }
    mapping(uint32 => Invoice) invoiceList;

    function genInvoice(
        uint32 _invoiceNo,
        string memory _prodName,
        string memory _date,
        uint16 _prodQuantity,
        uint32 _unitPrice,
        uint8 _gstPercentage
    ) public {
        if (serialNo == 0) {
            start = now;
        }
        uint32 _gstAmount = (_unitPrice * _prodQuantity * _gstPercentage) / 100;
        uint32 _totalPrice = (_unitPrice * _prodQuantity) + _gstAmount;
        invoiceList[_invoiceNo] = Invoice(
            _invoiceNo,
            _prodName,
            _date,
            _prodQuantity,
            _unitPrice,
            _gstPercentage,
            _gstAmount,
            _totalPrice,
            false
        );
        serialNo++;
        monthlyGST += _gstAmount;
        emit newInvoiceGenerated(_invoiceNo);
    }

    function getProductDetails(uint32 _invoiceNo)
        public
        view
        returns (
            uint32 invoiceNo,
            string memory prodName,
            string memory date,
            uint16 prodQuantity,
            uint32 unitPrice
        )
    {
        return (
            invoiceList[_invoiceNo].invoiceNo,
            invoiceList[_invoiceNo].prodName,
            invoiceList[_invoiceNo].date,
            invoiceList[_invoiceNo].prodQuantity,
            invoiceList[_invoiceNo].unitPrice
        );
    }

    function getPriceDetails(uint32 _invoiceNo)
        public
        view
        returns (
            uint8 gstPercentage,
            uint32 gstAmount,
            uint32 totalPrice
        )
    {
        return (
            invoiceList[_invoiceNo].gstPercentage,
            invoiceList[_invoiceNo].gstAmount,
            invoiceList[_invoiceNo].totalPrice
        );
    }

    function getMonthlyGST() public returns (uint64 _monthlyGST, bool canPay) {
        bool canPay;
        if (now > start + 1 * 1 minutes) {
            bool canPay = true;
            uint64 _monthlyGST = monthlyGST;
            return (_monthlyGST, canPay);
        } else {
            bool canPay = false;
            uint64 _monthlyGST = monthlyGST;
            return (_monthlyGST, canPay);
        }
    }

    function payMonthlyGST() external payable {
        governmentAddress.transfer(msg.value);
        monthlyGST = 0;
        serialNo = 0;
        emit monthlyGSTPayed(msg.sender,msg.value);
    }
}
