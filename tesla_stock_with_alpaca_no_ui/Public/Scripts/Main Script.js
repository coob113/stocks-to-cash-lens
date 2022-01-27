// @input float initialValue = 0.5
// @input Component.ScriptComponent colorPickerScript
// @input Asset.RemoteServiceModule rsm
// @input Component.Text t
// @input Component.Text tDate;
// @input float number = 0;
// @input  bool updated = false;

// This function takes the slider value and returns a date offset
// ranging from five years ago to fifteen minutes ago.
function sliderToDate(sliderVal) {
    const fiveYearsAgo = 60*60*24*365*5*1000;
    const fifteenMinsAgo = 15*60*1000;
    offset = sliderVal * (fiveYearsAgo-fifteenMinsAgo) + fifteenMinsAgo
    return offset
}

// Handles API responses, checking for errors and success
function handleAPIResponse(response, cb) {
    if (response.statusCode !== 1) {
        print("ERROR: The API call did not succeed!. Please check your request");
        cb(true);
    } else {
        try {
            var parsedBody = JSON.parse(response.body);
            if (cb) {
                cb(false, parsedBody);
            }
        } catch (e) {
            print("ERROR: Failed to parse response");
            if (cb) {
                cb(true);
            }
        }
    }
}

// Gets bar data from Alpaca according to params
var getBars = function(symbol, start, end, limit, page_token, timeframe, adjustment, cb) {
    var request = global.RemoteApiRequest.create();
    request.endpoint = "get_bars";
    request.parameters = {"symbol": symbol, "start": start, "end": end, "limit": limit, "page_token": page_token, "timeframe": timeframe, "adjustment": adjustment};
    script.rsm.performApiRequest(request, function(response) {
        if (cb) {
            handleAPIResponse(response, cb);
        }
    });
};

var symbol = "TSLA"
// This function will update the textbox according to the symbol's high at the given date
function updateTeslaPrice(sliderVal) {
    global.updated = true;
    var offset = sliderToDate(sliderVal)
    var dateOfStockPrice = new Date();

    dateOfStockPrice = new Date(dateOfStockPrice.getTime() - offset);
    var oneDay = 60*60*24*1*1000;
    var oneDayBefore = new Date(dateOfStockPrice.getTime() - oneDay);
    
    // Bars must have a start and end in the query, so we use one day as an interval.
    getBars(symbol, oneDayBefore.toISOString(), dateOfStockPrice.toISOString(), limit=25, undefined, "1Hour", "all", function(err, body) {
        if (err) {
            print("ERROR: API did not return correctly");
        } else {
            last_idx = body.bars.length - 1
            barsObject = JSON.stringify(body.bars[last_idx]);
            highPrice = body.bars[last_idx].h.toFixed(2);
            //updates values for instantiating
            global.number = highPrice;
            script.t.text = "$TSLA = $" + String(highPrice);
            script.tDate.text = String(dateOfStockPrice).slice(4, -24);
        } 
    });
}

// Set callback for slider and initialization of slider values
script.colorPickerScript.api.addCallback("onSliderValueChanged", updateTeslaPrice);
updateTeslaPrice(script.initialValue);
script.colorPickerScript.api.setSliderValue(script.initialValue);

