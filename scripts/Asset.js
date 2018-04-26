/**
 * Asset on Stellar ledger
 */
function Asset(code, fullName, type, account) {
    this.AssetCode = code || "XLM";
    this.FullName = fullName;
    this.AssetType = type;
    this.Issuer = account.Address;

    this.ToUrlParameters = function(prefix) {
        var getParams = prefix + "_asset_code=" + this.AssetCode + "&" + prefix + "_asset_type=" + this.AssetType;
        if (this.Issuer) {
            getParams += "&" + prefix + "_asset_issuer=" + this.Issuer;
        }

        return getParams;
    };
}


var KnownAssets = {
    "XLM" : new Asset("XLM", "Lumen", "native", {Address:null}),
    "BAT" : new Asset("BAT", "Basic Attention Token", "credit_alphanum4", KnownAccounts.Papaya1),
    "BCH-Papaya" : new Asset("BCH", "Bitcoin Cash", "credit_alphanum4", KnownAccounts.Papaya4),
    "BTC-Golix" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Golix),
    "BTC-Liquido" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Liquido),
    "BTC-NaoBTC" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.NaoBTC),
    "BTC-Papaya" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Papaya2),
    "BTC-Stronghold" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Stronghold),
    "BTC-vcbear" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.VcBearBTC),
    "CHRC" : new Asset("CHRC", "Charna Token", "credit_alphanum4", KnownAccounts.CharnaToken),
    "CM3" : new Asset("CM3", "Crypto Mover Token 3", "credit_alphanum4", KnownAccounts.CryptoMover3),
    "CM10" : new Asset("CM10", "Crypto Mover Token 10", "credit_alphanum4", KnownAccounts.CryptoMover10),
    "CMA" : new Asset("CMA", "Crypto Mover Token A", "credit_alphanum4", KnownAccounts.CryptoMoverA),
    "CNY-RippleFox" : new Asset("CNY", "Chinese Yuan", "credit_alphanum4", KnownAccounts.RippleFox),
    "COP" : new Asset("COP", "Colombian Pesos", "credit_alphanum4", KnownAccounts.Anclax),
    "EQD" : new Asset("EQD", "eQuid", "credit_alphanum4", KnownAccounts.eQuid),
    "ETH-Liquido" : new Asset("ETH", "Ethereum", "credit_alphanum4", KnownAccounts.Liquido),
    "ETH-Papaya" : new Asset("ETH", "Ethereum", "credit_alphanum4", KnownAccounts.Papaya1),
    "ETH-Stronghold" : new Asset("ETH", "Ethereum", "credit_alphanum4", KnownAccounts.Stronghold),
    "EUR-Moni" : new Asset("EUR", "Euro", "credit_alphanum4", KnownAccounts.Moni),
    "EURT" : new Asset("EURT", "Euro", "credit_alphanum4", KnownAccounts.Tempo),
    "ICN" : new Asset("ICN", "Iconomi", "credit_alphanum4", KnownAccounts.Papaya1),
    "JPY" : new Asset("JPY", "Japanese Yen", "credit_alphanum4", KnownAccounts.VcBearJPY),
    "KIN-Papaya" : new Asset("KIN", "Kin token", "credit_alphanum4", KnownAccounts.Papaya1),
    "LINK" : new Asset("LINK", "ChainLink", "credit_alphanum4", KnownAccounts.Papaya1),
    "LTC-Liquido" : new Asset("LTC", "Litecoin", "credit_alphanum4", KnownAccounts.Liquido),
    "LTC-Papaya" : new Asset("LTC", "Litecoin", "credit_alphanum4", KnownAccounts.Papaya3),
    "MOBI" : new Asset("MOBI", "Mobius", "credit_alphanum4", KnownAccounts.Mobius),
    "MTL" : new Asset("MTL", "MetalPay token", "credit_alphanum4", KnownAccounts.Papaya1),
    "NGNT" : new Asset("NGNT", "Nigerian naira", "credit_alphanum4", KnownAccounts.Cowrie),
    "OMG" : new Asset("OMG", "OmiseGO", "credit_alphanum4", KnownAccounts.Papaya1),
    "PHP" : new Asset("PHP", "Philippine peso", "credit_alphanum4", KnownAccounts.CoinsAsia),
    "REP" : new Asset("REP", "Augur reputation token", "credit_alphanum4", KnownAccounts.Papaya1),
    "REPO" : new Asset("REPO", "RepoCoin", "credit_alphanum4", KnownAccounts.RepoCoin),
    "RMT": new Asset("RMT", "SureRemit token", "credit_alphanum4", KnownAccounts.SureRemit),
    "SALT" : new Asset("SALT", "SALT", "credit_alphanum4", KnownAccounts.Papaya1),
    "SLT" : new Asset("SLT", "Smartlands token", "credit_alphanum4", KnownAccounts.SmartLands),
    "STEM" : new Asset("STEM", "STEMchain", "credit_alphanum4", KnownAccounts.StemChain),
    "TARI" : new Asset("TARI", "CryptoTARI", "credit_alphanum4", KnownAccounts.CryptoTari),
    "TELLUS" : new Asset("TELLUS", "Irene.energy TELLUS", "credit_alphanum12", KnownAccounts.IreneEnergy),
    "USD-Golix" : new Asset("USD", "US dollar", "credit_alphanum4", KnownAccounts.Golix),
    "XA9" : new Asset("XA9", "Astral", "credit_alphanum4", KnownAccounts.Astral9),
    "XEL" : new Asset("XEL", "NaoBTC XEL", "credit_alphanum4", KnownAccounts.NaoXEL),
    "XIM" : new Asset("XIM", "Ximcoin", "credit_alphanum4", KnownAccounts.XimCoin),
    "XIR" : new Asset("XIR", "Xirkle coin", "credit_alphanum4", KnownAccounts.Xirkle),
    "XLM-Stronghold" : new Asset("XLM", "???", "credit_alphanum4", KnownAccounts.Stronghold),     //WTF?
    "XLQ": new Asset("XLQ", "Liquido", "credit_alphanum4", KnownAccounts.Liquido),
    "XRP": new Asset("XRP", "Ripple", "credit_alphanum4", KnownAccounts.VcBearXRP),
    "XTC": new Asset("XTC", "Tai Chi Chain", "credit_alphanum4", KnownAccounts.TaiChiChain),
    "ZRX": new Asset("ZRX", "0x token", "credit_alphanum4", KnownAccounts.Papaya1)
};