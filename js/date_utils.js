var XRegExp = require('xregexp');

var parse_date = function (date) {
    var regex_date = XRegExp('(?<day>   [0-9]{1,2} ) /?  # day   \n' +
                        '(?<month> [0-9]{1,2} ) /?  # month  \n' +
                        '(?<year>  [0-9]{4} ) # year', 'x');

    return XRegExp.exec(date, regex_date);
};


module.exports = {
    min_date : function (date1, date2) {
        console.log("Comparing : " + date1 + " AND " + date2);
        var result = "";
        var parsed_date1 = parse_date(date1);
        var parsed_date2 = parse_date(date2);

        // Check year.
        var year1 = parseInt(parsed_date1.year, 10);
        var year2 = parseInt(parsed_date2.year, 10);
        if (year1 > year2) {
            return date2;
        } else if (year1 < year2) {
            return date1;
        }

        // Check month.
        var month1 = parseInt(parsed_date1.month, 10);
        var month2 = parseInt(parsed_date2.month, 10);
        if (month1 > month2) {
            return date2;
        } else if (month1 < month2) {
            return date1;
        }

        // Check month.
        var day1 = parseInt(parsed_date1.day, 10);
        var day2 = parseInt(parsed_date2.day, 10);
        if (day1 > day2) {
            return date2;
        } else if (day1 < day2) {
            return date1;
        }

        // Date are equals.
        return date1;
    },

    timestamp_to_date : function (timestamp) {
    
    }
};
