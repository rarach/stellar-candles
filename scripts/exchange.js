
var getPastTrades = function(baseAsset, counterAsset) {
    var url = Constants.API_URL + "/trades?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc&limit=40";

    $.getJSON(url, function(data) {
        $("#tradeHistoryData").empty();
        //TODO; check nulls
        $("#currentPrice").html(currentPriceSpan(data._embedded.records[0]));

        $.each(data._embedded.records, function(i, record) {
            $(tradeRow(record)).appendTo("#tradeHistoryData");
        });
    })
    .fail(function(xhr, textStatus, error) {
        $("#tradeHistoryData").empty();
        $(getErrorRow(xhr, textStatus, error)).appendTo("#tradeHistoryData");
    });
};

var streamPastTrades = function(baseAsset, counterAsset) {
    getPastTrades(baseAsset, counterAsset);
    setTimeout(function() {
        streamPastTrades(baseAsset, counterAsset);
    }, Constants.PAST_TRADES_INTERVAL);
};


var getOrderBook = function(baseAsset, counterAsset) {
    var url = Constants.API_URL + "/order_book?" + baseAsset.ToUrlParameters("selling") + "&" + counterAsset.ToUrlParameters("buying") + "&limit=17";

    $.getJSON(url, function(data) {
        data = addAutobridgedOffers(data);

        $("#orderBookBids").empty();
        $.each(data.bids, function(i, bid) {
            $(offerRow(bid)).appendTo("#orderBookBids");
        });

        $("#orderBookAsks").empty();
        $.each(data.asks, function(i, ask) {
            $(offerRow(ask)).appendTo("#orderBookAsks");
        });
    })
    .fail(function(xhr, textStatus, error) {
        $("#orderBookBids").empty();
        $(getErrorRow(xhr, textStatus, error)).appendTo("#orderBookBids");
    });
};

var streamOrderBook = function(baseAsset, counterAsset) {
    getOrderBook(baseAsset, counterAsset);
    setTimeout(function() {
        streamOrderBook(baseAsset, counterAsset);
    }, Constants.ORDERBOOK_INTERVAL);
};

var addAutobridgedOffers = function(orderBook) {
    //TODO: check if one of the assets is XLM. If not, add auto-bridged offers through XLM
    return orderBook;
};


var getDataForChart = function(baseAsset, counterAsset) {
    const dataRange = "&resolution=900000&limit=192";
    var url = Constants.API_URL + "/trade_aggregations?" + baseAsset.ToUrlParameters("base") + "&" + counterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;

    $.getJSON(url, function(data) {
        $("#marketChart").empty();
        var chartConfig = getDefaultChartConfig();
        var minPrice = Number.MAX_VALUE;
        var maxPrice = -1.0;
        var maxVolume = -1.0;

        $.each(data._embedded.records, function(i, record) {
            //Collect data for a single candle in the candlestick chart
            var open = parseFloat(record.open);
            var high = parseFloat(record.high);
            if (high > maxPrice) {
                maxPrice = high;
            }
            var low = parseFloat(record.low);
            if (low < minPrice) {
                minPrice = low;
            }
            var close = parseFloat(record.close);
            var candle = [record.timestamp, [open, high, low, close]];
            chartConfig.series[0].values.push(candle);             //TODO: setter (i.e. chartConfig.AddCandle(candle);)

            //Collect data for bar chart with volume
            var volume = parseFloat(record.base_volume);
            if (volume > maxVolume) {
                maxVolume = volume;
            }
            var volumeBar = [record.timestamp, volume];
            chartConfig.series[1].values.push(volumeBar);          //TODO: proper wrapper

            chartConfig["scale-x"]["min-value"] = record.timestamp;     //TODO: chartConfig.SetStartTime(record.timestamp);
        });

        chartConfig["scale-x"].step = "15minute";

        //Set price chart range (TODO: chartConfig.SetHorizontalScale(minPrice, maxPrice); )
        minPrice = 0.9 * minPrice;
        maxPrice = 1.1 * maxPrice;
        var step = (maxPrice - minPrice) / 7.0;
        chartConfig["scale-y"].values = "" + minPrice.toFixed(2/*Nope!!*/) + ":" + maxPrice.toFixed(2) + ":" + step.toFixed(2/*FUJ!!*/);

        //Set volume chart range (TODO: you know...)
        step = maxVolume / 3.0;
        chartConfig["scale-y-2"].values = "0:" + maxVolume.toFixed(2) + ":" + step.toFixed(2);

        zingchart.render({
            id : 'marketChart',
            data : chartConfig,
            height: "100%",
            width: "100%"
        });
    })
    .fail(function(xhr, textStatus, error) {
        //TODO: chartConfig.showError(xhr, textStatus);
        myConfigCandleSticks.title.text = textStatus + " - " + xhr.statusText + " (" + xhr.status + ") " + xhr.responseText;
        myConfigCandleSticks.color = "red";
    });
};


