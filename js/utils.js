module.exports = {
    average_location_calculus : function (location_list) {
        var number = location_list.length; 

        var lat_sum = 0;
        var long_sum = 0;
        for (var i = 0; i < number; ++i) {
            lat_sum += location_list[i].latitude;
            long_sum += location_list[i].longitude;
        }

        return { latitude : lat_sum / number, longitude : long_sum / number };
    }
};
