import {templates, select, settings} from "../setting.js";
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
            console.log(bookings);
            console.log(eventsCurrent);
            console.log(eventsReapeat);
         })
      
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
   }

   initWidgets(){
      const thisBooking = this;
      thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
      thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
      thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
      thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
      thisBooking.dom.peopleAmount.addEventListener('updated', function(){

      });
      thisBooking.dom.hoursAmount.addEventListener('updated', function(){

      });
   }
 }

 export default Booking;