function Asset(code, type, issuerAddress, issuerName) {
    this.AssetCode = code || "XLM";
    this.AssetType = type;
    this.Issuer = issuerAddress;
    this.IssuerName = issuerName;

    this.ToUrlParameters = function(prefix) {
        var getParams = prefix + "_asset_code=" + this.AssetCode + "&" + prefix + "_asset_type=" + this.AssetType;
        if (this.Issuer) {
            getParams += "&" + prefix + "_asset_issuer=" + this.Issuer;
        }

        return getParams;
    }
}

var nativeAsset = new Asset("XLM", "native", null, null);
var assetMobi = new Asset("MOBI", "credit_alphanum4", "GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH", "Mobius.network");


$(function() {
    //TODO: load candle chart first
    streamPastTrades(nativeAsset, assetMobi);
    streamOrderBook(nativeAsset, assetMobi);
});




var getDefaultChartConfig = function() {
    myConfigCandleSticks.series[0].values = [];
    myConfigCandleSticks.series[1].values = [];
    return myConfigCandleSticks;
};
//========================================================= TEMPORARY, ZingChart =========================================================
zingchart.THEME="classic";

var myConfigCandleSticks = {
    "type": "mixed",
    "background-color": "none",
    "title":{
        "text": "Interval: 15min",
        "font-family": 'consolas,"Liberation Mono",courier,monospace',
        "color": "#5B6A72",
        "background-color": "none",
        "align": "left"
    },
    "plot":{
        "aspect":"candlestick",
        "bar-width": "70%", //"50%",
        "tooltip":{
            "visible":false
        }
    },
    "plotarea":{
        "margin-left":"10%"
    },
    "scale-x":{
        "min-value": 1438592400000,
        "step": "day",
        "transform": {
            "type": "date",
            "all": "%D,<br>%M %d"
        },
        "max-items": 10,
        "item": {
            "font-size": 10
        }
    },
    "crosshair-x":{
        "plot-label":{
            "multiple":true
        },
        "scale-label":{
            "text":"%v",
            "transform":{
                "type":"date",
                "all":"%D,<br>%M %d, %Y"
            }
        }
    },
    "scale-y":{
        "offset-start": "35%", //to adjust scale offsets.
        "values": "90:130:20",
        "format": "$%v",
        "label": {
            "text": "Price (MOBI)"
        },
        "guide":{
            "line-style":"solid"
        },
        "item":{
            "font-size":10
        }
    },
    "scale-y-2":{
        "placement": "default", //to move scale to default (left) side.
        "blended": true, //to bind the scale to "scale-y".
        "offset-end": "85%", //to adjust scale offsets.
        "values": "0:75:15",
        "format": "%v",
        "guide":{
            "line-style":"solid"
        },
        "item":{
            "font-size":10
        }
    },
    "series": [
        {
            "type":"stock",
            "scales": "scale-x,scale-y",
            "guide-label": { //for crosshair plot labels
                "text": "Open: $%open<br>High: $%high<br>Low: $%low<br>Close: $%close",
                "decimals": 2
            },
            "trend-up":{
                "line-color":"#46b446",
                "border-color":"#46b446",
                "background-color":"#46b446"
            },
            "trend-down":{
                "line-color":"#ed8117",
                "border-color":"#ed8117",
                "background-color":"#ed8117"
            },
            "values":[
                [1438592400000, [120.8800,	121.7300,	120.1700,	121.1200]], //08/03/15
                [1438678800000, [121.5000,	122.0800,	120.6100,	121.6900]], //08/04/15
                [1438765200000, [110.8300,	113.9500,	109.5000,	110.5300]], //08/05/15
                [1438851600000, [110.4000,	110.4000,	104.2400,	108.5500]], //08/06/15
                [1438938000000, [108.7500,	109.5598,	107.6600,	109.3500]], //08/07/15

                [1439197200000, [110.0000,	111.0000,	109.7400,	111.0000]], //08/10/15
                [1439283600000, [110.3400,	110.4900,	107.9500,	108.0000]], //08/11/15
                [1439370000000, [107.0000,	107.4400,	105.5100,	106.9900]], //08/12/15
                [1439456400000, [107.2100,	108.5100,	106.7500,	107.5200]], //08/13/15
                [1439542800000, [107.6100,	107.6700,	106.5200,	107.1600]], //08/14/15

                [1439802000000, [107.3000,	109.2800,	106.8400,	109.0500]], //08/17/15
                [1439888400000, [108.0400,	108.2500,	106.8000,	106.9400]], //08/18/15
                [1439974800000, [106.5800,	107.7500,	105.7701,	106.4500]], //08/19/15
                [1440061200000, [104.3400,	105.0000,	99.7600,	100.0200]], //08/20/15
                [1440147600000, [97.5000,	100.6300,	96.6100,	98.8400]], //08/21/15

                [1440406800000, [93.3800,	99.9950,	90.0000,	95.3600]], //08/24/15
                [1440493200000, [99.7300,	100.0900,	95.7200,	95.8900]], //08/25/15
                [1440579600000, [98.6900,	99.4900,	96.2600,	99.2300]], //08/26/15
                [1440666000000, [101.3500,	102.6200,	99.7800,	102.1700]], //08/27/15
                [1440752400000, [102.1900,	103.3400,	101.8100,	102.4800]], //08/28/15

                [1441011600000, [102.3000,	102.4600,	100.9100,	101.8800]], //08/31/15
                [1441098000000, [99.3100,	101.3396,	99.1578,	99.5100]], //09/01/15
                [1441184400000, [100.9200,	101.9400,	99.5500,	101.8900]], //09/02/15
                [1441270800000, [102.2000,	103.0300,	101.4600,	101.9900]], //09/03/15
                [1441357200000, [100.9600,	101.8200,	100.3600,	100.9700]], //09/04/15

                [1441702800000, [102.9500,	104.1500,	102.5150,	104.0100]], //09/08/15
                [1441789200000, [104.7500,	104.9500,	101.6800,	101.9100]], //09/09/15
                [1441875600000, [101.8500,	103.2200,	101.3310,	102.6000]], //09/10/15
                [1441962000000, [102.3500,	104.5000,	102.2000,	104.4800]], //09/11/15

                [1442221200000, [104.6500,	104.9000,	102.9900,	103.8200]], //09/14/15
                [1442307600000, [103.2500,	103.8000,	101.8300,	103.4300]], //09/15/15
                [1442394000000, [103.3200,	104.0700,	102.7500,	103.9600]], //09/16/15
                [1442480400000, [104.2000,	105.9500,	103.7500,	104.2000]], //09/17/15
                [1442566800000, [103.2000,	104.2100,	102.3900,	102.8400]], //09/18/15

                [1442826000000, [103.6800,	103.8300,	102.4600,	103.4100]], //09/21/15
                [1442912400000, [102.1800,	102.7500,	101.4800,	102.4900]], //09/22/15
                [1442998800000, [102.4400,	102.6300,	101.3800,	101.5700]], //09/23/15
                [1443085200000, [101.0000,	101.3300,	99.2400,	100.6200]], //09/24/15
                [1443171600000, [101.5100,	101.8000,	99.5800,	100.3000]], //09/25/15

                [1443430800000, [99.9000,	100.3900,	98.2950,	98.4900]], //09/28/15
                [1443517200000, [98.5100,	100.0600,	97.7700,	99.4200]], //09/29/15
                [1443603600000, [100.7800,	102.4300,	100.5000,	102.2000]], //09/30/15
                [1443690000000, [102.9700,	103.4700,	101.0800,	102.6700]], //10/01/15
                [1443776400000, [101.2100,	103.0100,	99.8800,	103.0000]], //10/02/15

                [1444035600000, [103.7000,	104.1960,	102.6101,	103.8500]], //10/05/15
                [1444122000000, [104.1900,	104.5100,	103.2100,	103.7700]], //10/06/15
                [1444208400000, [104.4900,	104.5900,	102.6600,	103.3900]], //10/07/15
                [1444294800000, [103.2000,	104.8900,	102.7000,	104.6100]], //10/08/15
                [1444381200000, [105.0900,	106.0500,	104.6700,	105.5600]], //10/09/15

                [1444640400000, [105.9100,	106.7000,	105.6200,	106.3500]], //10/12/15
                [1444726800000, [105.7400,	107.3900,	105.3100,	106.5900]], //10/13/15
                [1444813200000, [106.5000,	106.8500,	105.2300,	105.7300]], //10/14/15
                [1444899600000, [106.5000,	108.0000,	106.2600,	107.8900]], //10/15/15
                [1444986000000, [108.2700,	108.5000,	107.4600,	108.2400]], //10/16/15

                [1445245200000, [108.2500,	109.9700,	107.9400,	109.4700]], //10/19/15
                [1445331600000, [109.5500,	110.5300,	109.4100,	109.8400]], //10/20/15
                [1445418000000, [110.6700,	111.5600,	110.0100,	110.0900]], //10/21/15
                [1445418000000, [110.6700,	113.3500,	110.3900,	113.2500]], //10/22/15
                [1445590800000, [114.2100,	114.2100,	111.8500,	113.0900]], //10/23/15

                [1445850000000, [113.0700,	113.5800,	112.1200,	113.5200]], //10/26/15
                [1445936400000, [113.2900,	114.2680,	113.2450,	113.7700]], //10/27/15
                [1446022800000, [113.9700,	114.4600,	112.8600,	114.3400]], //10/28/15
                [1446109200000, [114.3400,	115.4000,	114.2000,	115.0400]], //10/29/15
                [1446195600000, [115.0000,	115.2399,	113.6700,	113.7400]], //10/30/15

                [1446454800000, [114.4900,	115.3100,	114.0100,	115.0400]], //11/02/15
                [1446541200000, [114.9700,	116.4000,	114.5400,	115.5400]], //11/03/15
                [1446627600000, [116.6400,	116.8300,	110.8100,	113.2500]], //11/04/15
                [1446714000000, [113.2600,	113.9300,	111.6001,	113.0000]], //11/05/15
                [1446800400000, [114.6000,	116.7500,	114.5700,	115.6700]], //11/06/15

                [1447059600000, [115.9000,	116.7300,	115.1800,	116.4200]], //11/09/15
                [1447146000000, [116.1700,	117.5100,	115.5100,	117.4200]], //11/10/15
                [1447232400000, [117.5500,	117.5800,	116.4300,	116.5200]], //11/11/15
                [1447318800000, [115.6000,	116.9900,	115.0000,	116.2100]], //11/12/15
                [1447405200000, [115.9200,	116.4200,	114.3800,	114.8400]], //11/13/15

                [1447664400000, [113.4700,	116.0800,	113.3350,	115.9200]], //11/16/15
                [1447750800000, [116.1100,	117.5500,	115.5100,	116.1300]], //11/17/15
                [1447837200000, [116.2200,	118.2800,	116.0500,	118.1400]], //11/18/15
                [1447923600000, [118.1500,	119.1598,	117.6400,	118.7100]], //11/19/15
                [1448010000000, [119.1100,	120.2500,	118.9000,	120.0700]], //11/20/15

                [1448269200000, [120.3000,	120.6500,	119.0000,	119.4200]], //11/23/15
                [1448355600000, [117.9000,	118.5700,	117.2800,	117.9500]], //11/24/15
                [1448442000000, [118.2900,	119.3380,	118.1500,	118.6700]], //11/25/15

                [1448614800000, [116.0000,	116.5000,	113.7000,	115.1300]], //11/27/15

                [1448874000000, [115.5600,	115.5800,	113.3100,	113.4700]], //11/30/15
                [1448960400000, [114.1500,	115.4600,	113.6600,	115.3900]], //12/01/15
                [1449046800000, [115.3900,	115.4700,	113.8300,	114.0000]], //12/02/15
                [1449133200000, [114.1700,	114.6510,	111.4400,	111.8900]], //12/03/15
                [1449219600000, [112.7400,	114.3050,	112.5300,	114.2400]], //12/04/15

                [1449478800000, [114.5600,	114.5600,	112.6500,	113.8300]], //12/07/15
                [1449565200000, [113.3500,	113.4500,	112.4000,	112.4800]], //12/08/15
                [1449651600000, [112.3900,	113.0612,	110.5800,	111.4700]], //12/09/15
                [1449738000000, [111.1500,	111.5800,	110.1700,	110.7600]], //12/10/15
                [1449824400000, [109.9100,	109.9500,	107.6177,	108.0400]], //12/11/15

                [1450083600000, [108.6800,	109.8700,	108.2792,	109.3500]], //12/14/15
                [1450170000000, [112.0500,	113.3450,	111.5801,	112.1600]], //12/15/15
                [1450256400000, [114.6900,	114.7500,	111.8000,	113.7900]], //12/16/15
                [1450342800000, [114.1300,	114.4800,	111.9800,	112.0100]], //12/17/15
                [1450429200000, [112.0100,	112.4400,	107.3500,	107.7200]], //12/18/15

                [1450688400000, [108.8000,	110.1000,	105.3300,	106.5900]], //12/21/15
                [1450774800000, [106.9900,	107.2000,	105.8300,	106.7400]], //12/22/15
                [1450861200000, [107.2100,	107.2400,	104.3000,	105.5600]], //12/23/15
                [1450947600000, [105.2000,	106.6400,	105.0600,	105.8600]], //12/24/15

                [1451293200000, [106.5000,	108.2000,	106.3300,	107.2500]], //12/28/15
                [1451379600000, [107.8800,	108.0400,	106.4500,	107.0800]], //12/29/15
                [1451466000000, [106.8900,	107.2100,	106.2500,	106.3400]], //12/30/15
                [1451552400000, [106.1400,	106.3100,	105.0600,	105.0800]], //12/31/15

                [1451898000000, [103.1200,	103.4300,	101.7300,	102.9800]], //01/04/16
                [1451984400000, [102.6700,	102.6700,	99.8900,	100.9000]], //01/05/16
                [1452070800000, [99.3800,	101.4600,	99.3600,	100.3600]], //01/06/16
                [1452157200000, [98.9600,	101.3500,	98.5200,	99.5000]], //01/07/16
                [1452243600000, [100.6300,	100.9150,	99.0000,	99.2500]], //01/08/16

                [1452502800000, [100.2100, 100.4500,	98.5500,	99.9200]], //01/11/16
                [1452589200000, [100.9700, 101.8500,	100.3400,	101.4600]], //01/12/16
                [1452675600000, [101.8800, 101.8800,	98.1200,	98.4800]], //01/13/16
                [1452762000000, [98.6500,	99.9100,	97.1900,	99.1100]], //01/14/16
                [1452848400000, [95.6200,	96.8800,	93.4600,	93.9000]], //01/15/16

                [1453194000000, [95.0000,	95.0700,	93.0300,	93.9700]], //01/19/16
                [1453280400000, [92.1800,	93.6400,	90.4200,	92.5400]], //01/20/16
                [1453366800000, [92.8700,	94.8600,	92.3000,	94.0200]], //01/21/16
                [1453453200000, [95.9500,	97.4200,	95.5500,	96.9000]], //01/22/16

                [1453712400000, [96.4200,	96.6800,	95.1204,	95.2900]], //01/25/16
                [1453798800000, [95.4900,	96.4261,	95.0900,	96.2700]], //01/26/16
                [1453885200000, [96.3100,	96.6300,	93.8700,	94.3200]], //01/27/16
                [1453971600000, [95.2000,	95.2000,	92.3700,	93.5300]], //01/28/16
                [1454058000000, [94.2100,	95.8200,	93.6300,	95.8200]] //01/29/16
            ]
        },
        {
            "type":"bar",
            "scales": "scale-x,scale-y-2",
            "guide-label": { //for crosshair plot labels
                "text": "Volume: %v",
                "decimals": Constants.DEFAULT_AMOUNT_DECIMALS //2
            },
            "background-color": "#5B6A72", //"#00cc99",
            "values":[
                [1438592400000, 8.43], //08/03/15
                [1438678800000, 12.62], //08/04/15
                [1438765200000, 61.01], //08/05/15
                [1438851600000, 57.18], //08/06/15
                [1438938000000, 15.79], //08/07/15

                [1439197200000, 11.62], //08/10/15
                [1439283600000, 13.57], //08/11/15
                [1439370000000, 17.02], //08/12/15
                [1439456400000, 9.75], //08/13/15
                [1439542800000, 7.10], //08/14/15

                [1439802000000, 7.95], //08/17/15
                [1439888400000, 12.02], //08/18/15
                [1439974800000, 9.48], //08/19/15
                [1440061200000, 34.65], //08/20/15
                [1440147600000, 30.88], //08/21/15

                [1440406800000, 30.16], //08/24/15
                [1440493200000, 19.08], //08/25/15
                [1440579600000, 13.76], //08/26/15
                [1440666000000, 17.53], //08/27/15
                [1440752400000, 11.01], //08/28/15

                [1441011600000, 8.52], //08/31/15
                [1441098000000, 14.21], //09/01/15
                [1441184400000, 12.15], //09/02/15
                [1441270800000, 8.95], //09/03/15
                [1441357200000, 9.21], //09/04/15

                [1441702800000, 8.57], //09/08/15
                [1441789200000, 9.58], //09/09/15
                [1441875600000, 9.03], //09/10/15
                [1441962000000, 9.53], //09/11/15

                [1442221200000, 6.96], //09/14/15
                [1442307600000, 9.17], //09/15/15
                [1442394000000, 6.51], //09/16/15
                [1442480400000, 7.79], //09/17/15
                [1442566800000, 13.56], //09/18/15

                [1442826000000, 7.15], //09/21/15
                [1442912400000, 8.33], //09/22/15
                [1442998800000, 5.82], //09/23/15
                [1443085200000, 10.71], //09/24/15
                [1443171600000, 7.18], //09/25/15

                [1443430800000, 8.24], //09/28/15
                [1443517200000, 9.47], //09/29/15
                [1443603600000, 9.19], //09/30/15
                [1443690000000, 7.50], //10/01/15
                [1443776400000, 9.11], //10/02/15

                [1444035600000, 7.14], //10/05/15
                [1444122000000, 5.66], //10/06/15
                [1444208400000, 7.01], //10/07/15
                [1444294800000, 7.50], //10/08/15
                [1444381200000, 7.34], //10/09/15

                [1444640400000, 5.18], //10/12/15
                [1444726800000, 8.34], //10/13/15
                [1444813200000, 5.56], //10/14/15
                [1444899600000, 6.74], //10/15/15
                [1444986000000, 5.91], //10/16/15

                [1445245200000, 8.00], //10/19/15
                [1445331600000, 9.67], //10/20/15
                [1445418000000, 8.78], //10/21/15
                [1445418000000, 10.03], //10/22/15
                [1445590800000, 7.93], //10/23/15

                [1445850000000, 5.73], //10/26/15
                [1445936400000, 5.86], //10/27/15
                [1446022800000, 6.45], //10/28/15
                [1446109200000, 6.13], //10/29/15
                [1446195600000, 8.50], //10/30/15

                [1446454800000, 6.95], //11/02/15
                [1446541200000, 7.13], //11/03/15
                [1446627600000, 20.74], //11/04/15
                [1446714000000, 14.84], //11/05/15
                [1446800400000, 16.80], //11/06/15

                [1447059600000, 9.32], //11/09/15
                [1447146000000, 8.24], //11/10/15
                [1447232400000, 6.38], //11/11/15
                [1447318800000, 7.22], //11/12/15
                [1447405200000, 8.08], //11/13/15

                [1447664400000, 5.77], //11/16/15
                [1447750800000, 6.43], //11/17/15
                [1447837200000, 6.74], //11/18/15
                [1447923600000, 6.10], //11/19/15
                [1448010000000, 10.82], //11/20/15

                [1448269200000, 6.99], //11/23/15
                [1448355600000, 9.16], //11/24/15
                [1448442000000, 4.75], //11/25/15

                [1448614800000, 14.91], //11/27/15

                [1448874000000, 16.56], //11/30/15
                [1448960400000, 8.90], //12/01/15
                [1449046800000, 7.79], //12/02/15
                [1449133200000, 10.45], //12/03/15
                [1449219600000, 8.77], //12/04/15

                [1449478800000, 6.74], //12/07/15
                [1449565200000, 7.48], //12/08/15
                [1449651600000, 9.05], //12/09/15
                [1449738000000, 7.03], //12/10/15
                [1449824400000, 12.33], //12/11/15

                [1450083600000, 9.70], //12/14/15
                [1450170000000, 13.36], //12/15/15
                [1450256400000, 12.30], //12/16/15
                [1450342800000, 9.38], //12/17/15
                [1450429200000, 28.38], //12/18/15

                [1450688400000, 22.85], //12/21/15
                [1450774800000, 8.64], //12/22/15
                [1450861200000, 12.37], //12/23/15
                [1450947600000, 4.36], //12/24/15

                [1451293200000, 9.09], //12/28/15
                [1451379600000, 8.61], //12/29/15
                [1451466000000, 4.92], //12/30/15
                [1451552400000, 6.67], //12/31/15

                [1451898000000, 12.53], //01/04/16
                [1451984400000, 16.21], //01/05/16
                [1452070800000, 13.93], //01/06/16
                [1452157200000, 14.68], //01/07/16
                [1452243600000, 10.69], //01/08/16

                [1452502800000, 9.58], //01/11/16
                [1452589200000, 8.86], //01/12/16
                [1452675600000, 11.62], //01/13/16
                [1452762000000, 11.15], //01/14/16
                [1452848400000, 22.34], //01/15/16

                [1453194000000, 13.29], //01/19/16
                [1453280400000, 16.92], //01/20/16
                [1453366800000, 12.08], //01/21/16
                [1453453200000, 12.30], //01/22/16

                [1453712400000, 7.81], //01/25/16
                [1453798800000, 6.92], //01/26/16
                [1453885200000, 6.33], //01/27/16
                [1453971600000, 7.31], //01/28/16
                [1454058000000, 8.21] //01/29/16
            ]
        }
    ]
};

$(function() {
    zingchart.render({
        id : 'marketChart',
        data : myConfigCandleSticks,
        height: "100%",
        width: "100%"
    });
});
