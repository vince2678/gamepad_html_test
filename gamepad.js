'use strict';

var gamepads = {}

function getGamepads()
{
    return gamepads;
}

function detectGamepad()
{
    window.addEventListener("gamepadconnected", function(e) {
         gamePadHandler(e, true)
        });

    window.addEventListener("gamepaddisconnected", function(e) {
        gamePadHandler(e, false)
    });

    updateGamepadHtml();
}

function updateGamepadHtml()
{
    var element = document.getElementById("content")
    let values = Object.values(gamepads)

    if (values.length == 0)
    {
        element.innerHTML = "<p>No gamepads detected. Press a button when a gamepad is connected</p>"
        return;
    }

    element.innerHTML = ""

    for (let i = 0; i < values.length; i++)// gamepad in values)
    {
        let gamepad = values[i]

        var gamepad_div = document.createElement("div");
        gamepad_div.id = "gamepad-" + gamepad.index
        gamepad_div.className = "gamepad"

        var text = document.createElement("p");
        text.innerText = "Gamepad " + gamepad.index + ": " + gamepad.id

        var input_div = document.createElement("div");
        input_div.id = "input-" + gamepad.index
        input_div.className = "input"

        var intensity_txt = document.createElement("input");
        intensity_txt.className = "intensity_txt"
        intensity_txt.id = "intensity-" + gamepad.index
        intensity_txt.type = "text"
        intensity_txt.value = "1.0"

        var duration_txt = document.createElement("input");
        duration_txt.className = "duration_txt"
        duration_txt.id = "duration-" + gamepad.index
        duration_txt.type = "text"
        duration_txt.value = "3"

        var interval_txt = document.createElement("input");
        interval_txt.className = "interval_txt"
        interval_txt.id = "interval-" + gamepad.index
        interval_txt.type = "text"
        interval_txt.value = "-1"

        var button_div = document.createElement("div");
        button_div.id = "button-" + gamepad.index
        button_div.className = "button"

        var pulsebtn = document.createElement("button");
        pulsebtn.className = "pulse_button"
        pulsebtn.innerText = "Pulse"
        pulsebtn.id = "pulsebtn-" + gamepad.index

        var stopbtn = document.createElement("button");
        stopbtn.className = "stop_button"
        stopbtn.innerText = "Stop pulse"
        stopbtn.id = "stopbtn-" + gamepad.index

        pulsebtn.onclick = function(ev) {
            let intensity = parseFloat(intensity_txt.value)
            let duration = parseFloat(duration_txt.value)
            //let intensity = parseFloat(document.getElementById("intensity-" + gamepad.index).value)
            //let duration = parseInt(document.getElementById("duration-" + gamepad.index).value)

            if (intensity < 0 || duration < 0)
            {
                alert("Enter valid values for intensity (0.0 - 1.0) and duration (> 0). Entered " + intensity + ", " + duration)
                return
            }

            var e = function(i , d) {
                var f = function() {
                    let interval = parseFloat(interval_txt.value)
                    if (interval == undefined || interval < 0)
                    {
                        return false;
                    }
                    else if (interval > 0)
                    {
                        vibrate(gamepad, 0, interval * 1000, function(b) {
                            e(i, d)
                        });
                    }
                    else
                    {
                        e(i, d)
                    }

                    return true;
                }

                console.log("Pulsing %i (%s) at %f for %ds", gamepad.index, gamepad.id, i, d)
                vibrate(gamepad, i, d * 1000, function(b) {
                    f();
                });
            }

            e(intensity, duration)
        };

        input_div.appendChild(intensity_txt)
        input_div.appendChild(duration_txt)
        input_div.appendChild(interval_txt)

        button_div.appendChild(pulsebtn)
        button_div.appendChild(stopbtn)

        gamepad_div.appendChild(text)
        gamepad_div.appendChild(input_div)
        gamepad_div.appendChild(button_div)
        element.appendChild(gamepad_div)
    }
}

function gamePadHandler(e, connecting)
{
    var gamepad = e.gamepad

    if (connecting)
    {
        console.log("Gamepad connected at index %d : %s", gamepad.index, gamepad.id)
        gamepads[gamepad.index] = gamepad
    }
    else
    {
        console.log("Gamepad disconnected at index %d: %s", gamepad.index, gamepad.id)
        delete gamepads[gamepad.index]
        //gamepads[gamepad.index] = undefined
    }

    updateGamepadHtml()
}

function vibrate(gamepad, intensity, duration, callback = undefined)
{
    var actuator = gamepad.vibrationActuator

    if (!actuator)
    {
        return;
    }

    let settings = {
        "duration": duration,
        "strongMagnitude": intensity,
        "weakMagnitude": intensity
    }

    actuator.playEffect("dual-rumble", settings).then(function(result) {
        if (result)
        {
            console.log("Pulsed gamepad %d, actuator %s at intensity %f for %d ms", gamepad.index, actuator.type, intensity, duration)
        }
        else
        {
            console.error("Failed to pulse gamepad %d, actuator %s", gamepad.index, actuator.type)
        }

        if (callback)
        {
            callback(result)
        }
    });
}

function init(_e)
{
    detectGamepad();
}

window.onload = init
//init()