export class ClientOrganizationModel  { 
    constructor ( 
        public PaymentUserType: string, 
        public PaymentSettingType: string, 
        public RegularCostRange: string, 
        public PaymentDuration: number, 
        public RegularCost: number, 
        public RegularCostAnualDiscount: number,) {  } 
 }


 export class ResellerModel  { 
    constructor ( 
        public PaymentUserType: string, 
        public PaymentSettingType: string, 
        public RegularCostRange: string, 
        public PaymentDuration: number, 
        public RegularCost: number, 
        public RegularCostAnualDiscount: number,
        public RegularCostAnualC2S: number,
        public RegularCostAnualDiscountC2S: number,
        ) {  } 
 }