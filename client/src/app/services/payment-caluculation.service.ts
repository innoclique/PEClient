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
    newPaymentBreakup.COST_PER_PA = Cost;
    newPaymentBreakup.COST_PER_MONTH=parseFloat(""+(Cost/totalMonths)).toFixed(2);
    newPaymentBreakup.DISCOUNT_PA_PAYMENT=discount;
    newPaymentBreakup.TOTAL_AMOUNT=total_per_annum_payment;
    newPaymentBreakup.COST_PER_MONTH_ANNUAL_DISCOUNT=parseFloat(""+(total_per_annum_payment/totalMonths)).toFixed(2);
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
    newPaymentBreakup.COST_PER_PA = totalEmployeesCost;
    newPaymentBreakup.COST_PER_MONTH=Number(parseFloat(""+(totalEmployeesCost/totalMonths)).toFixed(2));
    newPaymentBreakup.DISCOUNT_PA_PAYMENT=discount;
    newPaymentBreakup.TOTAL_AMOUNT=total_per_annum_payment;
    newPaymentBreakup.COST_PER_MONTH_ANNUAL_DISCOUNT=Number(parseFloat(""+(total_per_annum_payment/totalMonths)).toFixed(2));
    return newPaymentBreakup;
  }

  
  CaluculatePaymentSummary(paymentBreakup,options,paymentScale){
    console.log(options)
    let {COST_PER_MONTH_ANNUAL_DISCOUNT,COST_PER_MONTH,TOTAL_AMOUNT} = paymentBreakup;
    let {noOfMonths,isAnnualPayment} = options;
    let {Tax}  = paymentScale;
    let paymentSummary:any = {};
    paymentSummary.DUE_AMOUNT = Math.round(COST_PER_MONTH_ANNUAL_DISCOUNT*noOfMonths);;
    if(!isAnnualPayment){
      paymentSummary.DUE_AMOUNT = Math.round(COST_PER_MONTH*noOfMonths);
    }
    /**
     * Tax caluculation
     */
    let taxAmount = parseFloat(""+(paymentSummary.DUE_AMOUNT*Tax/100)).toFixed(2);
    paymentSummary.TAX_AMOUNT = Number(taxAmount);
    paymentSummary.TOTAL_PAYABLE_AMOUNT = Number(paymentSummary.DUE_AMOUNT) + paymentSummary.TAX_AMOUNT;
    return paymentSummary;
  }
}
