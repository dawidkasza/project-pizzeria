import {select, classNames, templates} from '../setting.js';
import utils from '../utils.js'
import AmountWidget from './AmountWidget.js'

class Product{
   constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidhet();
      thisProduct.processOrder();
   }

   renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
   }

   getElements(){
      const thisProduct = this;
      thisProduct.dom={};
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // .product__header
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form); //.product__order
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs); //input, select
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton); //[href="#add-to-cart"]
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem); //.product__total-price .price
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
   }

   initAccordion(){
      const thisProduct = this;
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
        event.preventDefault();
        const activeProdact=document.querySelector(select.all.menuProductsActive);
        if (activeProdact){
          if (activeProdact !== thisProduct.element) {
            activeProdact.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
   }

   initOrderForm(){
      const thisProduct = this;
      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
   }

   processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          const optionImage = thisProduct.dom.imageWrapper.querySelector('.'+paramId+'-'+optionId);
          if (formData[paramId] && formData[paramId].includes(optionId)){
            if (optionImage){
              optionImage.classList.add('active');
            }
            if (option.default!==true){
              price=price+option.price;
            }
          } else {
            if (optionImage){
              optionImage.classList.remove('active');
            }
            if (option.default==true){
              price=price-option.price;
            }
          }
        }
      }

      // update calculated price in the HTML
      thisProduct.priceSingle = price;
      price *=thisProduct.amountWidget.value;
      thisProduct.dom.priceElem.innerHTML = price;
   }

   initAmountWidhet(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      })
   }

   addToCart(){
      const thisProduct = this;
      //app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-cart', {
         bubbles: true,
         detail: {
            product: thisProduct.prepareCartProduct(),
         },
      });

      thisProduct.element.dispatchEvent(event);
   }

   prepareCartProduct(){
      const thisProduct = this;

      const productSummary={
        id: thisProduct.id,
        name:thisProduct.data.name,
        amount:thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.amountWidget.value*thisProduct.priceSingle,
        params: thisProduct.prepareCartProductPrams()
      };
      return productSummary;
   }

   prepareCartProductPrams(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params ={};
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {}
        }
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected) {
            params[paramId].options[optionId]= option.label;
          }
        }
      }
      return params;
   }
}

export default Product;