Shelly.call("Switch.Set", "{ id:0, on:true }", null,null);


let notifyTimer = Timer.set(
    1000,
    true,
    function() {
      Shelly.call("switch.GetStatus", {id: CONFIG.INPUT_ID}, function(result, error_code, error_message, ud)
        {power = JSON.parse(JSON.stringify(result["apower"]))});
      MQTT.publish("power", power, 0, false);
    }
  );
