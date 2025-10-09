/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product',
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
  },
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  },
  cart: {
    defaultDeliveryFee: 20,
  },

};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
};

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
     //console.log('new Prodact:', thisProduct);
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
      //console.log('initOrderForm');
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
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
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
      app.cart.add(thisProduct.prepareCartProduct());
      //app.cart.add(thisProduct);
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

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      if (thisWidget.input.value){
        thisWidget.setValue(thisWidget.input.value);
      } 
      else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }
      
      thisWidget.initAction();
      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);  
    }
    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      /* TODO: add validation */
      if (thisWidget.value !== newValue && !isNaN(newValue) && newValue>=settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;

      //console.log(newValue);
    }
    initAction(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);   
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);   
      });
    }
    announce(){
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initAction();
      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initAction(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      })
    }

    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      const cartContainer = document.querySelector(select.containerOf.cart);
      cartContainer.appendChild(thisCart.element);

      console.log('adding product', menuProduct);
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      
      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
