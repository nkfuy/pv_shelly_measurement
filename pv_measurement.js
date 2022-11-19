let CONFIG = {
    'INPUT_ID': 0,          // Input Channel des Shelly
    'CONTROL_TIMER': 2000,  // Intervall zur Messwerterhebung in Millisekunden
    'POWER_RECORDS': [0, 0, 0],   // Anzahl Werte für Durchschnittsbildung
    'NUMBER_ARRAY_VAL': 2,   // Letzter Index vom Array (0, 1, 2)
    'POWER_THRESHOLD': 9,      // in Watt
    'SWITCH_STAT': false    // Zutand des Schalters beim Initialisieren des Skripts
  };

  let currentPowerMeasurement = 0.0;  // speichert aktuelle Leistung in Watt
  let itter = 0;      // Itteriert von Null an

  Timer.set(CONFIG.CONTROL_TIMER, true, function(ud){

    let avgPower = 0;  // Speicherung der aktuellen durchschnittlichen Leistung über die letzten Messungen

    Shelly.call(
      "switch.GetStatus", {id: CONFIG.INPUT_ID}, function(result, error_code, error_message, ud)
      {
        currentPowerMeasurement = JSON.parse(JSON.stringify(result["apower"]))
      }
    );

    CONFIG.POWER_RECORDS[itter] = currentPowerMeasurement;    // Speichert den aktuellen Messwert in das Feld mit dem gesetzten Index
    itter = itter + 1;          // Setzt den Index auf den nächsten Wert
    if (itter === CONFIG.NUMBER_ARRAY_VAL + 1){itter = 0}   // Prüft ob der Indexgrößer ist als das Array

    for (let i = 0; i <= CONFIG.NUMBER_ARRAY_VAL; i++) {   // Summiert Array Werte für Durchschnittsprüfung
      avgPower += CONFIG.POWER_RECORDS[i];
    }

    if ((avgPower / (CONFIG.NUMBER_ARRAY_VAL + 1)) > CONFIG.POWER_THRESHOLD && CONFIG.SWITCH_STAT === false){   //
      CONFIG.SWITCH_STAT = true      // Schalter einbauen
      Shelly.call("Switch.Set", { id: CONFIG.INPUT_ID, on:false },null,null);
      print("an", avgPower, CONFIG.POWER_RECORDS[2])
      Shelly.call("HTTP.GET", { url: "http://192.168.178.59/rpc/Script.Start?id=2" },
        function (res, error_code, error_msg, ud) {
        if (res.code === 200) {
            print("Successfully transmitted a message");
        };
      },
      null);
      Shelly.call("HTTP.GET", { url: "http://192.168.178.59/rpc/Script.Stop?id=2" },
        function (res, error_code, error_msg, ud) {
        if (res.code === 200) {
            print("Successfully transmitted a message");
        };
      },
      null);
    }
    else if ((avgPower / (CONFIG.NUMBER_ARRAY_VAL + 1)) < CONFIG.POWER_THRESHOLD && CONFIG.SWITCH_STAT === true){
      CONFIG.SWITCH_STAT = false

      Shelly.call("Switch.Set", { id: CONFIG.INPUT_ID, on:true},null,null);
      print("aus", avgPower, CONFIG.POWER_RECORDS[2])    // Schalter einbauen
      Shelly.call("HTTP.GET", { url: "http://192.168.178.59/rpc/Script.Start?id=1" },
        function (res, error_code, error_msg, ud) {
        if (res.code === 200) {
            print("Successfully transmitted a message");
        };
      },null);

        Shelly.call("HTTP.GET", { url: "http://192.168.178.59/rpc/Script.Stop?id=1" },
        function (res, error_code, error_msg, ud) {
        if (res.code === 200) {
            print("Successfully transmitted a message");
        };
      },null);
   }
  }, null
  );
