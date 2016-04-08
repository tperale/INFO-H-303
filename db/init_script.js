// var db = require('sqlite3').verbose();
var fs = require("fs");
var inspect = require('util').inspect;

var parse = require('xml-parser');
// var xml_file = process.env.CLOUD_DIR + "/db/datas/" + "Cafes.xml";
var bar_xml_file = "./datas/" + "Cafes.xml";
var bar_exists = fs.existsSync(bar_xml_file);

if (!bar_exists) {
    console.log("No such xml file in " + bar_xml_file + ".");
    return;
}

var parse_bars = function () {
    var obj = parse(fs.readFileSync(bar_xml_file, 'utf8'));

    // console.log(inspect(obj, { colors: true, depth: Infinity }));

    var bars_array = obj.root.children;

    for (var i = 0; i < bars_array.length; ++i) {
        var bar = bars_array[i];

        var info = bar.children[0];
        var comment = bar.children[1];
        var label = bar.children[2];

        var name = info.children[0].content;

        var est_create_date = bar.attributes.creationDate;
        var est_create_name = bar.attributes.nickname;

        var address = info.children[1].children; // Array of info
        var address_street = address[0].content;
        var address_num = address[1].content;
        var address_zip = address[2].content;
        var address_city = address[3].content;

        var longitude =  address[4].content; // Must be Integer
        var latitude = address[5].content; // Must be Integer

        var phone_number = info.children[2].content ; // Array of info

        var website = null;

        var smokers_allowed = false;
        var snack = false;
        if (info.children.length > 3) {
            if (info.children[3].name == "Smoking") {
                smokers_allowed = true;
            } else if (info.children[3].name == "Snack") {
            snack = true;
            } 

            if ((info.children.length > 4) && info.children[4].name == "Snack") {
                snack = true;
            }
        }


        console.log("-----------------------------------------------");
        console.log("BAR : " + name + " (created by : " +  est_create_name + " on " + est_create_date + ").");
        console.log("Address is : " + address_street + ", " +  address_num + " : " + address_city + " (" + address_zip + ").");
        console.log("Longitude : " + longitude + " + latitude " +  latitude);
        console.log("Phone : " + phone_number);
        if (smokers_allowed)
            console.log("Smokers allowed.");
        else
            console.log("No Smokers.");
        if (snack)
            console.log("Sell also snacks.");
        else
            console.log("Don't sell any snacks.");
        console.log("-----------------------------------------------");
    }
};
