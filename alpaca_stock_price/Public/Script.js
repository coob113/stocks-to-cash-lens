//@input Asset.RemoteServiceModule rsm
//@input Component.Text t

function getLastPrice(ticker, cb) {
    var request = global.RemoteApiRequest.create()
    request.endpoint = "get_snapshot"
    request.parameters = {"symbol": ticker}
    
    script.rsm.performApiRequest(request, function(response) {
        print(response.body)
        
        if (response.statusCode !== 1) {
            print("Request failed with code: " + String(response.statusCode))
            
            return
        }
        print("Request worked")
        var parsed = JSON.parse(response.body)
        var lastPrice = parsed.latestTrade.p
        
        cb(lastPrice)
    })
}

getLastPrice("TSLA", function(price) {
    print(price)
    script.t.text = "$" + String(price)
})