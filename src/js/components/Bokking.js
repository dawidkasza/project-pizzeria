import {templates, select, settings, classNames} from "../setting.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";
import utils from "../utils.js";
 class Booking {
   constructor(element){
      const thisBooking = this;
      thisBooking.render(element);
      thisBooking.initWidgets();
      thisBooking.getData();
   }

   getData(){
      const thisBooking = this;

      const startDateParam = settings.db.dateStartParamKey + "=" + utils.dateToStr(thisBooking.datePicker.minDate); 
      const endDateParam = settings.db.dateEndParamKey + "=" + utils.dateToStr(thisBooking.datePicker.maxDate);
      
      const params = {
         booking: [
            startDateParam,
            endDateParam,
         ],
         eventsCurrent: [
            settings.db.notRepeatParam,
            startDateParam,
            endDateParam,
         ],
         eventsReapeat: [
            settings.db.repeatParam,
            endDateParam,
         ],
      };

      //console.log('getData params', params);

      const urls = {
         booking:       settings.db.url + '/'+ settings.db.bookings + '?' + params.booking.join('&'),
         eventsCurrent: settings.db.url + '/'+ settings.db.events   + '?' + params.eventsCurrent.join('&'),
         eventsReapeat: settings.db.url + '/'+ settings.db.events   + '?' + params.eventsReapeat.join('&'),
      };

      //console.log('url', urls);
      Promise.all([
         fetch(urls.booking),
         fetch(urls.eventsCurrent),
         fetch(urls.eventsReapeat),
      ])
         .then(function(allResponse){
            const bookingsResponse = allResponse[0];
            const eventsCurrentResponse = allResponse[1];
            const eventsReapeatResponse = allResponse[2];
            return Promise.all([
               bookingsResponse.json(),
               eventsCurrentResponse.json(),
               eventsReapeatResponse.json(),
            ]);
         })
         .then(function([bookings, eventsCurrent, eventsReapeat]){
            //console.log(bookings);
            //console.log(eventsCurrent);
            //console.log(eventsReapeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsReapeat)
         });  
   }

   parseData(bookings, eventsCurrent, eventsReapeat){
      const thisBooking = this;
      thisBooking.booked = {};
      for (let item of bookings){
         thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      for (let item of eventsCurrent){
         thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;

      for (let item of eventsReapeat){
         if(item.repeat == 'daily'){
            for(let loopDate = minDate; loopDate<=maxDate; loopDate = utils.addDays(loopDate,1)){
               thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
            }
         }
      }

      thisBooking.updateDom();
   }

   makeBooked(date, hour, duration, table){
      const thisBooking = this;

      if (typeof thisBooking.booked[date]=='undefined'){
         thisBooking.booked[date]={};
      }

      const startHour = utils.hourToNumber(hour);

      if (typeof thisBooking.booked[date][startHour]=='undefined'){
         thisBooking.booked[date][startHour]=[];
      }
      thisBooking.booked[date][startHour].push(table);

      for (let hourBlock = startHour; hourBlock<startHour+duration; hourBlock+=0.5){
         if (typeof thisBooking.booked[date][hourBlock]=='undefined'){
            thisBooking.booked[date][hourBlock]=[];
         }
         thisBooking.booked[date][hourBlock].push(table);
      }

   }

   updateDom(){
      const thisBooking = this;

      thisBooking.date = thisBooking.datePicker.value;
      thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

      let allAvailable = false;

      if(typeof thisBooking.booked[thisBooking.date]=='undefined' 
         || 
         typeof thisBooking.booked[thisBooking.date][thisBooking.hour]=='undefined'
      ){
         allAvailable=true;
      }

      for (let table of thisBooking.dom.tables){
         let tableId = table.getAttribute(settings.booking.tableIdAttribute);
         if (!isNaN(tableId)){
            tableId = parseInt(tableId);
         }

         if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)> -1){
            table.classList.add(classNames.booking.tableBooked);
         } else {
            table.classList.remove(classNames.booking.tableBooked);
         }
      }
   }

   render(element) {
      const thisBooking = this;
      const generatedHTML = templates.bookingWidget();
      thisBooking.dom = {};
      thisBooking.dom.wrapper = element;
      thisBooking.dom.wrapper.innerHTML = generatedHTML;
      thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
      thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
      thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
      thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
      thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
   }

   initWidgets(){
      const thisBooking = this;
      thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
      thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
      thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
      thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
      thisBooking.dom.wrapper.addEventListener('updated', function(){
         thisBooking.updateDom();
      })
   }
 }

 export default Booking;