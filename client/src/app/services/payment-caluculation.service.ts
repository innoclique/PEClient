import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentCaluculationService {

  constructor() { }

  GetLicenceBreakdownPayment(paymentScaleOptions){
    const totalMonths:number =12;
    let {Discount,Cost} = paymentScaleOptions;
    /**
      License Type	50001-60000
      # of months to end of year	12
      Cost for the year	50000.00
      Discount for annual payment	2500.00
      Total Amount	47500.00
      Cost per month (annual discount)	3958.33
      Cost per month (monthly payment)	4166.67
      Amount due (monthly payment)	4166.67
      Tax (13%)	541.67
      Total Amount Payable	4708.33
     */
    
    let discount = Cost*Discount/100;
    let total_per_annum_payment = Cost-discount;
    let newPaymentBreakup:any ={};
    newPaymentBreakup.COST_PER_PA = Number(Cost).toFixed(2);
    newPaymentBreakup.DISCOUNT_PA_PAYMENT=Number(discount).toFixed(2);
    newPaymentBreakup.TOTAL_AMOUNT=Number(total_per_annum_payment).toFixed(2);
    newPaymentBreakup.COST_PER_MONTH=Number(Cost/totalMonths).toFixed(2);
    newPaymentBreakup.COST_PER_MONTH_ANNUAL_DISCOUNT=Number(total_per_annum_payment/totalMonths).toFixed(2);
    return newPaymentBreakup;
  }

  GetEmployeeBreakdownPayment(paymentScaleOptions){
    const totalMonths:number =12;
    let {Discount,Cost,orgnization_noOfEmp} = paymentScaleOptions;
    /**
      # of Employees	10
      # of months to end of year	12
      Cost for the year per employee	240.00
      Discount for annual payment (per employee)	2.40
      Total Amount (per employee)	237.60
      Cost per employee per month (annual discount)	19.80
      Cost per employee per month (monthly payment)	20.00
      Amount due (annual payment)	2376.00
      Tax (13%)	308.88
      Total Amount Payable (for annual payments)	2684.88
     */
    let totalEmployeesCost = Cost*orgnization_noOfEmp;

    let discount = totalEmployeesCost*Discount/100;
    let total_per_annum_payment = totalEmployeesCost-discount;
    let newPaymentBreakup:any ={};
    newPaymentBreakup.COST_PER_PA = Number(totalEmployeesCost).toFixed(2);
    newPaymentBreakup.COST_PER_MONTH=Number(totalEmployeesCost/totalMonths).toFixed(2);
    newPaymentBreakup.DISCOUNT_PA_PAYMENT=Number(discount).toFixed(2);
    newPaymentBreakup.TOTAL_AMOUNT=Number(total_per_annum_payment).toFixed(2);
    newPaymentBreakup.COST_PER_MONTH_ANNUAL_DISCOUNT=Number(total_per_annum_payment/totalMonths).toFixed(2);
    return newPaymentBreakup;
  }

  
  CaluculatePaymentSummary(paymentBreakup,options,paymentScale){
    console.log("===CaluculatePaymentSummary===")
    let {COST_PER_MONTH_ANNUAL_DISCOUNT,COST_PER_MONTH,TOTAL_AMOUNT} = paymentBreakup;
    let {noOfMonths,isAnnualPayment,NoNeeded,NoOfEmployees} = options;
    let {Tax,ClientType,UsageType}  = paymentScale;
    console.log(`TOTAL_AMOUNT : ${TOTAL_AMOUNT}`);
    console.log(`Tax : ${Tax}`);
    console.log(`noOfMonths : ${noOfMonths}`);
    console.log(`ClientType : ${ClientType}`);
    console.log(`UsageType : ${UsageType}`);
    console.log(`NoNeeded : ${NoNeeded}`);
    console.log(`COST_PER_MONTH_ANNUAL_DISCOUNT : ${COST_PER_MONTH_ANNUAL_DISCOUNT}`);
    
    let paymentSummary:any = {};
    if(noOfMonths == 12)
      paymentSummary.DUE_AMOUNT = Number(TOTAL_AMOUNT).toFixed(2);
    else
      paymentSummary.DUE_AMOUNT = Number(COST_PER_MONTH_ANNUAL_DISCOUNT*noOfMonths).toFixed(2);

    if(!isAnnualPayment){
      paymentSummary.DUE_AMOUNT = Number(COST_PER_MONTH*noOfMonths).toFixed(2);
    }
    if(ClientType === "Reseller"){
      paymentSummary.DUE_AMOUNT=Number(paymentSummary.DUE_AMOUNT*NoNeeded).toFixed(2);
    }
    if(UsageType === "Employees"){
      if(NoOfEmployees>0){
        paymentSummary.DUE_AMOUNT = Number(paymentSummary.DUE_AMOUNT*NoOfEmployees).toFixed(2);
      }
    }
    console.log(`DUE_AMOUNT : ${paymentSummary.DUE_AMOUNT}`);
    /**
     * Tax caluculation
     */
    let taxAmount = Number(paymentSummary.DUE_AMOUNT*Tax/100).toFixed(2);
    paymentSummary.TAX_AMOUNT = Number(taxAmount).toFixed(2);
    let _TOTAL_PAYABLE_AMOUNT = Number(paymentSummary.DUE_AMOUNT) + Number(paymentSummary.TAX_AMOUNT);
    paymentSummary.TOTAL_PAYABLE_AMOUNT = Number(_TOTAL_PAYABLE_AMOUNT).toFixed(2);
    return paymentSummary;
  }

  CaluculateAdhocPaymentSummary(paymentBreakup,options,paymentScale){
    console.log("===CaluculateAdhocPaymentSummary===")
    let {COST_PER_MONTH_ANNUAL_DISCOUNT,COST_PER_MONTH,TOTAL_AMOUNT} = paymentBreakup;
    let {noOfMonths,isAnnualPayment,NoNeeded} = options;
    let {Tax,ClientType}  = paymentScale;
    console.log(`TOTAL_AMOUNT : ${TOTAL_AMOUNT}`);
    console.log(`Tax : ${Tax}`);
    console.log(`noOfMonths : ${noOfMonths}`);
    console.log(`ClientType : ${ClientType}`);
    console.log(`NoNeeded : ${NoNeeded}`);
    console.log(`COST_PER_MONTH_ANNUAL_DISCOUNT : ${COST_PER_MONTH_ANNUAL_DISCOUNT}`);
    
    let paymentSummary:any = {};
    paymentSummary.DUE_AMOUNT = Number(TOTAL_AMOUNT).toFixed(2);
    if(!isAnnualPayment){
      paymentSummary.DUE_AMOUNT = Number(COST_PER_MONTH*noOfMonths).toFixed(2);
    }
    if(ClientType === "Reseller"){
      paymentSummary.DUE_AMOUNT=Number(paymentSummary.DUE_AMOUNT*NoNeeded).toFixed(2);;
    }
    console.log(`DUE_AMOUNT : ${paymentSummary.DUE_AMOUNT}`);
    /**
     * Tax caluculation
     */
    let taxAmount = Number(paymentSummary.DUE_AMOUNT*Tax/100).toFixed(2);
    paymentSummary.TAX_AMOUNT = Number(taxAmount).toFixed(2);
    let _TOTAL_PAYABLE_AMOUNT = Number(paymentSummary.DUE_AMOUNT) + Number(paymentSummary.TAX_AMOUNT);
    paymentSummary.TOTAL_PAYABLE_AMOUNT = Number(_TOTAL_PAYABLE_AMOUNT).toFixed(2);
    return paymentSummary;
  }
}
