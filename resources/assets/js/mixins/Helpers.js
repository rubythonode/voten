export default {
    data: function () {
        return {
            Store
        }
    },

    methods: {
        /**
         * simulates Laravel's str_limit in JS
         *
         * @param string str
         * @param integer length
         * @return string
         */
        str_limit(str, length)
        {
            if (str.length > length)
                return str = str.substring(0, length) + '...';
            return str;
        },

        /**
         * determines if the user is typing in either an input or textarea
         *
         * @return boolean
         */
        isTyping (event)
        {
            return event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'input';
        },

        /**
         * determines if the timestamp is for today's date
         *
         * @param string timestamp
         * @return boolean
         */
        isItToday(timestamp)
        {
            return moment(timestamp).format('DD/MM/YYYY') == moment(new Date()).format('DD/MM/YYYY');
        },

        /**
         * parses the date in a neat and user-friendly format for today
         *
         * @param string timestamp
         * @param string timezone
         * @return string
         */
        parseDateForToday(timestamp, timezone)
        {
         	if(!timezone) {
                timezone = moment.tz.guess();
            }

            return moment(timestamp).tz(timezone).format("LT");
        },

        /**
         * parses the date in a neat and user-friendly format
         *
         * @param string timestamp
         * @param string timezone
         * @return string
         */
        parseDate(timestamp, timezone)
        {
         	if(!timezone) {
                timezone = moment.tz.guess();
            }

            return moment(timestamp).tz(timezone).format("MMM Do");
        },

        /**
         * parses the date in a in full format.
         *
         * @param string timestamp
         * @param string timezone
         * @return string
         */
        parseFullDate(timestamp, timezone)
        {
         	if(!timezone) {
                timezone = moment.tz.guess();
            }

            return moment(timestamp).tz(timezone).format("LLL");
        },
    }
};
