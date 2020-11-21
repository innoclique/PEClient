export class CompetencyBase<T> {
    value: T;
    key: string;
    label: string;
    required: boolean;
    order: number;
    controlType: string;
    type: string;
    options: {key: string, value: string}[];
  showEmpRating:Boolean=false;
  empRating:Number=-1;
  empKey:String;
    constructor(options: {
        value?: T;
        key?: string;
        label?: string;
        required?: boolean;
        order?: number;
        controlType?: string;
        type?: string;
        options?: {key: string, value: string}[];
        showEmpRating?:Boolean,
        empRating?:Number,
        empKey?:String

      } = {}) {
      this.value = options.value;
      this.key = options.key || '';
      this.label = options.label || '';
      this.required = !!options.required;
      this.order = options.order === undefined ? 1 : options.order;
      this.controlType = options.controlType || '';
      this.type = options.type || '';
      this.options = options.options || [];
      this.showEmpRating=options.showEmpRating||false;
      this.empRating=options.empRating||-1;
      this.empKey=options.empKey

    }
  }