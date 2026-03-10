import { api, LightningElement } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fullCalendar from "@salesforce/resourceUrl/fullCalendar";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import { jsToApexDate } from 'c/calendarUtils';
import LANG from '@salesforce/i18n/lang';
export default class Calendar extends LightningElement {

     calendarLabel = ''
     calendar
     initialized = false

     connectedCallback() {
          // this.addEventListener('fceventclick', this.handleEventClick.bind(this));
     }

     async renderedCallback() {
      
          if (this.initialized) {
               return
          }

          this.initialized = true

          try {
               // core 📆
               await Promise.all([
                    loadScript(this, fullCalendar + "/packages/core/main.js"),
                    loadStyle(this, fullCalendar + "/packages/core/main.css")
               ])
                 
               //load core first, then plugins📦
               await Promise.all([
                    loadScript(this, fullCalendar + "/packages/daygrid/main.js"),
                    loadStyle(this, fullCalendar + "/packages/daygrid/main.css"),
                    loadScript(this, fullCalendar + "/packages/list/main.js"),
                    loadStyle(this, fullCalendar + "/packages/list/main.css"),
                    loadScript(this, fullCalendar + "/packages/timegrid/main.js"),
                    loadStyle(this, fullCalendar + "/packages/timegrid/main.css"),
                    loadScript(this, fullCalendar + "/packages/interaction/main.js"),
                    loadScript(this, fullCalendar + "/packages/moment/main.js"),
                    loadScript(this, fullCalendar + "/packages/moment-timezone/main.js"),
               ])
               
               // cargar locale si no es inglés
               const locale = (LANG || 'en').toLowerCase();
               if (!locale.startsWith('en')) {
                    try {
                         await loadScript(this, fullCalendar + "/packages/core/locales/" + locale + ".js");
                    } catch (e) {
                         const baseLang = locale.split('-')[0];
                         if (baseLang !== locale) {
                              try {
                                   await loadScript(this, fullCalendar + "/packages/core/locales/" + baseLang + ".js");
                              } catch (e2) { /* locale no disponible, usa inglés */ }
                         }
                    }
               }

               //create calendar and render
               this.init(locale)

          } catch (error) {
         
               console.error("error", error)
               this.dispatchEvent(
                    new ShowToastEvent({
                         title: "Error loading Calendar",
                         variant: "error"
                    })
               );
          }
     }

     init(locale = 'en') {
          const calendarEl = this.template.querySelector(".calendar")

          this.calendar = new FullCalendar.Calendar(calendarEl, {
               plugins: ["dayGridMonth","dayGrid", "timeGrid", "list","interaction","moment"],
               locale: locale,
               views: {
                    listDay: { buttonText: "list day" },
                    listWeek: { buttonText: "list week" },
                    listMonth: { buttonText: "list month"},
                    month: { displayEventEnd: true },
                    timeGridWeek: { buttonText: "week time" },
                    timeGridDay: { buttonText: "day time" },
                    dayGridMonth: { buttonText: "month" },
                    dayGridWeek: { buttonText: "week" },
                    dayGridDay: { buttonText: "day" }
               },
               initialView: 'dayGridMonth',
               header: false,
               events: [],
               // editable: true, //keep false till dragdrop fixed
               eventRendering : 'list-item',
               // eventOrder: function(a, b) {
               //      if (a.slotSort < b.slotSort) {
               //           return -1
               //      } else {
               //           return 1
               //      }
               // },
               eventDrop: info => { console.log('event drag start', info) },
               eventClick: info => { this.event('fceventclick', info) },
               eventMouseEnter: info => {console.log("mouse enter", info) },
               dateClick: info => { this.event('fcdateclick', info) },
          });

          console.log(this.calendar)

          this.calendar.render();
          this.calendarLabel = this.calendar.view.title;

          let startDate       = jsToApexDate(this.calendar.view.activeStart)
          let endDate         = jsToApexDate(this.calendar.view.activeEnd)

          this.event('datechange', { startDate, endDate }) 
     }

     refresh() {
          this.setDates()
     }

     @api setEvents(events) {

          const postedEvents = this.calendar.getEvents()
          postedEvents.forEach(event => event.remove())

          events.forEach(event => this.calendar.addEvent(event))
     }

     @api setValidRanges(range) {

          this.calendar.setOption('validRange', range);
          this.calendar.render();
     }

     setDates() {
          let startDate       = jsToApexDate(this.calendar.view.activeStart)
          let endDate         = jsToApexDate(this.calendar.view.activeEnd)

          this.event('datechange', { startDate, endDate }) 
     }

     nextHandler() {
          this.calendar.next();
          this.calendarLabel  = this.calendar.view.title;

          this.setDates()
     }
      
     previousHandler() {
          this.calendar.prev();
          this.calendarLabel  = this.calendar.view.title;

          this.setDates()
     }
     
     today() {
          this.calendar.today();
          this.calendarLabel = this.calendar.view.title;

          this.setDates()
     }

     dailyViewHandler() {
          this.calendar.changeView('timeGridDay');
          this.calendarLabel = this.calendar.view.title;
     }
      
     weeklyViewHandler() {
          this.calendar.changeView('timeGridWeek');
          this.calendarLabel = this.calendar.view.title;
     }
      
     monthlyViewHandler() {
          this.calendar.changeView('dayGridMonth');
          this.calendarLabel = this.calendar.view.title;
     }
      
     listViewHandler() {
          this.calendar.changeView('listWeek');
          this.calendarLabel = this.calendar.view.title;
     }
      
     handleScroll(event) {
          console.log("handleScroll");
          event.stopImmediatePropogation();
     }

     /**
      * @param {String} name name of event
      * @param {Object} val object containing data to be sent
      */
     event(name, value) {
          this.dispatchEvent(
               new CustomEvent(name, {
                    bubbles: true,
                    composed: true,
                    detail: {
                         value
                    }
               })
          )
     }
}